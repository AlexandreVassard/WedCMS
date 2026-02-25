import { createFileRoute, redirect } from '@tanstack/react-router'
import { HousekeepingLayout } from '../components/housekeeping-layout'

interface SessionUser {
  id: number
  username: string
  rank: number
  figure: string
}

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const res = await fetch('/api/housekeeping/auth/session', { credentials: 'include' })
    if (!res.ok) {
      const loginUrl = new URL('/login', window.location.origin)
      loginUrl.searchParams.set('redirect', window.location.href)
      throw redirect({ href: loginUrl.toString() })
    }
    const user = (await res.json()) as SessionUser
    return { user }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const { user } = Route.useRouteContext()
  return <HousekeepingLayout user={user} />
}
