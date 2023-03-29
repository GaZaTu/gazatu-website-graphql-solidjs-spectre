import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Column.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  gaps?: "sm" | "md" | "none"
  oneline?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "columns": true,
        [`col-gaps-${props.gaps ?? "md"}`]: !!props.gaps,
      })
    },
  }
})

function ColumnRow(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(ColumnRow, {
  createProps,
})
