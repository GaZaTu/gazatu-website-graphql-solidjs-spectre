import { Component } from "solid-js"
import { defaultFetchInfo } from "../lib/fetchFromApi"
import { vscodeDarkPlus } from "../lib/URLSearchParamsSubtitle"
import A from "../ui/A"
import Button from "../ui/Button"
import ImgWithPlaceholder from "../ui/ImgWithPlaceholder"
import Section from "../ui/Section"
import gazatuApus from "../assets/gazatu-apus.webp"
import Column from "../ui/Column"
import { rounded } from "../ui/util/shapes"

const HomeView: Component = () => {
  return (
    <>
      <Section size="xl" marginY>
        <div>
          <ImgWithPlaceholder src={gazatuApus} alt="gazatu apus" width={500} responsive style={{ "max-width": "100%", "aspect-ratio": "auto 691 / 173" }} />
        </div>
      </Section>

      <Section size="xl" marginY>
        <Column.Row>
          <Column xxl="auto">
            <Button.A href="/trivia/questions/new" color="primary" classList={{ ...rounded("sm") }}>Submit Trivia Question</Button.A>
          </Column>

          <Column xxl="auto">
            <Button.A href="/trivia/categories/new" color="primary" classList={{ ...rounded("sm") }}>Submit Trivia Category</Button.A>
          </Column>
        </Column.Row>
      </Section>

      <Section size="xl" marginY>
        <p>API-URL for a random set of Trivia Questions: <A href={`${defaultFetchInfo()}/trivia/questions`} /></p>
        <p>Query-Parameters:</p>
        <ul>
          <li><b>shuffled</b> (<i style={{ color: vscodeDarkPlus.keyword }}>true</i>|<i style={{ color: vscodeDarkPlus.keyword }}>false</i>): enables server-side shuffle, <i>default=<span style={{ color: vscodeDarkPlus.keyword }}>true</span></i></li>
          <li><b>count</b> (<i style={{ color: vscodeDarkPlus.number }}>number</i>): amount of questions to return (does not affect shuffling)</li>
          <li><b>exclude</b> (<i>[<span style={{ color: vscodeDarkPlus.string }}>categoryName</span>,...]</i>): list of categories to exclude</li>
          <li><b>include</b> (<i>[<span style={{ color: vscodeDarkPlus.string }}>categoryName</span>,...]</i>): list of categories to include</li>
          <li><b>submitters</b> (<i>[<span style={{ color: vscodeDarkPlus.string }}>submitterName</span>,...]</i>): list of submitters to include</li>
        </ul>
        <p>Example: <A href={`${defaultFetchInfo()}/trivia/questions?count=10&exclude=[Anime,Hentai]`} /></p>
      </Section>
    </>
  )
}

export default HomeView
