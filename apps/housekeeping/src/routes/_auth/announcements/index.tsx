import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/_auth/announcements/')({
  component: AnnouncementsPage,
})

interface Announcement {
  id: number
  image: string
  content: string
  position: number
  createdAt: string
}

function AnnouncementsPage() {
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get<Announcement[]>('/api/housekeeping/announcements'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/housekeeping/announcements/${id}`),
    onSuccess: () => { toast.success('Announcement deleted'); qc.invalidateQueries({ queryKey: ['announcements'] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <Link to="/announcements/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Announcement
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8">Loading…</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8">No announcements yet</TableCell></TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-500 text-xs">{item.id}</TableCell>
                  <TableCell>{item.position}</TableCell>
                  <TableCell className="text-sm text-gray-500 truncate max-w-[150px]">{item.image}</TableCell>
                  <TableCell className="text-sm text-gray-700 truncate max-w-[250px]">{item.content}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link to="/announcements/$announcementId" params={{ announcementId: String(item.id) }}>
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => { if (confirm('Delete this announcement?')) remove.mutate(item.id) }}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
