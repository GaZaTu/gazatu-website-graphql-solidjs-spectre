import classnames from "classnames"
import { ComponentProps } from "solid-js"
import EmptyAction from "./Empty.Action"
import EmptyHeader from "./Empty.Header"
import EmptyIcon from "./Empty.Icon"
import "./Empty.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "empty": true,
      })
    },
  }
})

function Empty(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(Empty, {
  createProps,
  Action: EmptyAction,
  Header: EmptyHeader,
  Icon: EmptyIcon,
})
