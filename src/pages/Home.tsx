import { Component } from "solid-js"
import { setShowAppNav } from "../AppNav"
import Button from "../ui/Button"
import Container from "../ui/Container"
import { setColorScheme } from "../ui/util/colorScheme"

const Home: Component = () => {
  return (
    <Container>
      <Button.Group>
        <Button onclick={() => setColorScheme("dark")}>Dark</Button>
        <Button onclick={() => setColorScheme("light")}>Light</Button>
      </Button.Group>

      <Button.Group>
        <Button onclick={() => setShowAppNav(true)}>Show AppNav</Button>
        <Button onclick={() => setShowAppNav(false)}>Hide AppNav</Button>
      </Button.Group>
    </Container>
  )
}

export default Home
