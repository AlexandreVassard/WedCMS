import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Search, Eye, EyeOff } from 'lucide-react'

export const Route = createFileRoute('/_auth/rooms/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
    type: search.type === 'public' ? ('public' as const) : ('private' as const),
    skip: typeof search.skip === 'number' ? search.skip : 0,
  }),
  component: RoomsPage,
})

interface Room {
  id: number
  name: string
  description: string
  ownerId: string
  ownerUsername?: string | null
  visitorsNow: number
  visitorsMax: number
  isHidden: number
}

function RoomsPage() {
  const navigate = useNavigate()
  const { q, type, skip } = useSearch({ from: '/_auth/rooms/' })
  const [inputValue, setInputValue] = useState(q)
  const take = 20
  const qc = useQueryClient()

  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: '/rooms/', search: (prev) => ({ ...prev, q: inputValue, skip: 0 }) })
    }, 300)
    return () => clearTimeout(t)
  }, [inputValue])

  function setSearch(value: string) {
    setInputValue(value)
  }

  function setType(type: 'private' | 'public') {
    navigate({ to: '/rooms/', search: (prev) => ({ ...prev, type, skip: 0 }) })
  }

  function setSkip(skip: number) {
    navigate({ to: '/rooms/', search: (prev) => ({ ...prev, skip }) })
  }

  const { data: rooms = [], isFetching } = useQuery({
    queryKey: ['rooms', q, type, skip],
    queryFn: () => {
      const params = new URLSearchParams({ skip: String(skip), take: String(take), type })
      if (q) params.set('search', q)
      return api.get<Room[]>(`/api/housekeeping/rooms?${params}`)
    },
  })

  const toggle = useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: number }) =>
      api.patch(`/api/housekeeping/rooms/${id}`, { isHidden }),
    onSuccess: () => {
      toast.success('Room updated')
      qc.invalidateQueries({ queryKey: ['rooms'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name…"
            className="pl-9"
            value={inputValue}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${type === 'private' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setType('private')}
          >
            Private
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${type === 'public' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setType('public')}
          >
            Public
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              {type === 'private' && <TableHead>Owner</TableHead>}
              <TableHead>Visitors</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow><TableCell colSpan={type === 'private' ? 6 : 5} className="text-center text-gray-400 py-8">Loading…</TableCell></TableRow>
            ) : rooms.length === 0 ? (
              <TableRow><TableCell colSpan={type === 'private' ? 6 : 5} className="text-center text-gray-400 py-8">No rooms found</TableCell></TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="text-gray-500 text-xs">{room.id}</TableCell>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  {type === 'private' && (
                    <TableCell className="text-sm">
                      {room.ownerUsername ? (
                        <Link to="/users/$userId" params={{ userId: room.ownerId }} className="text-blue-600 hover:underline">
                          {room.ownerUsername}
                        </Link>
                      ) : (
                        <span className="text-gray-400">#{room.ownerId}</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-sm">{room.visitorsNow}/{room.visitorsMax}</TableCell>
                  <TableCell>
                    {room.isHidden ? (
                      <Badge variant="secondary">Hidden</Badge>
                    ) : (
                      <Badge variant="success">Visible</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={room.isHidden ? 'Unhide' : 'Hide'}
                      onClick={() => toggle.mutate({ id: room.id, isHidden: room.isHidden ? 0 : 1 })}
                      disabled={toggle.isPending}
                    >
                      {room.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Showing {skip + 1}–{skip + rooms.length}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - take))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={rooms.length < take} onClick={() => setSkip(skip + take)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
