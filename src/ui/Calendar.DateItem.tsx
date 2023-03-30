import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Calendar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  isToday?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "date-item": true,
        "date-today": !!props.isToday,
      })
    },
  }
})

function CalendarDateItem(props: Props & ComponentProps<"button">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <button {..._props}>
      {fml.children}
    </button>
  )
}

export default Object.assign(CalendarDateItem, {
  createProps,
})
