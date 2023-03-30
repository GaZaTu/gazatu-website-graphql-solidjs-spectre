import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Calendar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "calendar": true,
      })
    },
  }
})

function CalendarBody(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(CalendarBody, {
  createProps,
})
