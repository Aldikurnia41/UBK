// Copied from alumni
import { Container } from '@sisfo-remake/ui/container'
import { auth } from '@/lib/auth'

async function CalendarPage() {
  const userAuth = await auth()
  const user_id = userAuth?.profile.ssoId ?? ''
  const roles = (userAuth?.roles ?? [])
    .reduce((acc, { name }) => `&roles[]=${name}` + acc, '')
    .slice(1)

  return (
    <Container id='KalenderAkademik' headline='Kalender'>
      <iframe
        src={`https://portal-badiklat.kemhan.go.id/calendar?user_id=${user_id}&${roles}`}
        className='min-h-[calc(100vh-12rem)] w-full'
      />
    </Container>
  )
}

export default CalendarPage
