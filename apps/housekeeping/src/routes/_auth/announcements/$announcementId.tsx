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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { ImagePickerField } from '../../../components/image-picker-field'

export const Route = createFileRoute('/_auth/announcements/$announcementId')({
  component: AnnouncementEditPage,
})

interface Link {
  url: string
  text: string
}

interface Announcement {
  id: number
  image: string
  content: string
  links: Link[]
  position: number
}

function AnnouncementEditPage() {
  const { announcementId } = Route.useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: item, isLoading } = useQuery({
    queryKey: ['announcement', announcementId],
    queryFn: () => api.get<Announcement>(`/api/housekeeping/announcements/${announcementId}`),
  })

  const [image, setImage] = useState('')
  const [content, setContent] = useState('')
  const [links, setLinks] = useState<Link[]>([])

  useEffect(() => {
    if (item) {
      setImage(item.image)
      setContent(item.content)
      setLinks(item.links?.length ? item.links : [{ url: '', text: '' }])
    }
  }, [item])

  const update = useMutation({
    mutationFn: () =>
      api.patch(`/api/housekeeping/announcements/${announcementId}`, {
        image,
        content,
        links,
      }),
    onSuccess: () => {
      toast.success('Announcement updated')
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['announcement', announcementId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const addLink = () => {
    if (links.length < 2) setLinks([...links, { url: '', text: '' }])
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, field: keyof Link, value: string) => {
    setLinks(links.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  if (isLoading || !item) return <div className="p-8 text-gray-400">Loading…</div>

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => navigate({ to: '/announcements' })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Announcements
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Announcement #{announcementId}</h1>

      <Card>
        <CardHeader><CardTitle>Announcement Details</CardTitle></CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); update.mutate() }}
            className="space-y-4"
          >
            <ImagePickerField value={image} onChange={setImage} />
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Links</Label>
                {links.length < 2 && (
                  <button
                    type="button"
                    onClick={addLink}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                  >
                    <Plus className="h-3 w-3" />
                    Add link
                  </button>
                )}
              </div>
              {links.map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <Input
                      placeholder="URL (e.g. /news)"
                      value={link.url}
                      onChange={(e) => updateLink(i, 'url', e.target.value)}
                    />
                    <Input
                      placeholder="Label (e.g. Read more)"
                      value={link.text}
                      onChange={(e) => updateLink(i, 'text', e.target.value)}
                    />
                  </div>
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="text-gray-400 hover:text-red-500 mt-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
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
