import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import CalendarBody from "./Calendar.Body"
import CalendarContainer from "./Calendar.Container"
import CalendarDate from "./Calendar.Date"
import CalendarDateItem from "./Calendar.DateItem"
import CalendarHeader from "./Calendar.Header"
import CalendarNavbar from "./Calendar.Navbar"
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

function Calendar(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(Calendar, {
  createProps,
  Navbar: CalendarNavbar,
  Container: CalendarContainer,
  Header: CalendarHeader,
  Body: CalendarBody,
  Date: CalendarDate,
  DateItem: CalendarDateItem,
})
