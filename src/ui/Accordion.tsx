import classnames from "classnames"
import { ComponentProps, JSX, splitProps } from "solid-js"
import AccordionRadioGroup from "./Accordion.RadioGroup"
import "./Accordion.scss"
import Icon from "./Icon"
import iconArrowDown from "./icons/iconArrowDown"
import iconArrowRight from "./icons/iconArrowRight"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { float, marginR } from "./util/position"
import { text } from "./util/text"

type Props = {
  vertical?: boolean

  header?: JSX.Element
  headerIcon?: boolean
  headerIconFloatRight?: boolean
  isDefault?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "accordion": !props.vertical,
        "divider-vert": props.vertical,
        ...text("center"),
      })
    },
  }
})

function Accordion(props: Props & ComponentProps<"details">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  // TODO: const radioGroup = useContext(AccordionRadioGroup)
  // TODO: isDefault

  return (
    <details {..._props}>
      <summary class="accordion-header" style={{ "cursor": "pointer" }}>
        {props.headerIcon && (
          <Icon src={props.open ? iconArrowDown : iconArrowRight} classList={{ ...marginR(1), ...float(props.headerIconFloatRight ? "right" : undefined) }} />
        )}
        {props.header}
      </summary>
      <div class="accordion-body">
        {fml.children}
      </div>
    </details>
  )
}

export default Object.assign(Accordion, {
  createProps,
  RadioGroup: AccordionRadioGroup,
})
