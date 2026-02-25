import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_auth/news/$newsId')({
  component: NewsEditPage,
})

interface NewsItem {
  id: number
  title: string
  description: string
  createdAt: string
}

function NewsEditPage() {
  const { newsId } = Route.useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: item, isLoading } = useQuery({
    queryKey: ['news', newsId],
    queryFn: () => api.get<NewsItem>(`/api/housekeeping/news/${newsId}`),
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (item) { setTitle(item.title); setDescription(item.description) }
  }, [item])

  const update = useMutation({
    mutationFn: () => api.patch(`/api/housekeeping/news/${newsId}`, { title, description }),
    onSuccess: () => {
      toast.success('Article updated')
      qc.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading || !item) return <div className="p-8 text-gray-400">Loading…</div>

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => navigate({ to: '/news' })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to News
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Article</h1>

      <Card>
        <CardHeader><CardTitle>Article Details</CardTitle></CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); update.mutate() }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                required
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
