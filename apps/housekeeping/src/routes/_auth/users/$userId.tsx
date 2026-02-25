import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { ArrowLeft, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/_auth/users/$userId')({
  component: UserEditPage,
})

interface User {
  id: number
  username: string
  rank: number
  credits: number
  motto: string
  figure: string
}

function UserEditPage() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.get<User>(`/api/housekeeping/users/${userId}`),
  })

  const [form, setForm] = useState<Partial<User>>({})

  const update = useMutation({
    mutationFn: (data: Partial<User>) => api.patch(`/api/housekeeping/users/${userId}`, data),
    onSuccess: () => {
      toast.success('User updated')
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['user', userId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: () => api.delete(`/api/housekeeping/users/${userId}`),
    onSuccess: () => {
      toast.success('User deleted')
      navigate({ to: '/users' })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading || !user) {
    return <div className="p-8 text-gray-400">Loading…</div>
  }

  const value = (field: keyof User) =>
    form[field] !== undefined ? String(form[field]) : String(user[field])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.keys(form).length === 0) return
    const payload: Partial<User> = {}
    if (form.credits !== undefined) payload.credits = Number(form.credits)
    if (form.rank !== undefined) payload.rank = Number(form.rank)
    if (form.motto !== undefined) payload.motto = form.motto as string
    if (form.figure !== undefined) payload.figure = form.figure as string
    update.mutate(payload)
  }

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => navigate({ to: '/users' })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
          <p className="text-gray-500 text-sm">ID: {user.id}</p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => { if (confirm(`Delete ${user.username}?`)) remove.mutate() }}
          disabled={remove.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={value('credits')}
                  onChange={(e) => setForm((f) => ({ ...f, credits: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rank</Label>
                <Input
                  type="number"
                  min={0}
                  max={9}
                  value={value('rank')}
                  onChange={(e) => setForm((f) => ({ ...f, rank: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Motto</Label>
              <Input
                value={value('motto')}
                onChange={(e) => setForm((f) => ({ ...f, motto: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Figure</Label>
              <Input
                value={value('figure')}
                onChange={(e) => setForm((f) => ({ ...f, figure: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={update.isPending || Object.keys(form).length === 0}>
              {update.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
