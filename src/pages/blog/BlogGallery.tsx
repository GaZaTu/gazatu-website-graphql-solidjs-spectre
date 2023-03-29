import { validator } from "@felte/validator-superstruct"
import { createIntersectionObserver } from "@solid-primitives/intersection-observer"
import { Title } from "@solidjs/meta"
import { useLocation } from "@solidjs/router"
import { Component, ComponentProps, createEffect, createMemo, createSignal, For } from "solid-js"
import { any, array, nullable, optional, size, string, type } from "superstruct"
import iconArrowLeft from "../../icons/iconArrowLeft"
import iconArrowRight from "../../icons/iconArrowRight"
import iconUpload from "../../icons/iconUpload"
import { defaultFetchInfo, fetchJson } from "../../lib/fetchFromApi"
import fetchGraphQL, { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { BlogEntry, BlogEntryInput, Mutation, Query } from "../../lib/schema.gql"
import superstructIsRequired from "../../lib/superstructIsRequired"
import A from "../../ui/A"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Figure from "../../ui/Figure"
import Form from "../../ui/Form"
import Icon from "../../ui/Icon"
import ImgWithPlaceholder from "../../ui/ImgWithPlaceholder"
import Input from "../../ui/Input"
import Modal from "../../ui/Modal"
import ModalPortal, { ModalComponent } from "../../ui/Modal.Portal"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import { createTableState } from "../../ui/Table.Helpers"
import Timeline from "../../ui/Timeline"
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

  const resource = createGraphQLResource<Query>({
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
    infinite: (prevData, nextData) => {
      const prev = prevData?.blogEntryListConnection
      const next = nextData.blogEntryListConnection

      // if ((tableState.pagination?.pageIndex ?? 0) === (next?.pageIndex ?? 0)) {
      //   return nextData
      // }

      next?.slice?.unshift(...(prev?.slice ?? []))
      return nextData
    },
  })

  createGlobalProgressStateEffect(() => resource.loading)

  const groups = createMemo(() => {
    return resource.data?.blogEntryListConnection?.slice
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
    if (resource.loading || (tableState.pagination?.pageIndex ?? 0) >= (resource.data?.blogEntryListConnection?.pageCount ?? 0)) {
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

  const handleUpload = async () => {
    await Toaster.try(async () => {
      await ModalPortal.push(BlogEntryUploadModal)

      resource.clear()
      resource.refresh()
    })
  }

  return (
    <>
      <Section size="xl" marginY>
        <Column.Row>
          <Column>
            <Title>Blog</Title>
            <h3>Blog</h3>
          </Column>

          <Column xxl="auto" offset="ml">
            <Button color="primary" action circle onclick={handleUpload}>
              <Icon src={iconUpload} />
            </Button>
          </Column>
        </Column.Row>
      </Section>

      <Section size="xl" marginY style={{ "padding-left": 0, "padding-right": "0.25rem" }}>
        <Timeline>
          <For each={Object.entries(groups() ?? {})}>
            {([date, entries]) => (
              <BlogEntryGroup ref={el => setTargets(s => [...s, el])} date={date} entries={entries} refresh={resource.refresh} />
            )}
          </For>
        </Timeline>
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
            <Button.A href="" params={{ entry: props.entry.prevEntryId }} onclick={modal.resolve} keepExistingParams class="go-left" disabled={!props.entry.prevEntryId} size="lg" action color="primary">
              <Icon src={iconArrowLeft} />
            </Button.A>
            <Button.A href="" params={{ entry: props.entry.nextEntryId }} onclick={modal.resolve} keepExistingParams class="go-right" disabled={!props.entry.nextEntryId} size="lg" action color="primary">
              <Icon src={iconArrowRight} />
            </Button.A>

            <A href={`${defaultFetchInfo()}/blog/entries/${props.entry.id}/image.${props.entry.imageFileExtension}`}>
              <ImgWithPlaceholder src={`${defaultFetchInfo()}/blog/entries/${props.entry.id}/image.${props.entry.imageFileExtension}`} alt="" responsive class={`${centerSelf(true)}`} useFetch />
            </A>

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
  ref?: ComponentProps<typeof Timeline.Item>["ref"]
  date: string
  entries: LinkedBlogEntry[]
  refresh: () => void
}

const BlogEntryGroup: Component<BlogEntryGroupProps> = props => {
  return (
    <Timeline.Item ref={props.ref} id={props.date}>
      <h5>{props.date}</h5>
      <Column.Row gaps="md">
        <For each={props.entries}>
          {entry => (
            <Column xxl="auto" class="preview-column">
              <BlogEntryPreview entry={entry} />
            </Column>
          )}
        </For>
      </Column.Row>
    </Timeline.Item>
  )
}

// const BlogEntryGroupPlaceholder: Component = () => {
//   return (
//     <Section size="xl" marginY>
//       <h5>
//         <LoadingPlaceholder width="8rem" height="var(--line-height)" />
//       </h5>
//       <Column.Row gaps="md">
//         <For each={new Array(4)}>
//           {() => (
//             <Column class="preview-column">
//               <Figure class="preview">
//                 <ImgWithPlaceholder responsive style={{ "--width": 200, "--height": 200 }} />
//               </Figure>
//             </Column>
//           )}
//         </For>
//       </Column.Row>
//     </Section>
//   )
// }

const BlogEntryUploadSchema = type({
  files: size(array(any()), 1, 1),
  story: size(string(), 1, 128),
  title: size(string(), 1, 128),
  message: optional(nullable(size(string(), 0, 256))),
})

const BlogEntryUploadModal: ModalComponent = modal => {
  const formSchema = BlogEntryUploadSchema
  const form = Form.createContext<BlogEntryInput & { files: File[] }>({
    extend: [validator<any>({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async _input => {
      const {
        files: [image],
        ...input
      } = _input

      const res = await fetchGraphQL<Mutation>({
        query: gql`
          mutation ($input: BlogEntryInput!) {
            blogEntrySave(input: $input) {
              id
            }
          }
        `,
        variables: { input },
      })

      try {
        await fetchJson(`/blog/entries/${res.blogEntrySave?.id}/image.webp`, {
          method: "POST",
          body: image,
        })
      } catch (error) {
        await removeBlogEntries([res.blogEntrySave!.id!])

        throw error
      }

      modal.resolve()
      return "Created new blog entry"
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
    initialValues: {
      story: new Date().toISOString().slice(0, "yyyy-MM-dd".length),
      title: new Date().toISOString().slice("yyyy-MM-dd".length + 1),
    },
  })

  return (
    <Modal onclose={modal.resolve} active>
      <Modal.Header>
        <h5>Add Blog Entry</h5>
      </Modal.Header>

      <Form context={form} horizontal>
        <Modal.Body>
          <Form.Group label="Image">
            <Input type="file" name="files" accept="image/*" />
          </Form.Group>

          <Form.Group label="Story">
            <Input type="text" name="story" ifEmpty={null} />
          </Form.Group>

          <Form.Group label="Title">
            <Input type="text" name="title" ifEmpty={null} />
          </Form.Group>

          <Form.Group label="Message">
            <Input type="text" name="message" ifEmpty={null} multiline style={{ "min-height": "calc(var(--control-height-md) * 2)" }} />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" color="primary" onclick={form.createSubmitHandler()} loading={form.isSubmitting()}>OK</Button>
          <Button color="link" onclick={modal.resolve}>Cancel</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export const removeBlogEntries = async (ids: string[]) => {
  await fetchGraphQL<Mutation>({
    query: gql`
      mutation ($ids: [String!]!) {
        blogEntryListRemoveByIds(ids: $ids)
      }
    `,
    variables: { ids },
  })
}
