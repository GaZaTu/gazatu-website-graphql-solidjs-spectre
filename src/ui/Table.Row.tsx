import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Table.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  active?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "active": props.active,
      })
    },
  }
})

function TableRow(props: Props & ComponentProps<"tr">) {
  const [_props, _children] = createProps(props)

  return (
    <tr {..._props}>
      {_children()}
    </tr>
  )
}

export default Object.assign(TableRow, {
  createProps,
})
