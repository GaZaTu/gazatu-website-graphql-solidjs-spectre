import { Component, createEffect, createSignal } from "solid-js"
import { setShowAppHeader, showAppHeader } from "../AppHeader"
import Autocomplete from "../ui/Autocomplete"
import Button from "../ui/Button"
import Column from "../ui/Column"
import LoadingPlaceholder from "../ui/LoadingPlaceholder"
import Navbar from "../ui/Navbar"
import Pagination from "../ui/Pagination"
import Section from "../ui/Section"
import Toaster from "../ui/Toaster"
import { badge } from "../ui/util/badge"
import { colorScheme, setColorScheme } from "../ui/util/colorScheme"
import { centerChildren } from "../ui/util/position"

const counter = { xd: 0 }

const HomeView: Component = () => {
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

  const filterable = Autocomplete.createOptions(["apple", "banana", "pear", "pineapple", "kiwi", "test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9", "test10", "test11", "test12", "test13", "test14", "test15", "test16"], {
    filterable: true,
    createable: true,
    disable: o => o.value === "banana",
  })

  const [pageIndex, setPageIndex] = createSignal(0)
  createEffect(() => {
    console.log("pageIndex", pageIndex())
  })

  return (
    <>
      <Section size="xl" withYMargin>
        <Button.Group>
          <Button onclick={() => setColorScheme(null)} active={colorScheme() === null}>System</Button>
          <Button onclick={() => setColorScheme("dark")} active={colorScheme() === "dark"}>Dark</Button>
          <Button onclick={() => setColorScheme("light")} active={colorScheme() === "light"} {...badge(5)}>Light</Button>
        </Button.Group>

        <Button.Group>
          <Button onclick={() => setShowAppHeader(true)} active={showAppHeader()}>Show AppNav</Button>
          <Button onclick={() => setShowAppHeader(false)} active={!showAppHeader()}>Hide AppNav</Button>
        </Button.Group>

        <Button.Group>
          <Button onclick={() => { throw new Error("Test") }}>Throw</Button>
          <Button onclick={() => Toaster.push({ children: `Hello World! ${counter.xd++}`, color: "success" })}>Toast</Button>
        </Button.Group>

        <Autocomplete {...filterable} multiple placeholder="test..." />

        <p>
          <LoadingPlaceholder height={"16px"} />
        </p>

        <Pagination
          pageIndex={pageIndex()}
          pageCount={20}
          // hasNext={__.context?.state.getCanNextPage() ?? false}
          // hasPrev={__.context?.state.getCanPreviousPage() ?? false}
          onPageIndexChange={page => setPageIndex(page)}
          // loading={tableProps.loading}
        />

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

export default HomeView
