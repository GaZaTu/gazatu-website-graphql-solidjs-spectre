import classnames from "classnames"
import { ComponentProps } from "solid-js"
import PaginationItem from "./Pagination.Item"
import "./Pagination.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "pagination": true,
      })
    },
  }
})

function Pagination(props: Props & ComponentProps<"ul">) {
  const [_props, _children] = createProps(props)

  return (
    <ul {..._props}>
      {_children()}
    </ul>
  )
}

export default Object.assign(Pagination, {
  createProps,
  Item: PaginationItem,
})
