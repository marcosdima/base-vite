import { useSelector } from 'react-redux'
import { selectAuthToken, selectAuthUser } from '../features/auth/authSlice'
import {
  Card,
  CardNote,
  CardTitle,
  InfoRow,
  Label,
  Page,
  Value,
} from '../styles/pages/dashboardPage.styles'


export function DashboardPage() {
  const authUser = useSelector(selectAuthUser)
  const authToken = useSelector(selectAuthToken)

  return (
    <Page>
      <Card>
        <CardTitle>Dashboard</CardTitle>
        <CardNote>Protected route — connected to the Redux store.</CardNote>

        <InfoRow>
          <Label>Name</Label>
          <Value>{authUser?.name ?? '—'}</Value>
        </InfoRow>

        <InfoRow>
          <Label>Email</Label>
          <Value>{authUser?.email ?? '—'}</Value>
        </InfoRow>

        <InfoRow>
          <Label>Token</Label>
          <Value>{authToken ? `${authToken.slice(0, 20)}…` : 'No token'}</Value>
        </InfoRow>
      </Card>
    </Page>
  )
}