import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/_auth/news/')({
  component: NewsPage,
})

interface NewsItem {
  id: number
  title: string
  description: string
  createdAt: string
}

function NewsPage() {
  const qc = useQueryClient()

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => api.get<NewsItem[]>('/api/housekeeping/news'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/housekeeping/news/${id}`),
    onSuccess: () => { toast.success('Article deleted'); qc.invalidateQueries({ queryKey: ['news'] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">News</h1>
        <Link to="/news/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Article
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-400 py-8">Loading…</TableCell></TableRow>
            ) : news.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-400 py-8">No articles yet</TableCell></TableRow>
            ) : (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-500 text-xs">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link to="/news/$newsId" params={{ newsId: String(item.id) }}>
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => { if (confirm('Delete this article?')) remove.mutate(item.id) }}
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
