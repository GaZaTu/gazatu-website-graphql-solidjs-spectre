import { createIntersectionObserver } from "@solid-primitives/intersection-observer"
import { Title } from "@solidjs/meta"
import { useLocation } from "@solidjs/router"
import { Component, ComponentProps, createEffect, createMemo, createSignal, For } from "solid-js"
import { defaultFetchInfo } from "../../lib/fetchFromApi"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { BlogEntry, Query } from "../../lib/schema.gql"
import A from "../../ui/A"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Figure from "../../ui/Figure"
import Icon from "../../ui/Icon"
import iconArrowLeft from "../../ui/icons/iconArrowLeft"
import iconArrowRight from "../../ui/icons/iconArrowRight"
import ImgWithPlaceholder from "../../ui/ImgWithPlaceholder"
import Modal from "../../ui/Modal"
import ModalPortal from "../../ui/Modal.Portal"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import { createTableState } from "../../ui/Table.Helpers"
import Toaster from "../../ui/Toaster"
import { centerSelf } from "../../ui/util/position"
import "./BlogGallery.scss"

const BlogGalleryView: Component = () => {
  const [tableState, setTableState] = createTableState({
    pagination: {
      pageIndex: 0,
      pageSize: 50,
    },
  })

  const response = createGraphQLResource<Query>({
    query: gql`
      query ($args: BlogEntryListConnectionArgs) {
        blogEntryListConnection(args: $args) {
          slice {
            id
            story
            title
            message
            imageFileExtension
            imageWidth
            imageHeight
            createdAt
          }
          pageCount
        }
      }
    `,
    variables: {
      args: {
        get offset() {
          return (tableState.pagination?.pageIndex ?? 0) * (tableState.pagination?.pageSize ?? 0)
        },
        get limit() {
          return tableState.pagination?.pageSize ?? 0
        },
      },
    },
    onError: Toaster.pushError,
    infinite: (prev, next) => {
      const prevArray = prev?.blogEntryListConnection?.slice ?? []
      const nextArray = next.blogEntryListConnection?.slice

      nextArray?.unshift(...prevArray)
      return next
    },
  })

  createGlobalProgressStateEffect(() => response.loading)

  const groups = createMemo(() => {
    return response.data?.blogEntryListConnection?.slice
      ?.map((entry, index, entries) => {
        return {
          ...entry,
          prevEntryId: entries[index - 1]?.id,
          nextEntryId: entries[index + 1]?.id,
        }
      })
      ?.reduce((groups, entry) => {
        const date = new Date(entry.createdAt as any)
        const dateISOString = date.toISOString()
        const dateDay = dateISOString.slice(0, "yyyy-MM-dd".length)

        groups[dateDay] = groups[dateDay] ?? []
        groups[dateDay].push(entry as any)

        return groups
      }, {} as Record<string, LinkedBlogEntry[]>)
  })

  const [targets, setTargets] = createSignal<HTMLElement[]>([])
  createIntersectionObserver(targets, entries => {
    if (response.loading || (tableState.pagination?.pageIndex ?? 0) >= (response.data?.blogEntryListConnection?.pageCount ?? 0)) {
      return
    }

    const lastTarget = targets()[targets().length - 1]
    if (!lastTarget) {
      return
    }

    if (!entries.find(e => e.target === lastTarget)?.isIntersecting) {
      return
    }

    setTableState(state => ({
      ...state,
      pagination: {
        pageIndex: (state.pagination?.pageIndex ?? 0) + 1,
        pageSize: (state.pagination?.pageSize ?? 0),
      },
    }))
  })

  return (
    <>
      <Section size="xl" marginY>
        <Title>Blog</Title>
        <h3>Blog</h3>
      </Section>

      <Section size="xl" marginY flex style={{ "flex-grow": 1 }}>
        <For each={Object.entries(groups() ?? {})}>
          {([date, entries]) => (
            <BlogEntryGroup ref={el => setTargets(s => [...s, el])} date={date} entries={entries} refresh={response.refresh} />
          )}
        </For>
      </Section>
    </>
  )
}

export default BlogGalleryView

type LinkedBlogEntry = BlogEntry & {
  prevEntryId?: string
  nextEntryId?: string
}

type BlogEntryPreviewProps = {
  entry: LinkedBlogEntry
}

const BlogEntryPreview: Component<BlogEntryPreviewProps> = props => {
  // const isAdmin = createAuthCheck("admin")

  const location = useLocation()

  // const handleRemove = (id: string) => {
  //   return async () => {
  //     if (!await ModalPortal.confirm("Delete the selected blog entries?")) {
  //       return
  //     }

  //     await Toaster.try(async () => {
  //       await removeBlogEntries([id])
  //       response.refresh()
  //     })
  //   }
  // }

  createEffect(() => {
    if (location.query.entry !== props.entry.id) {
      return
    }

    ModalPortal.push(modal => (
      <Modal size="md" onclose={modal.resolve} oncloseHref="" active style={{ padding: "unset", "max-width": "1440px" }}>
        <Modal.Body style={{ padding: "unset", overflow: "unset" }}>
          <Figure class="blog-entry-image">
            <Button.A href="" params={{ entry: props.entry.prevEntryId }} onclick={modal.resolve} keepExistingParams class="go-left" disabled={!props.entry.prevEntryId} action circle color="primary">
              <Icon src={iconArrowLeft} />
            </Button.A>
            <Button.A href="" params={{ entry: props.entry.nextEntryId }} onclick={modal.resolve} keepExistingParams class="go-right" disabled={!props.entry.nextEntryId} action circle color="primary">
              <Icon src={iconArrowRight} />
            </Button.A>

            <ImgWithPlaceholder src={`${defaultFetchInfo()}/blog/entries/${props.entry.id}/image.${props.entry.imageFileExtension}`} alt="" responsive classList={{ ...centerSelf(true) }} useFetch />

            <Figure.Caption>
              <h4>{props.entry.story}</h4>
              <h5>{props.entry.title}</h5>
              <p style={{ "white-space": "pre-wrap" }}>{props.entry.message}</p>
            </Figure.Caption>
          </Figure>
        </Modal.Body>
      </Modal>
    ))
  })

  return (
    <Figure class="preview">
      <A href="" params={{ entry: props.entry.id }} keepExistingParams>
        <ImgWithPlaceholder src={`${defaultFetchInfo()}/blog/entries/${props.entry.id}/preview.webp`} alt="" responsive style={{ "--width": props.entry.imageWidth ?? 0, "--height": props.entry.imageHeight ?? 0 }} />
      </A>
    </Figure>
  )
}

type BlogEntryGroupProps = {
  ref?: ComponentProps<typeof Section>["ref"]
  date: string
  entries: LinkedBlogEntry[]
  refresh: () => void
}

const BlogEntryGroup: Component<BlogEntryGroupProps> = props => {
  return (
    <Section ref={props.ref} marginY>
      <h5>{props.date}</h5>
      <Column.Row gaps="md">
        <For each={props.entries}>
          {entry => (
            <Column class="preview-column">
              <BlogEntryPreview entry={entry} />
            </Column>
          )}
        </For>
      </Column.Row>
    </Section>
  )
}
