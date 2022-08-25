import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Img.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  gapless?: boolean
  oneline?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "columns": true,
      })
    },
  }
})

function ColumnRow(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(ColumnRow, {
  createProps,
})
