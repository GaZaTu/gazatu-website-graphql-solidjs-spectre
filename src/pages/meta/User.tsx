import { useLocation, useNavigate } from "@solidjs/router"
import { Component, createMemo, Show } from "solid-js"
import useIdFromParams from "../../lib/useIdFromParams"
import { setStoredAuth, storedAuth } from "../../store/auth"
import Button from "../../ui/Button"
import Section from "../../ui/Section"

const UserView: Component = () => {
  const location = useLocation()
  const idParam = useIdFromParams()
  const id = createMemo(() => {
    return (location.pathname === "/profile") ? storedAuth()?.user?.id : idParam
  })

  const isSelf = createMemo(() => id() === storedAuth()?.user?.id)

  const navigate = useNavigate()

  const logout = () => {
    setStoredAuth(null)
    navigate("/")
  }

  return (
    <Section size="xl" withYMargin>
      <Show when={isSelf()}>
        <Button color="warning" onclick={logout}>Logout</Button>
      </Show>
    </Section>
  )
}

export default UserView
