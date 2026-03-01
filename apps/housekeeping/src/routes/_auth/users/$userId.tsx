import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import {
  ArrowLeft,
  Trash2,
  ShieldBan,
  ShieldCheck,
  ShieldUser,
  Monitor,
  LogOut,
  Unplug,
  VolumeX,
  Volume2,
  Bell,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/_auth/users/$userId")({
  component: UserEditPage,
});

interface User {
  id: number;
  username: string;
  rank: number;
  credits: number;
  tickets: number;
  film: number;
  battleballPoints: number;
  snowstormPoints: number;
  motto: string;
  figure: string;
  poolFigure: string;
  sex: string;
  email: string;
  birthday: string;
  consoleMotto: string;
  badge: string;
  badgeActive: number;
  allowStalking: number;
  allowFriendRequests: number;
  soundEnabled: number;
  tutorialFinished: number;
  receiveEmail: number;
  lastOnline: number;
  createdAt: string;
  clubSubscribed: number;
  clubExpiration: number;
  clubGiftDue: number;
}

interface Rank {
  id: number;
  name: string;
}

interface UserBan {
  banType: string;
  bannedValue: string;
  message: string;
  bannedUntil: number;
}

interface UserIpLog {
  ipAddress: string;
  createdAt: string;
}

interface Room {
  id: number;
  name: string;
  ownerId: string;
  ownerUsername?: string;
  visitorsNow: number;
  visitorsMax: number;
}

function formatTimestamp(ts: number) {
  return ts > 0 ? new Date(ts * 1000).toLocaleString() : "—";
}

function UserEditPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.get<User>(`/api/housekeeping/users/${userId}`),
  });

  const { data: aliveStatus, refetch: refetchAliveStatus } = useQuery({
    queryKey: ["user-is-alive", userId],
    queryFn: () =>
      api.get<{ online: boolean }>(
        `/api/housekeeping/users/${userId}/is-alive`,
      ),
    refetchInterval: 5000,
  });

  const { data: ranks = [] } = useQuery({
    queryKey: ["ranks"],
    queryFn: () => api.get<Rank[]>("/api/housekeeping/ranks"),
  });

  const [form, setForm] = useState<Partial<User>>({});

  const update = useMutation({
    mutationFn: (data: Partial<User>) =>
      api.patch(`/api/housekeeping/users/${userId}`, data),
    onSuccess: () => {
      toast.success("User updated");
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`/api/housekeeping/users/${userId}`),
    onSuccess: () => {
      toast.success("User deleted");
      navigate({ to: "/users" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: ban, isLoading: banLoading } = useQuery({
    queryKey: ["user-ban", userId],
    queryFn: () =>
      api.get<UserBan | null>(`/api/housekeeping/users/${userId}/ban`),
  });

  const { data: ipLogs = [] } = useQuery({
    queryKey: ["user-ip-logs", userId],
    queryFn: () =>
      api.get<UserIpLog[]>(`/api/housekeeping/users/${userId}/ip-logs`),
  });

  const [banMessage, setBanMessage] = useState("");
  const [banDuration, setBanDuration] = useState("0");

  const banUser = useMutation({
    mutationFn: () => {
      const durationSeconds = parseInt(banDuration, 10);
      const bannedUntil =
        durationSeconds === 0
          ? 0
          : Math.floor(Date.now() / 1000) + durationSeconds;
      return api.post(`/api/housekeeping/users/${userId}/ban`, {
        message: banMessage,
        bannedUntil,
      });
    },
    onSuccess: () => {
      toast.success("User banned");
      qc.invalidateQueries({ queryKey: ["user-ban", userId] });
      setBanMessage("");
      setBanDuration("0");
      setBanOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unbanUser = useMutation({
    mutationFn: () => api.delete(`/api/housekeeping/users/${userId}/ban`),
    onSuccess: () => {
      toast.success("User unbanned");
      qc.invalidateQueries({ queryKey: ["user-ban", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const kickUser = useMutation({
    mutationFn: () => api.post(`/api/housekeeping/rcon/kick/${userId}`, {}),
    onSuccess: () => { toast.success("User kicked from room"); refetchUserInfo(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const disconnectUser = useMutation({
    mutationFn: () => api.post(`/api/housekeeping/rcon/disconnect/${userId}`, {}),
    onSuccess: () => { toast.success("User disconnected from server"); refetchAliveStatus(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: userInfo, refetch: refetchUserInfo } = useQuery({
    queryKey: ["user-info", userId],
    queryFn: () =>
      api.get<Record<string, string> | null>(
        `/api/housekeeping/rcon/user-info/${userId}`,
      ),
    enabled: !!aliveStatus?.online,
    refetchInterval: 5000,
  });

  const isInRoom = !!aliveStatus?.online && userInfo?.roomId !== undefined && parseInt(userInfo.roomId, 10) !== -1;
  const muteExpiry = userInfo?.muteTime ? parseInt(userInfo.muteTime, 10) : 0;
  const isMuted = muteExpiry > Date.now() / 1000;

  const [muteSecondsLeft, setMuteSecondsLeft] = useState(0);
  useEffect(() => {
    if (!isMuted) { setMuteSecondsLeft(0); return; }
    const tick = () => setMuteSecondsLeft(Math.max(0, muteExpiry - Math.floor(Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isMuted, muteExpiry]);

  const [muteDuration, setMuteDuration] = useState("10");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [banOpen, setBanOpen] = useState(false);
  const [teleportOpen, setTeleportOpen] = useState(false);
  const [teleportSearch, setTeleportSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const sendAlert = useMutation({
    mutationFn: () =>
      api.post(`/api/housekeeping/rcon/user-alert`, {
        userId: parseInt(userId, 10),
        message: alertMessage,
      }),
    onSuccess: () => {
      toast.success("Alert sent");
      setAlertOpen(false);
      setAlertMessage("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const muteUser = useMutation({
    mutationFn: () =>
      api.post(`/api/housekeeping/rcon/mute/${userId}`, {
        minutes: parseInt(muteDuration, 10),
      }),
    onSuccess: () => { toast.success("User muted"); refetchUserInfo(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const unmuteUser = useMutation({
    mutationFn: () => api.post(`/api/housekeeping/rcon/unmute/${userId}`, {}),
    onSuccess: () => { toast.success("User unmuted"); refetchUserInfo(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: roomResults = [], isFetching: roomSearching } = useQuery({
    queryKey: ["room-search", teleportSearch],
    queryFn: () =>
      api.get<Room[]>(
        `/api/housekeeping/rooms?search=${encodeURIComponent(teleportSearch)}&take=8`,
      ),
    enabled: teleportSearch.length >= 1,
  });

  const teleportUser = useMutation({
    mutationFn: (room: Room) =>
      api.post(`/api/housekeeping/rcon/forward/${userId}`, {
        roomId: room.id,
        type: parseInt(room.ownerId, 10) === 0 ? 1 : 0,
      }),
    onSuccess: () => {
      toast.success("User teleported");
      setTeleportOpen(false);
      setTeleportSearch("");
      setSelectedRoom(null);
      refetchUserInfo();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const currentRank = Number(form.rank !== undefined ? form.rank : user?.rank);
  const rankOptions = useMemo(() => {
    const options = [...ranks];
    if (user && !options.find((r) => r.id === user.rank)) {
      options.push({ id: user.rank, name: `Rank ${user.rank}` });
      options.sort((a, b) => a.id - b.id);
    }
    return options;
  }, [ranks, user]);

  if (isLoading || !user) {
    return <div className="p-8 text-gray-400">Loading…</div>;
  }

  const num = (field: keyof User) =>
    form[field] !== undefined ? Number(form[field]) : Number(user[field]);

  const str = (field: keyof User) =>
    form[field] !== undefined ? String(form[field]) : String(user[field] ?? "");

  const bool = (field: keyof User) => num(field) === 1;

  const setNum = (field: keyof User, val: number) =>
    setForm((f) => ({ ...f, [field]: val }));

  const setStr = (field: keyof User, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const setBool = (field: keyof User, val: boolean) =>
    setForm((f) => ({ ...f, [field]: val ? 1 : 0 }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(form).length === 0) return;
    update.mutate(form);
  };

  return (
    <div className="p-8 max-w-6xl">
      <button
        onClick={() => navigate({ to: "/users" })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.username}
            </h1>
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${aliveStatus?.online ? "bg-green-500" : "bg-gray-300"}`}
              title={aliveStatus?.online ? "Online" : "Offline"}
            />
          </div>
          <p className="text-gray-500 text-sm">ID: {user.id}</p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm(`Delete ${user.username}?`)) remove.mutate();
          }}
          disabled={remove.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Account
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Rank</Label>
                      <select
                        value={currentRank}
                        onChange={(e) => setNum("rank", Number(e.target.value))}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {rankOptions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={str("email")}
                        onChange={(e) => setStr("email", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <hr />

                {/* Currency */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Currency
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Credits</Label>
                      <Input
                        type="number"
                        value={num("credits")}
                        onChange={(e) =>
                          setNum("credits", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tickets</Label>
                      <Input
                        type="number"
                        value={num("tickets")}
                        onChange={(e) =>
                          setNum("tickets", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Film</Label>
                      <Input
                        type="number"
                        value={num("film")}
                        onChange={(e) => setNum("film", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={update.isPending || Object.keys(form).length === 0}
                >
                  {update.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Read-only info */}
          <Card>
            <CardHeader>
              <CardTitle>Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
              {(
                [
                  ["Motto", user.motto],
                  ["Console Motto", user.consoleMotto],
                  ["Sex", user.sex === "M" ? "Male" : "Female"],
                  ["Figure", user.figure],
                  ["Pool Figure", user.poolFigure || "—"],
                  ["Birthday", user.birthday || "—"],
                  ["Last Online", formatTimestamp(user.lastOnline)],
                  [
                    "Registered",
                    user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "—",
                  ],
                  ["Club Subscribed", formatTimestamp(user.clubSubscribed)],
                  ["Club Expiration", formatTimestamp(user.clubExpiration)],
                  ["Club Gift Due", formatTimestamp(user.clubGiftDue)],
                  ["Battleball Points", String(user.battleballPoints)],
                  ["Snowstorm Points", String(user.snowstormPoints)],
                  ["Allow Stalking", user.allowStalking ? "Yes" : "No"],
                  [
                    "Allow Friend Requests",
                    user.allowFriendRequests ? "Yes" : "No",
                  ],
                  ["Sound Enabled", user.soundEnabled ? "Yes" : "No"],
                  ["Tutorial Finished", user.tutorialFinished ? "Yes" : "No"],
                  ["Receive Email", user.receiveEmail ? "Yes" : "No"],
                ] as [string, string][]
              ).map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-gray-700 break-all">{val}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* Figure */}
          <Card>
            <CardHeader>
              <CardTitle>Figure</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4 p-4">
              <img
                src={`/habbo-imaging/avatarimage?figure=${user.figure}`}
                alt="Habbo avatar"
              />
              {user.badge && (
                <img
                  src={`/badge/${user.badge}.png`}
                  alt={user.badge}
                  title={user.badge}
                  className={user.badgeActive ? undefined : "opacity-30"}
                />
              )}
            </CardContent>
          </Card>

          {/* Moderation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldUser className="h-4 w-4" />
                Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                disabled={!isInRoom || kickUser.isPending}
                onClick={() => kickUser.mutate()}
              >
                <LogOut className="h-4 w-4" />
                Kick from room
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                disabled={!aliveStatus?.online}
                onClick={() => setTeleportOpen(true)}
              >
                <MapPin className="h-4 w-4" />
                Teleport to room
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                disabled={!aliveStatus?.online || disconnectUser.isPending}
                onClick={() => disconnectUser.mutate()}
              >
                <Unplug className="h-4 w-4" />
                Disconnect from server
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                disabled={!aliveStatus?.online}
                onClick={() => setAlertOpen(true)}
              >
                <Bell className="h-4 w-4" />
                Send alert
              </Button>
              {isMuted ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  disabled={unmuteUser.isPending}
                  onClick={() => unmuteUser.mutate()}
                >
                  <Volume2 className="h-4 w-4" />
                  Unmute
                  <span className="ml-auto text-xs tabular-nums text-gray-400">
                    {muteSecondsLeft >= 3600
                      ? `${Math.floor(muteSecondsLeft / 3600)}h ${Math.floor((muteSecondsLeft % 3600) / 60)}m`
                      : muteSecondsLeft >= 60
                        ? `${Math.floor(muteSecondsLeft / 60)}m ${muteSecondsLeft % 60}s`
                        : `${muteSecondsLeft}s`}
                  </span>
                </Button>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={muteDuration}
                    onChange={(e) => setMuteDuration(e.target.value)}
                    disabled={!aliveStatus?.online}
                    className="flex h-8 flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="1">1 min</option>
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="30">30 min</option>
                    <option value="60">1 hour</option>
                    <option value="1440">1 day</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={!aliveStatus?.online || muteUser.isPending}
                    onClick={() => muteUser.mutate()}
                  >
                    <VolumeX className="h-4 w-4" />
                    Mute
                  </Button>
                </div>
              )}
              {ban ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  disabled={unbanUser.isPending || banLoading}
                  onClick={() => unbanUser.mutate()}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Unban
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  disabled={banLoading}
                  onClick={() => setBanOpen(true)}
                >
                  <ShieldBan className="h-4 w-4" />
                  Ban user
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Login IP History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Login IP History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ipLogs.length === 0 ? (
                <p className="text-xs text-gray-400">No records.</p>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      {ipLogs.map((log, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-3 py-1.5 font-mono">{log.ipAddress}</td>
                          <td className="px-3 py-1.5 text-gray-500 text-right">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>


        </div>
      </div>

      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban {user.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Input
                value={banMessage}
                onChange={(e) => setBanMessage(e.target.value)}
                placeholder="Ban reason…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="0">Permanent</option>
                <option value="3600">1 hour</option>
                <option value="86400">1 day</option>
                <option value="604800">1 week</option>
                <option value="2592000">30 days</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={banUser.isPending}
              onClick={() => banUser.mutate()}
            >
              <ShieldBan className="h-4 w-4" />
              {banUser.isPending ? "Banning…" : "Ban user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send alert to {user.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              placeholder="Enter alert message…"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!alertMessage.trim() || sendAlert.isPending}
              onClick={() => sendAlert.mutate()}
            >
              {sendAlert.isPending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={teleportOpen}
        onOpenChange={(open) => {
          setTeleportOpen(open);
          if (!open) {
            setTeleportSearch("");
            setSelectedRoom(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teleport {user.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Search room</Label>
              <Input
                value={teleportSearch}
                onChange={(e) => {
                  setTeleportSearch(e.target.value);
                  setSelectedRoom(null);
                }}
                placeholder="Room name or ID…"
                autoFocus
              />
            </div>
            {teleportSearch.length >= 1 && (
              <div className="rounded-md border overflow-hidden max-h-48 overflow-y-auto">
                {roomSearching ? (
                  <p className="p-2 text-xs text-gray-400">Searching…</p>
                ) : roomResults.length === 0 ? (
                  <p className="p-2 text-xs text-gray-400">No rooms found.</p>
                ) : (
                  roomResults.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-0 flex items-center justify-between${selectedRoom?.id === room.id ? " bg-gray-50 font-medium" : ""}`}
                    >
                      <span>{room.name}</span>
                      <span className="text-xs text-gray-400 ml-2 shrink-0">
                        {parseInt(room.ownerId, 10) === 0
                          ? "Public"
                          : (room.ownerUsername ?? `#${room.ownerId}`)}{" "}
                        · #{room.id}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTeleportOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedRoom || teleportUser.isPending}
              onClick={() => selectedRoom && teleportUser.mutate(selectedRoom)}
            >
              {teleportUser.isPending ? "Teleporting…" : "Teleport"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
