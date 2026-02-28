import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Users, Newspaper, Home, Wifi } from 'lucide-react'

export const Route = createFileRoute('/_auth/')({
  component: Dashboard,
})

function Dashboard() {
  const { data: users } = useQuery({
    queryKey: ['users', 'count'],
    queryFn: () => api.get<{ length: number }>('/api/housekeeping/users?take=1000'),
  })
  const { data: news } = useQuery({
    queryKey: ['news', 'list'],
    queryFn: () => api.get<unknown[]>('/api/housekeeping/news'),
  })
  const { data: rooms } = useQuery({
    queryKey: ['rooms', 'count'],
    queryFn: () => api.get<unknown[]>('/api/housekeeping/rooms?take=1000'),
  })
  const { data: online } = useQuery({
    queryKey: ['stats', 'online'],
    queryFn: () => api.get<{ count: number }>('/api/housekeeping/stats/online'),
    staleTime: 0,
    refetchInterval: 5_000,
  })

  const stats = [
    { label: 'Total Users', value: Array.isArray(users) ? users.length : '—', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'News Articles', value: Array.isArray(news) ? news.length : '—', icon: Newspaper, color: 'bg-green-50 text-green-600' },
    { label: 'Rooms', value: Array.isArray(rooms) ? rooms.length : '—', icon: Home, color: 'bg-purple-50 text-purple-600' },
    { label: 'Online Now', value: online && typeof online === 'object' && 'count' in online ? online.count : '—', icon: Wifi, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to WedCMS Housekeeping</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
              <div className={`rounded-lg p-2 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
