import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Megaphone,
  Home,
  Settings,
  Radio,
  LogOut,
} from 'lucide-react'
import { cn } from '../lib/utils'

interface SessionUser {
  id: number
  username: string
  rank: number
  figure: string
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/rooms', label: 'Rooms', icon: Home },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/rcon', label: 'RCON', icon: Radio },
]

export function HousekeepingLayout({ user }: { user: SessionUser }) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="text-lg font-bold tracking-tight">WedCMS HK</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = exact
              ? currentPath === to
              : currentPath === to || (to !== '/' && currentPath.startsWith(to))

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${user.figure}&size=s`}
              alt={user.username}
              className="h-8 w-8 rounded-full bg-gray-700"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-400">Rank {user.rank}</p>
            </div>
          </div>
          <a
            href="/logout"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mt-1"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
