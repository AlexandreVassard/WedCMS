import { createFileRoute } from '@tanstack/react-router'
import { Info } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

export const Route = createFileRoute('/_auth/ranks/')({
  component: RanksPage,
})

const FUSERIGHT_DESCRIPTIONS: Record<string, string> = {
  default: 'Grants access to basic player commands like help and emotes.',
  fuse_login: 'Allows the player to authenticate and log into the hotel.',
  fuse_buy_credits: 'Allows the player to purchase credits from the catalogue.',
  fuse_trade: 'Allows the player to initiate and participate in trades.',
  fuse_room_queue_default: 'Allows the player to queue for rooms without club membership.',
  fuse_enter_full_rooms: 'Allows entering rooms that are at max capacity.',
  fuse_room_alert: 'Allows sending an alert message to a room.',
  fuse_enter_locked_rooms: 'Allows entering password-protected rooms without the password.',
  fuse_kick: 'Allows kicking users from rooms.',
  fuse_mute: 'Allows muting players in rooms.',
  fuse_ban: 'Allows banning users from the hotel.',
  fuse_room_mute: 'Allows muting all players in a room at once.',
  fuse_room_kick: 'Allows kicking all non-staff users from a room.',
  fuse_receive_calls_for_help: 'Allows receiving and managing user help requests.',
  fuse_remove_stickies: 'Allows removing post-it stickies from rooms.',
  fuse_mod: 'Grants access to moderator-level room management features.',
  fuse_superban: 'Allows issuing super-bans that cannot be appealed.',
  fuse_pick_up_any_furni: 'Allows picking up any furniture in any room.',
  fuse_ignore_room_owner: 'Allows performing actions in rooms regardless of ownership.',
  fuse_any_room_controller: 'Allows controlling and modifying any room\'s settings.',
  fuse_moderator_access: 'Grants access to moderator-only tools and features.',
  fuse_credits: 'Allows setting discounted prices for rare items.',
  fuse_administrator_access: 'Grants access to administrator-only commands.',
  fuse_see_flat_ids: 'Allows viewing internal room IDs in the client.',
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center ml-1.5">
      <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-500 cursor-help" />
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 z-10 hidden group-hover:block w-60 rounded-md bg-gray-900 text-white text-xs px-2.5 py-1.5 shadow-lg">
        {text}
      </span>
    </span>
  )
}

interface Rank {
  id: number
  name: string
}

interface FuseRight {
  fuseright: string
  minRank: number
}

function FuseRightRow({ fuseRight, ranks }: { fuseRight: FuseRight; ranks: Rank[] }) {
  const qc = useQueryClient()
  const [minRank, setMinRank] = useState(fuseRight.minRank)
  const [dirty, setDirty] = useState(false)

  const update = useMutation({
    mutationFn: () =>
      api.patch(`/api/housekeeping/fuserights/${fuseRight.fuseright}`, { minRank }),
    onSuccess: () => {
      toast.success(`${fuseRight.fuseright} updated`)
      setDirty(false)
      qc.invalidateQueries({ queryKey: ['fuserights'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-4 text-sm font-mono text-gray-700">
        <span className="inline-flex items-center gap-0">
          {fuseRight.fuseright}
          {FUSERIGHT_DESCRIPTIONS[fuseRight.fuseright] && (
            <InfoTooltip text={FUSERIGHT_DESCRIPTIONS[fuseRight.fuseright]} />
          )}
        </span>
      </td>
      <td className="py-3 px-4 w-48">
        <select
          value={minRank}
          onChange={(e) => { setMinRank(Number(e.target.value)); setDirty(true) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && dirty && !update.isPending) { e.preventDefault(); e.currentTarget.blur(); update.mutate() } }}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm"
        >
          {ranks.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.id})
            </option>
          ))}
        </select>
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

function RankRow({ rank }: { rank: Rank }) {
  const qc = useQueryClient()
  const [name, setName] = useState(rank.name)
  const [dirty, setDirty] = useState(false)

  const update = useMutation({
    mutationFn: () => api.patch(`/api/housekeeping/ranks/${rank.id}`, { name }),
    onSuccess: () => {
      toast.success(`Rank ${rank.id} updated`)
      setDirty(false)
      qc.invalidateQueries({ queryKey: ['ranks'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-4 text-sm font-mono text-gray-700 w-24">{rank.id}</td>
      <td className="py-3 px-4">
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setDirty(true) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && dirty && !update.isPending) update.mutate() }}
          className="max-w-sm"
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

function RanksPage() {
  const { data: ranks = [], isLoading: ranksLoading } = useQuery({
    queryKey: ['ranks'],
    queryFn: () => api.get<Rank[]>('/api/housekeeping/ranks'),
  })

  const { data: fuserights = [], isLoading: fuserightsLoading } = useQuery({
    queryKey: ['fuserights'],
    queryFn: () => api.get<FuseRight[]>('/api/housekeeping/fuserights'),
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ranks</h1>
        <p className="text-gray-500 mt-1">Edit rank names and fuse rights</p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 mb-8 text-sm text-blue-900 space-y-1.5">
        <p>
          <strong>Ranks</strong> are numbered 1 to 6 and represent user privilege levels — rank 1 is a regular player, rank 6 is a full administrator. Each user account is assigned one rank.
        </p>
        <p>
          <strong>Fuse rights</strong> are individual permissions checked by the hotel server before allowing specific actions. Each fuse right has a <em>minimum rank</em>: any user whose rank is equal to or higher than that value automatically receives the permission. Lowering a fuse right's minimum rank makes it available to more users; raising it restricts it to higher staff.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Fuse Rights</h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {fuserightsLoading ? (
              <div className="p-8 text-center text-gray-400">Loading…</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Permission</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 w-48">Min Rank</th>
                    <th className="py-3 px-4 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {fuserights.map((fr) => (
                    <FuseRightRow key={fr.fuseright} fuseRight={fr} ranks={ranks} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Rank Names</h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {ranksLoading ? (
              <div className="p-8 text-center text-gray-400">Loading…</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 w-10">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {ranks.map((r) => (
                    <RankRow key={r.id} rank={r} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
