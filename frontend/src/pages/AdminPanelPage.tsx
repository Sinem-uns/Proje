import { useState, useEffect, useMemo, useCallback } from "react";
import { apiFetch } from "../lib/api";
import {
  Users, FileText, Activity, Download, Ban, CheckCircle,
  Trash2, Search, X, Eye, Calendar,
} from "lucide-react";

// ─── constants ───────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  ACTIVE:            "bg-emerald-50 text-emerald-700",
  DRAFT:             "bg-slate-100 text-slate-600",
  MEETING_SCHEDULED: "bg-blue-50 text-blue-700",
  PARTNER_FOUND:     "bg-purple-50 text-purple-700",
  EXPIRED:           "bg-red-50 text-red-600",
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN:              "bg-blue-50 text-blue-700",
  FAILED_LOGIN:       "bg-red-50 text-red-700",
  REGISTER:           "bg-teal-50 text-teal-700",
  POST_CREATE:        "bg-indigo-50 text-indigo-700",
  POST_EDIT:          "bg-indigo-50 text-indigo-600",
  POST_STATUS_CHANGE: "bg-purple-50 text-purple-700",
  POST_DELETE:        "bg-red-50 text-red-700",
  MEETING_REQUEST:    "bg-violet-50 text-violet-700",
  MEETING_RESPOND:    "bg-violet-50 text-violet-600",
  ADMIN_ACTION:       "bg-amber-50 text-amber-700",
};

// ─── shared ui ───────────────────────────────────────────────────────────────
const Badge = ({ text, cls }: { text: string; cls: string }) => (
  <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md ${cls}`}>{text}</span>
);

const LV = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-800 break-words">{value ?? "—"}</p>
  </div>
);

const DateInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="relative flex-1 min-w-[140px]">
    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700"
      title={label} placeholder={label} />
  </div>
);

// ─── Overlay modal ────────────────────────────────────────────────────────────
const Overlay = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// ─── User Detail Modal ────────────────────────────────────────────────────────
const UserDetail = ({ user, onClose, onSuspend }: {
  user: any; onClose: () => void; onSuspend: (id: string, active: boolean) => void;
}) => (
  <Overlay onClose={onClose}>
    <div className="flex items-center justify-between p-6 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
          {(user.fullName ?? "?")[0]}
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{user.fullName}</h2>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
        <X className="w-5 h-5 text-slate-400" />
      </button>
    </div>
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge text={user.isActive ? "Active" : "Suspended"} cls={user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"} />
        <Badge text={user.isEmailVerified ? "Email Verified" : "Not Verified"} cls={user.isEmailVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"} />
        <Badge text={user.role === "HEALTHCARE_PROFESSIONAL" ? "Healthcare Pro" : user.role} cls="bg-blue-50 text-blue-700" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <LV label="Full Name"    value={user.fullName} />
        <LV label="Institution"  value={user.institution} />
        <LV label="City"         value={user.city} />
        <LV label="Country"      value={user.country} />
        <LV label="Registered"   value={new Date(user.createdAt).toLocaleDateString()} />
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Profile Completeness</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: user.profileCompleteness }} />
            </div>
            <span className="text-xs font-bold text-slate-700">{user.profileCompleteness}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Posts",       value: user._count?.posts            ?? 0 },
          { label: "Meetings",    value: user._count?.meetingRequests   ?? 0 },
          { label: "Log Entries", value: user._count?.activityLogs      ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
            <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {user.role !== "ADMIN" && (
        <button onClick={() => onSuspend(user.id, user.isActive)}
          className={`w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border ${
            user.isActive ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"}`}>
          {user.isActive ? <><Ban className="w-4 h-4" /> Suspend Account</> : <><CheckCircle className="w-4 h-4" /> Activate Account</>}
        </button>
      )}
    </div>
  </Overlay>
);

