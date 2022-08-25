import { Component } from "solid-js"
import { setShowAppHeader, showAppHeader } from "../AppHeader"
import Button from "../ui/Button"
import Column from "../ui/Column"
import Navbar from "../ui/Navbar"
import Section from "../ui/Section"
import { colorScheme, setColorScheme } from "../ui/util/colorScheme"
import { centerChildren } from "../ui/util/position"

const Home: Component = () => {
  // useAppFooter({
  //   position: "sticky",
  //   left: (
  //     <Column.Row>
  //       <Column classList={{ ...centerChildren(true) }}>
  //         <Button.Group>
  //           <Button onclick={() => setShowAppHeader(true)} active={showAppHeader()}>Show AppNav</Button>
  //           <Button onclick={() => setShowAppHeader(false)} active={!showAppHeader()}>Hide AppNav</Button>
  //         </Button.Group>
  //       </Column>
  //     </Column.Row>
  //   ),
  // })

  return (
    <>
      <Section size="xl" marginTop>
        <Button.Group>
          <Button onclick={() => setColorScheme(null)} active={colorScheme() === null}>System</Button>
          <Button onclick={() => setColorScheme("dark")} active={colorScheme() === "dark"}>Dark</Button>
          <Button onclick={() => setColorScheme("light")} active={colorScheme() === "light"}>Light</Button>
        </Button.Group>

        <Button.Group>
          <Button onclick={() => setShowAppHeader(true)} active={showAppHeader()}>Show AppNav</Button>
          <Button onclick={() => setShowAppHeader(false)} active={!showAppHeader()}>Hide AppNav</Button>
        </Button.Group>

        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
        <p>test</p>
      </Section>

      <Navbar.AsFooter size="sm" style={{ position: "sticky", bottom: 0 }} filled padded>
        <Section size="xl">
          <Navbar.Section>
            <Column.Row>
              <Column classList={{ ...centerChildren(true) }}>
                <Button.Group>
                  <Button onclick={() => setShowAppHeader(true)} active={showAppHeader()}>Show AppNav</Button>
                  <Button onclick={() => setShowAppHeader(false)} active={!showAppHeader()}>Hide AppNav</Button>
                </Button.Group>
              </Column>
            </Column.Row>
          </Navbar.Section>
        </Section>
      </Navbar.AsFooter>
    </>
  )
}

export default Home
