import classnames from "classnames"
import { ComponentProps } from "solid-js"
import TableRow from "./Table.Row"
import "./Table.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  striped?: boolean
  hoverable?: boolean
  scrollable?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "table": true,
        "table-striped": props.striped,
        "table-hover": props.hoverable,
        "table-scroll": props.scrollable,
      })
    },
  }
})

function Table(props: Props & ComponentProps<"table">) {
  const [_props, _children] = createProps(props)

  return (
    <table {..._props}>
      {_children()}
    </table>
  )
}

export default Object.assign(Table, {
  createProps,
  Row: TableRow,
})
