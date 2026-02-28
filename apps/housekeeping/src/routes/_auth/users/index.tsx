import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Search } from 'lucide-react'

export const Route = createFileRoute('/_auth/users/')({
  component: UsersPage,
})

interface User {
  id: number
  username: string
  rank: number
  credits: number
  motto: string
  figure: string
}

interface Rank {
  id: number
  name: string
}

function UsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const take = 20

  const { data: users = [], isFetching } = useQuery({
    queryKey: ['users', search, skip],
    queryFn: () => {
      const params = new URLSearchParams({ skip: String(skip), take: String(take) })
      if (search) params.set('search', search)
      return api.get<User[]>(`/api/housekeeping/users?${params}`)
    },
  })

  const { data: ranks = [] } = useQuery({
    queryKey: ['ranks'],
    queryFn: () => api.get<Rank[]>('/api/housekeeping/ranks'),
  })

  const rankMap = new Map(ranks.map((r) => [r.id, r.name]))

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by username…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSkip(0) }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Motto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">Loading…</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">No users found</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate({ to: '/users/$userId', params: { userId: String(user.id) } })}
                >
                  <TableCell className="text-gray-500 text-xs">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.rank >= 5 ? 'default' : 'secondary'}>
                      {rankMap.get(user.rank) ?? `Rank ${user.rank}`}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.credits}</TableCell>
                  <TableCell className="text-gray-500 truncate max-w-[200px]">{user.motto}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Showing {skip + 1}–{skip + users.length}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - take))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={users.length < take} onClick={() => setSkip(skip + take)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
