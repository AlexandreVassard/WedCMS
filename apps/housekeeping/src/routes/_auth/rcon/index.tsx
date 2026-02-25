import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Radio, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/_auth/rcon/')({
  component: RconPage,
})

interface User {
  id: number
  username: string
}

function RconPage() {
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSender, setAlertSender] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(usernameInput), 250)
    return () => clearTimeout(timer)
  }, [usernameInput])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: suggestions } = useQuery({
    queryKey: ['user-search', debouncedSearch],
    queryFn: () => api.get<User[]>(`/api/housekeeping/users?search=${encodeURIComponent(debouncedSearch)}&take=6`),
    enabled: debouncedSearch.length >= 1 && !selectedUser,
  })

  const hotelAlert = useMutation({
    mutationFn: () =>
      api.post('/api/housekeeping/rcon/hotel-alert', {
        message: alertMessage,
        ...(alertSender ? { sender: alertSender } : {}),
      }),
    onSuccess: () => { toast.success('Hotel alert sent'); setAlertMessage('') },
    onError: (e: Error) => toast.error(e.message),
  })

  const refresh = useMutation({
    mutationFn: (type: 'credits' | 'looks' | 'club' | 'hand') =>
      api.post(`/api/housekeeping/rcon/refresh/${selectedUser!.id}`, { type }),
    onSuccess: (_data, type) => toast.success(`Refreshed ${type} for ${selectedUser!.username}`),
    onError: (e: Error) => toast.error(e.message),
  })

  const handleUsernameChange = (value: string) => {
    setUsernameInput(value)
    setSelectedUser(null)
    setShowSuggestions(true)
  }

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    setUsernameInput(user.username)
    setShowSuggestions(false)
  }

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RCON</h1>
        <p className="text-gray-500 mt-1">Send commands to the Kepler server</p>
      </div>

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
          <form
            onSubmit={(e) => { e.preventDefault(); hotelAlert.mutate() }}
            className="space-y-4"
          >
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
              <div ref={searchRef} className="relative max-w-xs">
                <Input
                  value={usernameInput}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  onFocus={() => { if (!selectedUser) setShowSuggestions(true) }}
                  placeholder="Search username…"
                  autoComplete="off"
                />
                {showSuggestions && suggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md text-sm">
                    {suggestions.map((u) => (
                      <li
                        key={u.id}
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
                        onMouseDown={() => handleSelectUser(u)}
                      >
                        <span>{u.username}</span>
                        <span className="text-gray-400 text-xs">#{u.id}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['credits', 'looks', 'club', 'hand'] as const).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  disabled={!selectedUser || refresh.isPending}
                  onClick={() => refresh.mutate(type)}
                >
                  Refresh {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
