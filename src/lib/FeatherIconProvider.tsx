import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import iconChevronDown from "../icons/iconChevronDown"
import iconChevronLeft from "../icons/iconChevronLeft"
import iconChevronRight from "../icons/iconChevronRight"
import iconChevronUp from "../icons/iconChevronUp"
import iconExternalLink from "../icons/iconExternalLink"
import iconImage from "../icons/iconImage"
import iconMenu from "../icons/iconMenu"
import iconSearch from "../icons/iconSearch"
import iconX from "../icons/iconX"
import createHTMLMemoHook from "../ui/util/createHTMLMemoHook"
import "./FeatherIconProvider.scss"

type Props =  ComponentProps<"i"> & {
  src?: string
  size?: string | "sm" | "md" | "lg" | "xl"
  color?: string
  weight?: string | "light" | "normal" | "bold"
}

const convertSize = (size: Props["size"]) => {
  switch (size) {
  case "sm":
    return "22px"
  case "md":
    return "30px"
  case "lg":
    return "40px"
  case "xl":
    return "52px"
  default:
    return size
  }
}

const convertWeight = (weight: Props["weight"]) => {
  switch (weight) {
  case "light":
    return "1px"
  case "normal":
    return "2px"
  case "bold":
    return "3px"
  default:
    return weight
  }
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "spectre-icon": true,
      })
    },
    get style() {
      return {
        ...(props.style as {}),
        ...(props.color ? { "color": props.color } : {}),
        ...(props.size ? { "--feather-size": convertSize(props.size) } : {}),
        ...(props.weight ? { "--feather-weight": convertWeight(props.weight) } : {}),
      }
    },
  }
})

function Icon(props: Props) {
  const [fml, _props] = splitProps(props, ["src"])
  const [__props] = createProps(_props)

  return (
    // eslint-disable-next-line solid/no-innerhtml
    <i {...__props} innerHTML={fml.src} />
  )
}

export default Object.assign(Icon, {
  createProps,
  iconArrowLeft: iconChevronLeft,
  iconArrowRight: iconChevronRight,
  iconArrowUp: iconChevronUp,
  iconArrowDown: iconChevronDown,
  iconPhoto: iconImage,
  iconCross: iconX,
  iconMenu: iconMenu,
  iconOpen: iconExternalLink,
  iconSearch: iconSearch,
})
