import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Radio, RefreshCw, MessageSquare, Building2, UserX, VolumeX, ArrowRight, Users, Server } from 'lucide-react'

export const Route = createFileRoute('/_auth/rcon/')({
  component: RconPage,
})

interface User {
  id: number
  username: string
}

interface UserSearchInputProps {
  onSelect: (user: User | null) => void
  placeholder?: string
}

function UserSearchInput({ onSelect, placeholder = 'Search username…' }: UserSearchInputProps) {
  const [input, setInput] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selected, setSelected] = useState<User | null>(null)
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 250)
    return () => clearTimeout(t)
  }, [input])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { data: suggestions } = useQuery({
    queryKey: ['user-search', debounced],
    queryFn: () => api.get<User[]>(`/api/housekeeping/users?search=${encodeURIComponent(debounced)}&take=6`),
    enabled: debounced.length >= 1 && !selected,
  })

  const handleChange = (value: string) => {
    setInput(value)
    setSelected(null)
    setShow(true)
    onSelect(null)
  }

  const handleSelect = (user: User) => {
    setInput(user.username)
    setSelected(user)
    setShow(false)
    onSelect(user)
  }

  return (
    <div ref={ref} className="relative w-full">
      <Input
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (!selected) setShow(true) }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {show && suggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md text-sm">
          {suggestions.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
              onMouseDown={() => handleSelect(u)}
            >
              <span>{u.username}</span>
              <span className="text-gray-400 text-xs">#{u.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RconPage() {
  // Hotel Alert
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSender, setAlertSender] = useState('')

  // User Alert
  const [userAlertUser, setUserAlertUser] = useState<User | null>(null)
  const [userAlertMessage, setUserAlertMessage] = useState('')

  // Room Alert
  const [roomAlertRoomId, setRoomAlertRoomId] = useState('')
  const [roomAlertMessage, setRoomAlertMessage] = useState('')

  // Refresh User
  const [refreshUser, setRefreshUser] = useState<User | null>(null)

  // Disconnect / Kick
  const [dkUser, setDkUser] = useState<User | null>(null)

  // Mute / Unmute
  const [muteUser, setMuteUser] = useState<User | null>(null)
  const [muteMinutes, setMuteMinutes] = useState('')

  // Forward User
  const [forwardUser, setForwardUser] = useState<User | null>(null)
  const [forwardType, setForwardType] = useState<'1' | '2'>('1')
  const [forwardRoomId, setForwardRoomId] = useState('')

  // Mass Event
  const [massEventRoomId, setMassEventRoomId] = useState('')

  // Server Commands
  const [shutdownMinutes, setShutdownMinutes] = useState('')
  const [shutdownMessage, setShutdownMessage] = useState('')
  const [shutdownCancelMessage, setShutdownCancelMessage] = useState('')

  const hotelAlert = useMutation({
    mutationFn: () =>
      api.post('/api/housekeeping/rcon/hotel-alert', {
        message: alertMessage,
        ...(alertSender ? { sender: alertSender } : {}),
      }),
    onSuccess: () => { toast.success('Hotel alert sent'); setAlertMessage('') },
    onError: (e: Error) => toast.error(e.message),
  })

  const userAlert = useMutation({
    mutationFn: () =>
      api.post('/api/housekeeping/rcon/user-alert', {
        userId: userAlertUser!.id,
        message: userAlertMessage,
      }),
    onSuccess: () => { toast.success(`Alert sent to ${userAlertUser!.username}`); setUserAlertMessage('') },
    onError: (e: Error) => toast.error(e.message),
  })

  const roomAlert = useMutation({
    mutationFn: () =>
      api.post('/api/housekeeping/rcon/room-alert', {
        roomId: parseInt(roomAlertRoomId, 10),
        message: roomAlertMessage,
      }),
    onSuccess: () => { toast.success('Room alert sent'); setRoomAlertMessage('') },
    onError: (e: Error) => toast.error(e.message),
  })

  const refresh = useMutation({
    mutationFn: (type: 'credits' | 'looks' | 'club' | 'hand' | 'motto' | 'badge') =>
      api.post(`/api/housekeeping/rcon/refresh/${refreshUser!.id}`, { type }),
    onSuccess: (_data, type) => toast.success(`Refreshed ${type} for ${refreshUser!.username}`),
    onError: (e: Error) => toast.error(e.message),
  })

  const disconnect = useMutation({
    mutationFn: () => api.post(`/api/housekeeping/rcon/disconnect/${dkUser!.id}`),
    onSuccess: () => toast.success(`${dkUser!.username} disconnected`),
    onError: (e: Error) => toast.error(e.message),
  })

  const kick = useMutation({
    mutationFn: () => api.post(`/api/housekeeping/rcon/kick/${dkUser!.id}`),
    onSuccess: () => toast.success(`${dkUser!.username} kicked`),
    onError: (e: Error) => toast.error(e.message),
  })

  const mute = useMutation({
    mutationFn: () =>
      api.post(`/api/housekeeping/rcon/mute/${muteUser!.id}`, { minutes: parseInt(muteMinutes, 10) }),
    onSuccess: () => toast.success(`${muteUser!.username} muted for ${muteMinutes} minutes`),
    onError: (e: Error) => toast.error(e.message),
  })

  const unmute = useMutation({
    mutationFn: () => api.post(`/api/housekeeping/rcon/unmute/${muteUser!.id}`),
    onSuccess: () => toast.success(`${muteUser!.username} unmuted`),
    onError: (e: Error) => toast.error(e.message),
  })

  const forward = useMutation({
    mutationFn: () =>
      api.post(`/api/housekeeping/rcon/forward/${forwardUser!.id}`, {
        type: parseInt(forwardType, 10),
        roomId: forwardRoomId,
      }),
    onSuccess: () => toast.success(`${forwardUser!.username} forwarded to room ${forwardRoomId}`),
    onError: (e: Error) => toast.error(e.message),
  })

  const massEvent = useMutation({
    mutationFn: () =>
      api.post('/api/housekeeping/rcon/mass-event', { roomId: parseInt(massEventRoomId, 10) }),
    onSuccess: () => toast.success(`Mass event triggered for room ${massEventRoomId}`),
    onError: (e: Error) => toast.error(e.message),
  })

  const refreshCatalogue = useMutation({
    mutationFn: () => api.post('/api/housekeeping/rcon/refresh-catalogue'),
    onSuccess: () => toast.success('Catalogue refreshed'),
    onError: (e: Error) => toast.error(e.message),
  })

  const reloadSettings = useMutation({
    mutationFn: () => api.post('/api/housekeeping/rcon/reload-settings'),
    onSuccess: () => toast.success('Settings reloaded'),
    onError: (e: Error) => toast.error(e.message),
  })

  const shutdown = useMutation({
    mutationFn: () =>
      api.post('/api/housekeeping/rcon/shutdown', {
        minutes: parseInt(shutdownMinutes, 10),
        ...(shutdownMessage ? { message: shutdownMessage } : {}),
      }),
    onSuccess: () => toast.success(`Shutdown scheduled in ${shutdownMinutes} minutes`),
    onError: (e: Error) => toast.error(e.message),
  })

  const shutdownCancel = useMutation({
    mutationFn: () =>
      api.post('/api/housekeeping/rcon/shutdown-cancel', {
        ...(shutdownCancelMessage ? { message: shutdownCancelMessage } : {}),
      }),
    onSuccess: () => toast.success('Shutdown cancelled'),
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">RCON</h1>
        <p className="text-gray-500 mt-1">Send commands to the Kepler server</p>
      </div>

      <div className="grid grid-cols-3 gap-6">

      {/* Hotel Alert */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-orange-500" />
            <CardTitle>Hotel Alert</CardTitle>
          </div>
          <CardDescription>Broadcast a message to all online users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); hotelAlert.mutate() }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Input
                required
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Enter hotel alert message…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sender <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input
                value={alertSender}
                onChange={(e) => setAlertSender(e.target.value)}
                placeholder="Staff member name"
              />
            </div>
            <Button type="submit" disabled={hotelAlert.isPending}>
              {hotelAlert.isPending ? 'Sending…' : 'Send Alert'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User Alert */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <CardTitle>User Alert</CardTitle>
          </div>
          <CardDescription>Send a private alert to a specific user</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); userAlert.mutate() }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <UserSearchInput onSelect={setUserAlertUser} />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Input
                required
                value={userAlertMessage}
                onChange={(e) => setUserAlertMessage(e.target.value)}
                placeholder="Enter alert message…"
              />
            </div>
            <Button type="submit" disabled={!userAlertUser || !userAlertMessage || userAlert.isPending}>
              {userAlert.isPending ? 'Sending…' : 'Send Alert'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Room Alert */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-500" />
            <CardTitle>Room Alert</CardTitle>
          </div>
          <CardDescription>Send an alert to all users in a specific room</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); roomAlert.mutate() }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Room ID</Label>
              <Input
                required
                value={roomAlertRoomId}
                onChange={(e) => setRoomAlertRoomId(e.target.value)}
                placeholder="Room ID…"
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Input
                required
                value={roomAlertMessage}
                onChange={(e) => setRoomAlertMessage(e.target.value)}
                placeholder="Enter alert message…"
              />
            </div>
            <Button type="submit" disabled={!roomAlertRoomId || !roomAlertMessage || roomAlert.isPending}>
              {roomAlert.isPending ? 'Sending…' : 'Send Alert'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Refresh User */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            <CardTitle>Refresh User</CardTitle>
          </div>
          <CardDescription>Force-refresh a user's data in the hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <UserSearchInput onSelect={setRefreshUser} />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['credits', 'looks', 'club', 'hand', 'motto', 'badge'] as const).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  disabled={!refreshUser || refresh.isPending}
                  onClick={() => refresh.mutate(type)}
                >
                  Refresh {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disconnect / Kick */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-red-500" />
            <CardTitle>Disconnect / Kick</CardTitle>
          </div>
          <CardDescription>Remove a user from the hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <UserSearchInput onSelect={setDkUser} />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!dkUser || disconnect.isPending}
                onClick={() => disconnect.mutate()}
              >
                {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
              </Button>
              <Button
                variant="outline"
                disabled={!dkUser || kick.isPending}
                onClick={() => kick.mutate()}
              >
                {kick.isPending ? 'Kicking…' : 'Kick'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mute / Unmute */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <VolumeX className="h-5 w-5 text-yellow-500" />
            <CardTitle>Mute / Unmute</CardTitle>
          </div>
          <CardDescription>Control a user's ability to chat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <UserSearchInput onSelect={setMuteUser} />
            </div>
            <div className="space-y-1.5">
              <Label>Minutes <span className="text-gray-400 font-normal">(for mute)</span></Label>
              <Input
                type="number"
                min="1"
                value={muteMinutes}
                onChange={(e) => setMuteMinutes(e.target.value)}
                placeholder="Duration in minutes…"
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!muteUser || !muteMinutes || mute.isPending}
                onClick={() => mute.mutate()}
              >
                {mute.isPending ? 'Muting…' : 'Mute'}
              </Button>
              <Button
                variant="outline"
                disabled={!muteUser || unmute.isPending}
                onClick={() => unmute.mutate()}
              >
                {unmute.isPending ? 'Unmuting…' : 'Unmute'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forward User */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-indigo-500" />
            <CardTitle>Forward User</CardTitle>
          </div>
          <CardDescription>Teleport a user to a specific room</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); forward.mutate() }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <UserSearchInput onSelect={setForwardUser} />
            </div>
            <div className="space-y-1.5">
              <Label>Room Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="forwardType"
                    value="1"
                    checked={forwardType === '1'}
                    onChange={() => setForwardType('1')}
                    className="accent-indigo-500"
                  />
                  Public
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="forwardType"
                    value="2"
                    checked={forwardType === '2'}
                    onChange={() => setForwardType('2')}
                    className="accent-indigo-500"
                  />
                  Private
                </label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Room ID</Label>
              <Input
                required
                value={forwardRoomId}
                onChange={(e) => setForwardRoomId(e.target.value)}
                placeholder="Room ID…"
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={!forwardUser || !forwardRoomId || forward.isPending}>
              {forward.isPending ? 'Forwarding…' : 'Forward'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mass Event */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-500" />
            <CardTitle>Mass Event</CardTitle>
          </div>
          <CardDescription>Forward all online players to a room</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); massEvent.mutate() }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Room ID</Label>
              <Input
                required
                value={massEventRoomId}
                onChange={(e) => setMassEventRoomId(e.target.value)}
                placeholder="Room ID…"
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={!massEventRoomId || massEvent.isPending}>
              {massEvent.isPending ? 'Triggering…' : 'Trigger Mass Event'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Server Commands */}
      <Card className="col-span-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-gray-600" />
            <CardTitle>Server Commands</CardTitle>
          </div>
          <CardDescription>Manage the Kepler server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={refreshCatalogue.isPending}
              onClick={() => refreshCatalogue.mutate()}
            >
              {refreshCatalogue.isPending ? 'Refreshing…' : 'Refresh Catalogue'}
            </Button>
            <Button
              variant="outline"
              disabled={reloadSettings.isPending}
              onClick={() => reloadSettings.mutate()}
            >
              {reloadSettings.isPending ? 'Reloading…' : 'Reload Settings'}
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Shutdown</p>
            <div className="flex gap-2 items-end">
              <div className="space-y-1.5">
                <Label>Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  value={shutdownMinutes}
                  onChange={(e) => setShutdownMinutes(e.target.value)}
                  placeholder="Minutes…"
                  className="w-28"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label>Message <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  value={shutdownMessage}
                  onChange={(e) => setShutdownMessage(e.target.value)}
                  placeholder="Shutdown message…"
                />
              </div>
              <Button
                variant="destructive"
                disabled={!shutdownMinutes || shutdown.isPending}
                onClick={() => shutdown.mutate()}
              >
                {shutdown.isPending ? 'Scheduling…' : 'Shutdown'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Cancel Shutdown</p>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label>Message <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  value={shutdownCancelMessage}
                  onChange={(e) => setShutdownCancelMessage(e.target.value)}
                  placeholder="Cancellation message…"
                />
              </div>
              <Button
                variant="outline"
                disabled={shutdownCancel.isPending}
                onClick={() => shutdownCancel.mutate()}
              >
                {shutdownCancel.isPending ? 'Cancelling…' : 'Cancel Shutdown'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      </div>
    </div>
  )
}