// ─── Post Detail Modal ────────────────────────────────────────────────────────
const PostDetail = ({ post, onClose, onDelete }: {
  post: any; onClose: () => void; onDelete: (id: string) => void;
}) => (
  <Overlay onClose={onClose}>
    <div className="flex items-start justify-between p-6 border-b border-slate-100">
      <div className="pr-4">
        <h2 className="text-lg font-extrabold text-slate-900 mb-2">{post.title}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge text={post.status?.replace(/_/g, " ")} cls={STATUS_COLORS[post.status] ?? "bg-slate-100 text-slate-600"} />
          {post.workingDomain && <Badge text={post.workingDomain} cls="bg-blue-50 text-blue-700" />}
          {post.projectStage  && <Badge text={post.projectStage.replace(/_/g, " ")} cls="bg-indigo-50 text-indigo-700" />}
        </div>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0">
        <X className="w-5 h-5 text-slate-400" />
      </button>
    </div>
    <div className="p-6 space-y-5">
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Post Owner</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {(post.user?.fullName ?? "?")[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{post.user?.fullName}</p>
            <p className="text-xs text-slate-500">{post.user?.email} · {post.user?.role}</p>
          </div>
        </div>
      </div>
      {post.shortExplanation && (
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project Description</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.shortExplanation}</p>
        </div>
      )}
      {post.highLevelIdea && (
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">High Level Idea</p>
          <p className="text-sm text-slate-700 leading-relaxed">{post.highLevelIdea}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <LV label="Required Expertise" value={post.requiredExpertise} />
        <LV label="Collaboration Type" value={post.collaborationType} />
        <LV label="Commitment Level"   value={post.commitmentLevel} />
        <LV label="Confidentiality"    value={post.confidentiality} />
        <LV label="Location"           value={[post.city, post.country].filter(Boolean).join(", ")} />
        <LV label="Created"            value={new Date(post.createdAt).toLocaleDateString()} />
        {post.expiryDate && <LV label="Expiry Date" value={new Date(post.expiryDate).toLocaleDateString()} />}
        <LV label="Meeting Requests"   value={post.meetingRequests?.length ?? 0} />
      </div>
      <button onClick={() => onDelete(post.id)}
        className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors">
        <Trash2 className="w-4 h-4" /> Delete This Post
      </button>
    </div>
  </Overlay>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats,  setStats]  = useState<any>(null);
  const [users,  setUsers]  = useState<any[]>([]);
  const [posts,  setPosts]  = useState<any[]>([]);
  const [logs,   setLogs]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  // ── user filters ──────────────────────────────────────────────────────────
  const [userSearch,       setUserSearch]       = useState("");
  const [userRoleFilter,   setUserRoleFilter]   = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [userDateFrom,     setUserDateFrom]     = useState("");
  const [userDateTo,       setUserDateTo]       = useState("");

  // ── post filters ──────────────────────────────────────────────────────────
  const [postSearch,       setPostSearch]       = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState("ALL");
  const [postDomainFilter, setPostDomainFilter] = useState("");
  const [postDateFrom,     setPostDateFrom]     = useState("");
  const [postDateTo,       setPostDateTo]       = useState("");

  // ── log filters ───────────────────────────────────────────────────────────
  const [logSearch,        setLogSearch]        = useState("");
  const [logActionFilter,  setLogActionFilter]  = useState("ALL");
  const [logResultFilter,  setLogResultFilter]  = useState("ALL");
  const [logDateFrom,      setLogDateFrom]      = useState("");
  const [logDateTo,        setLogDateTo]        = useState("");

  // ── fetch helpers ─────────────────────────────────────────────────────────
  const fetchStats = async () => { try { setStats(await apiFetch("/admin/platform-stats")); } catch {} };

  const fetchUsers = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (userRoleFilter !== "ALL") p.set("role", userRoleFilter);
      if (userStatusFilter === "ACTIVE")    p.set("isActive", "true");
      if (userStatusFilter === "SUSPENDED") p.set("isActive", "false");
      if (userDateFrom) p.set("dateFrom", userDateFrom);
      if (userDateTo)   p.set("dateTo",   userDateTo);
      setUsers(await apiFetch<any[]>(`/admin/users?${p}`));
    } catch {}
  }, [userRoleFilter, userStatusFilter, userDateFrom, userDateTo]);

  const fetchPosts = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (postStatusFilter !== "ALL") p.set("status", postStatusFilter);
      if (postDomainFilter)           p.set("domain", postDomainFilter);
      if (postDateFrom) p.set("dateFrom", postDateFrom);
      if (postDateTo)   p.set("dateTo",   postDateTo);
      setPosts(await apiFetch<any[]>(`/admin/posts?${p}`));
    } catch {}
  }, [postStatusFilter, postDomainFilter, postDateFrom, postDateTo]);

  const fetchLogs = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (logActionFilter !== "ALL") p.set("actionType",   logActionFilter);
      if (logResultFilter !== "ALL") p.set("resultStatus", logResultFilter);
      if (logDateFrom) p.set("dateFrom", logDateFrom);
      if (logDateTo)   p.set("dateTo",   logDateTo);
      p.set("limit", "500");
      setLogs(await apiFetch<any[]>(`/logs?${p}`));
    } catch {}
  }, [logActionFilter, logResultFilter, logDateFrom, logDateTo]);

  // initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(), fetchPosts(), fetchLogs()]).then(() => setLoading(false));
  }, []);

  // re-fetch when server-side filters change
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetchLogs();  }, [fetchLogs]);

  // ── actions ───────────────────────────────────────────────────────────────
  const handleSuspendUser = async (id: string, currentlyActive: boolean) => {
    try {
      await apiFetch(`/admin/users/${id}/${currentlyActive ? "suspend" : "activate"}`, { method: "PATCH" });
      await fetchUsers();
      setSelectedUser((prev: any) => prev?.id === id ? { ...prev, isActive: !currentlyActive } : prev);
    } catch { alert("Failed to update user status"); }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Permanently delete this post?")) return;
    try {
      await apiFetch(`/admin/posts/${id}`, { method: "DELETE" });
      await fetchPosts();
      setSelectedPost(null);
    } catch { alert("Failed to delete post"); }
  };

  const downloadLogs = async () => {
    try {
      const token   = localStorage.getItem("accessToken");
      const base    = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const p       = new URLSearchParams();
      if (logActionFilter !== "ALL") p.set("actionType",   logActionFilter);
      if (logResultFilter !== "ALL") p.set("resultStatus", logResultFilter);
      if (logDateFrom) p.set("dateFrom", logDateFrom);
      if (logDateTo)   p.set("dateTo",   logDateTo);
      const res  = await fetch(`${base}/logs/export?${p}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "activity_logs.csv"; a.click();
    } catch { alert("Download failed"); }
  };

  // ── client-side text search on top of server results ─────────────────────
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.institution?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredPosts = useMemo(() => {
    const q = postSearch.toLowerCase();
    if (!q) return posts;
    return posts.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.user?.fullName?.toLowerCase().includes(q) ||
      p.workingDomain?.toLowerCase().includes(q)
    );
  }, [posts, postSearch]);

  const filteredLogs = useMemo(() => {
    const q = logSearch.toLowerCase();
    if (!q) return logs;
    return logs.filter(l =>
      l.user?.email?.toLowerCase().includes(q) ||
      l.user?.fullName?.toLowerCase().includes(q) ||
      l.ipAddress?.includes(q) ||
      l.targetEntity?.toLowerCase().includes(q) ||
      l.actionType?.toLowerCase().includes(q)
    );
  }, [logs, logSearch]);

  const uniqueDomains = useMemo(() => [...new Set(posts.map(p => p.workingDomain).filter(Boolean))].sort(), [posts]);
  const uniqueActions = useMemo(() => [...new Set(logs.map(l => l.actionType).filter(Boolean))].sort(), [logs]);

  const clearUserFilters = () => { setUserSearch(""); setUserRoleFilter("ALL"); setUserStatusFilter("ALL"); setUserDateFrom(""); setUserDateTo(""); };
  const clearPostFilters = () => { setPostSearch(""); setPostStatusFilter("ALL"); setPostDomainFilter(""); setPostDateFrom(""); setPostDateTo(""); };
  const clearLogFilters  = () => { setLogSearch(""); setLogActionFilter("ALL"); setLogResultFilter("ALL"); setLogDateFrom(""); setLogDateTo(""); };

  const userFiltersActive = !!(userSearch || userRoleFilter !== "ALL" || userStatusFilter !== "ALL" || userDateFrom || userDateTo);
  const postFiltersActive = !!(postSearch || postStatusFilter !== "ALL" || postDomainFilter || postDateFrom || postDateTo);
  const logFiltersActive  = !!(logSearch  || logActionFilter !== "ALL" || logResultFilter  !== "ALL"  || logDateFrom  || logDateTo);

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Admin Space</h1>
        <p className="text-sm text-slate-500 font-medium">Platform overview, moderation, and audit logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 mb-8 pb-px">
        {[
          { id: "overview", label: "Overview",                                          icon: Activity  },
          { id: "users",    label: `Users (${filteredUsers.length}/${users.length})`,   icon: Users     },
          { id: "posts",    label: `Posts (${filteredPosts.length}/${posts.length})`,   icon: FileText  },
          { id: "logs",     label: `Audit Logs (${filteredLogs.length}/${logs.length})`,icon: Activity  },
        ].map(tab => {
          const Icon   = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
                active ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────────────── */}
      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users",       value: stats.totalUsers,        color: "text-blue-600"    },
            { label: "Active Posts",       value: `${stats.activePosts} / ${stats.totalPosts}`, color: "text-indigo-600"  },
            { label: "Meetings Requested", value: stats.totalMeetings,     color: "text-emerald-600" },
            { label: "Partners Found",     value: stats.partnerFoundPosts, color: "text-purple-600"  },
          ].map(s => (
            <div key={s.label} className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-xl shadow-slate-200/50">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{s.label}</div>
              <div className={`text-4xl font-extrabold ${s.color}`}>{s.value}</div>
            </div>
          ))}
          <div className="col-span-2 lg:col-span-4 bg-white/70 border border-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">User Breakdown</div>
            <div className="flex gap-8">
              <div><span className="font-extrabold text-2xl text-blue-600">{stats.userBreakdown?.engineers ?? 0}</span><div className="text-xs text-slate-500 mt-1">Engineers</div></div>
              <div><span className="font-extrabold text-2xl text-teal-600">{stats.userBreakdown?.healthcareProfessionals ?? 0}</span><div className="text-xs text-slate-500 mt-1">Healthcare Professionals</div></div>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS ──────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white/70 border border-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              {/* text search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  placeholder="Search name, email, institution, city…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                {userSearch && <button onClick={() => setUserSearch("")} className="absolute right-2 top-2.5"><X className="w-4 h-4 text-slate-400 hover:text-slate-700" /></button>}
              </div>
              {/* role */}
              <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}
                className="text-sm rounded-xl border border-slate-200 bg-white/60 px-3 py-2 focus:outline-none font-medium">
                <option value="ALL">All Roles</option>
                <option value="ENGINEER">Engineer</option>
                <option value="HEALTHCARE_PROFESSIONAL">Healthcare Professional</option>
                <option value="ADMIN">Admin</option>
              </select>
              {/* status */}
              <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}
                className="text-sm rounded-xl border border-slate-200 bg-white/60 px-3 py-2 focus:outline-none font-medium">
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            {/* date row */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Registered:</span>
              <DateInput label="From" value={userDateFrom} onChange={setUserDateFrom} />
              <DateInput label="To"   value={userDateTo}   onChange={setUserDateTo}   />
              {userFiltersActive && (
                <button onClick={clearUserFilters} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
                  Clear all
                </button>
              )}
              <span className="text-xs text-slate-400 font-medium ml-auto">{filteredUsers.length} / {users.length} users</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            {filteredUsers.length === 0
              ? <div className="py-16 text-center text-slate-400">No users match the current filters.</div>
              : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-xs uppercase font-bold tracking-wider text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role / Institution</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Profile</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                          <div className="text-xs text-slate-400">{u.city}{u.country ? `, ${u.country}` : ""}</div>
                          <div className="text-[10px] text-slate-300 mt-0.5">{new Date(u.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge text={u.role === "HEALTHCARE_PROFESSIONAL" ? "Healthcare Pro" : u.role} cls="bg-blue-50 text-blue-700 mb-1" />
                          <div className="text-xs text-slate-500 mt-1">{u.institution || "—"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge text={u.isActive ? "Active" : "Suspended"} cls={u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"} />
                          <div className="text-[10px] text-slate-400 mt-1">{u.isEmailVerified ? "✓ Verified" : "✗ Not verified"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: u.profileCompleteness }} />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{u.profileCompleteness}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{u._count?.posts ?? 0} posts · {u._count?.meetingRequests ?? 0} meetings</div>
                        </td>
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex flex-col gap-2">
                            <button onClick={() => setSelectedUser(u)}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors">
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                            {u.role !== "ADMIN" && (
                              <button onClick={() => handleSuspendUser(u.id, u.isActive)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                  u.isActive ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                                {u.isActive ? <><Ban className="w-3.5 h-3.5" /> Suspend</> : <><CheckCircle className="w-3.5 h-3.5" /> Activate</>}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      )}

      {/* ── POSTS ──────────────────────────────────────────────────────────── */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <div className="bg-white/70 border border-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  placeholder="Search title, author, domain…" value={postSearch} onChange={e => setPostSearch(e.target.value)} />
                {postSearch && <button onClick={() => setPostSearch("")} className="absolute right-2 top-2.5"><X className="w-4 h-4 text-slate-400 hover:text-slate-700" /></button>}
              </div>
              <select value={postStatusFilter} onChange={e => setPostStatusFilter(e.target.value)}
                className="text-sm rounded-xl border border-slate-200 bg-white/60 px-3 py-2 focus:outline-none font-medium">
                <option value="ALL">All Statuses</option>
                {["ACTIVE","DRAFT","MEETING_SCHEDULED","PARTNER_FOUND","EXPIRED"].map(s =>
                  <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
              </select>
              <select value={postDomainFilter} onChange={e => setPostDomainFilter(e.target.value)}
                className="text-sm rounded-xl border border-slate-200 bg-white/60 px-3 py-2 focus:outline-none font-medium">
                <option value="">All Domains</option>
                {uniqueDomains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Published:</span>
              <DateInput label="From" value={postDateFrom} onChange={setPostDateFrom} />
              <DateInput label="To"   value={postDateTo}   onChange={setPostDateTo}   />
              {postFiltersActive && (
                <button onClick={clearPostFilters} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
                  Clear all
                </button>
              )}
              <span className="text-xs text-slate-400 font-medium ml-auto">{filteredPosts.length} / {posts.length} posts</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            {filteredPosts.length === 0
              ? <div className="py-16 text-center text-slate-400">No posts match the current filters.</div>
              : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-xs uppercase font-bold tracking-wider text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Post</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Domain / Stage</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPosts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedPost(p)}>
                        <td className="px-6 py-4 max-w-[220px]">
                          <div className="font-bold text-slate-900 truncate" title={p.title}>{p.title}</div>
                          <div className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">{p.user?.fullName}</div>
                          <div className="text-xs text-slate-400">{p.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-700">{p.workingDomain}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{p.projectStage?.replace(/_/g," ")}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge text={p.status?.replace(/_/g," ")} cls={STATUS_COLORS[p.status] ?? "bg-slate-100 text-slate-600"} />
                        </td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedPost(p)}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button onClick={() => handleDeletePost(p.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      )}

      {/* ── LOGS ───────────────────────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="bg-white/70 border border-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  placeholder="Search email, IP, path, action…" value={logSearch} onChange={e => setLogSearch(e.target.value)} />
                {logSearch && <button onClick={() => setLogSearch("")} className="absolute right-2 top-2.5"><X className="w-4 h-4 text-slate-400 hover:text-slate-700" /></button>}
              </div>
              <select value={logActionFilter} onChange={e => setLogActionFilter(e.target.value)}
                className="text-sm rounded-xl border border-slate-200 bg-white/60 px-3 py-2 focus:outline-none font-medium">
                <option value="ALL">All Actions</option>
                {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={logResultFilter} onChange={e => setLogResultFilter(e.target.value)}
                className="text-sm rounded-xl border border-slate-200 bg-white/60 px-3 py-2 focus:outline-none font-medium">
                <option value="ALL">All Results</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Date range:</span>
              <DateInput label="From" value={logDateFrom} onChange={setLogDateFrom} />
              <DateInput label="To"   value={logDateTo}   onChange={setLogDateTo}   />
              {logFiltersActive && (
                <button onClick={clearLogFilters} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
                  Clear all
                </button>
              )}
              <span className="text-xs text-slate-400 font-medium">{filteredLogs.length} / {logs.length} entries</span>
              <button onClick={downloadLogs}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 ml-auto">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredLogs.length === 0
                ? <div className="py-16 text-center text-slate-400">No log entries match the current filters.</div>
                : (
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-white text-xs uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">User / IP</th>
                        <th className="px-6 py-4">Path</th>
                        <th className="px-6 py-4">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              text={log.actionType}
                              cls={ACTION_COLORS[log.actionType] ?? "bg-slate-100 text-slate-600"}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-semibold text-slate-700">{log.user?.email || "SYSTEM"}</div>
                            <div className="text-[10px] text-slate-400">{log.user?.role ?? ""}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{log.ipAddress}</div>
                          </td>
                          <td className="px-6 py-4 max-w-[180px]">
                            <div className="text-[10px] text-slate-500 font-mono truncate" title={log.targetEntity}>{log.targetEntity}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              text={log.resultStatus}
                              cls={log.resultStatus === "SUCCESS" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          </div>
        </div>
      )}

      {/* modals */}
      {selectedUser && <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} onSuspend={handleSuspendUser} />}
      {selectedPost && <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} onDelete={handleDeletePost} />}
    </div>
  );
};
