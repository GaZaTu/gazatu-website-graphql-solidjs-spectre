import classnames from "classnames"
import { ComponentProps, For, splitProps } from "solid-js"
import "./Breadcrumbs.scss"
import childrenArray from "./util/childrenArray"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "breadcrumbs": true,
      })
    },
  }
})

function Breadcrumbs(props: Props & ComponentProps<"ul">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  const resolvedChildren = childrenArray(() => fml.children)

  return (
    <ul {..._props}>
      <For each={resolvedChildren()}>
        {child => (
          <li class="breadcrumb-item">{child}</li>
        )}
      </For>
    </ul>
  )
}

export default Object.assign(Breadcrumbs, {
  createProps,
})
