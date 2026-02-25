import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

export const Route = createFileRoute('/_auth/settings/')({
  component: SettingsPage,
})

interface Setting {
  setting: string
  value: string
}

function SettingRow({ item }: { item: Setting }) {
  const qc = useQueryClient()
  const [value, setValue] = useState(item.value)
  const [dirty, setDirty] = useState(false)

  const update = useMutation({
    mutationFn: () =>
      api.patch(`/api/housekeeping/settings/${encodeURIComponent(item.setting)}`, { value }),
    onSuccess: () => {
      toast.success(`${item.setting} updated`)
      setDirty(false)
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-4 text-sm font-mono text-gray-700 w-64">{item.setting}</td>
      <td className="py-3 px-4">
        <Input
          value={value}
          onChange={(e) => { setValue(e.target.value); setDirty(true) }}
          className="max-w-lg"
        />
      </td>
      <td className="py-3 px-4 w-24">
        <Button
          size="sm"
          disabled={!dirty || update.isPending}
          onClick={() => update.mutate()}
        >
          {update.isPending ? 'Saving…' : 'Save'}
        </Button>
      </td>
    </tr>
  )
}

function SettingsPage() {
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<Setting[]>('/api/housekeeping/settings'),
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Edit hotel configuration values</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : settings.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No settings found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Key</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Value</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <SettingRow key={s.setting} item={s} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
