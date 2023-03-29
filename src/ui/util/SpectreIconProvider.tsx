import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
// import iconArrowDown from "../icons/iconArrowDown"
// import iconArrowLeft from "../icons/iconArrowLeft"
// import iconArrowRight from "../icons/iconArrowRight"
// import iconCross from "../icons/iconCross"
// import iconMenu from "../icons/iconMenu"
// import iconOpen from "../icons/iconOpen"
// import iconPhoto from "../icons/iconPhoto"
// import iconSearch from "../icons/iconSearch"
import createHTMLMemoHook from "./createHTMLMemoHook"
import "./SpectreIconProvider.scss"

type Props = ComponentProps<"i"> & {
  src?: string
  size?: string | "sm" | "md" | "lg" | "xl"
  color?: string
}

const convertSize = (size: Props["size"]) => {
  switch (size) {
  case "sm":
    return "1x"
  case "md":
    return "2x"
  case "lg":
    return "3x"
  case "xl":
    return "4x"
  default:
    return size
  }
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "spectre-icon": !!props.src,
        [props.src ?? ""]: true,
        [`icon-${convertSize(props.size)}`]: !!props.size,
      })
    },
    get style() {
      return {
        ...(props.style as {}),
        "color": props.color,
      }
    },
  }
})

function Icon(props: Props) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <i {..._props}>
      {fml.children}
    </i>
  )
}

export default Object.assign(Icon, {
  createProps,
  // iconArrowDown: iconArrowDown,
  // iconArrowRight: iconArrowRight,
  // iconArrowLeft: iconArrowLeft,
  // iconPhoto: iconPhoto,
  // iconCross: iconCross,
  // iconMenu: iconMenu,
  // iconOpen: iconOpen,
  // iconSearch: iconSearch,
})
