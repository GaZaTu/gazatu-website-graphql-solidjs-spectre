import { children, ComponentProps } from "solid-js"
import "./Breadcrumbs.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "breadcrumbs": true,
    },
  }
})

function Breadcrumbs(props: Props & ComponentProps<"ul">) {
  const [_props, _children] = createProps(props)

  const resolvedChildren = children(_children)

  return (
    <ul {..._props}>
      {(() => {
        let children = resolvedChildren()
        if (!Array.isArray(children)) {
          children = [children]
        }

        return children.map(child => (
          <li class="breadcrumb-item">{child}</li>
        ))
      })()}
    </ul>
  )
}

export default Object.assign(Breadcrumbs, {
  createProps,
})
