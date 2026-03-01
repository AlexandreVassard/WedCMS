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

  const { data: aliveStatus } = useQuery({
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
    onSuccess: () => toast.success("User kicked from room"),
    onError: (e: Error) => toast.error(e.message),
  });

  const disconnectUser = useMutation({
    mutationFn: () => api.post(`/api/housekeeping/rcon/disconnect/${userId}`, {}),
    onSuccess: () => toast.success("User disconnected from server"),
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

  const isInRoom = userInfo?.roomId !== undefined && parseInt(userInfo.roomId, 10) !== -1;
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
                disabled={!aliveStatus?.online || disconnectUser.isPending}
                onClick={() => disconnectUser.mutate()}
              >
                <Unplug className="h-4 w-4" />
                Disconnect from server
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

          {/* Ban */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldBan className="h-4 w-4" />
                Ban
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {banLoading ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : ban ? (
                <div className="space-y-3">
                  <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm space-y-1">
                    <p className="font-medium text-red-700 flex items-center gap-1">
                      <ShieldBan className="h-3.5 w-3.5" />
                      User is banned
                    </p>
                    {ban.message && (
                      <p className="text-red-600">Reason: {ban.message}</p>
                    )}
                    <p className="text-red-600">
                      Until:{" "}
                      {ban.bannedUntil === 0
                        ? "Permanent"
                        : new Date(ban.bannedUntil * 1000).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unbanUser.mutate()}
                    disabled={unbanUser.isPending}
                    className="flex items-center gap-1"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Unban
                  </Button>
                </div>
              ) : (
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => banUser.mutate()}
                    disabled={banUser.isPending}
                    className="flex items-center gap-1"
                  >
                    <ShieldBan className="h-4 w-4" />
                    Ban User
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
