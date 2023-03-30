import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Calendar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  isRange?: boolean
  isRangeStart?: boolean
  isRangeEnd?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "calendar-date": true,
        "calendar-range": !!props.isRange,
        "range-start": !!props.isRangeStart,
        "range-end": !!props.isRangeEnd,
      })
    },
  }
})

function CalendarDate(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(CalendarDate, {
  createProps,
})
