import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_auth/news/new')({
  component: NewNewsPage,
})

function NewNewsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const create = useMutation({
    mutationFn: () => api.post('/api/housekeeping/news', { title, description }),
    onSuccess: () => {
      toast.success('Article created')
      qc.invalidateQueries({ queryKey: ['news'] })
      navigate({ to: '/news' })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => navigate({ to: '/news' })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to News
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Article</h1>

      <Card>
        <CardHeader><CardTitle>Article Details</CardTitle></CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); create.mutate() }}
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
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create Article'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
