import { useParams } from "@solidjs/router"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useIdFromParams = (props?: Record<string, any>, paramKey = "id", ifIsNew = "" as string | null) => {
  const params = useParams()
  const idRaw = props?.[paramKey] ?? params[paramKey]
  const idResult = idRaw === "new" ? ifIsNew : idRaw

  return idResult
}

export default useIdFromParams
