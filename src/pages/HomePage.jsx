import {
  HomeParagraph,
  HomeTitle,
  Page,
  Placeholder,
} from '../styles/pages/homePage.styles'


export function HomePage() {

  return (
    <Page>
      <Placeholder>
        <HomeTitle>Home</HomeTitle>
        <HomeParagraph>Start building here.</HomeParagraph>
      </Placeholder>
    </Page>
  )
}