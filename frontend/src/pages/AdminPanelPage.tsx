import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { Users, FileText, Activity, Download, Ban, CheckCircle, Trash2 } from "lucide-react";

export const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
        const data = await apiFetch("/admin/platform-stats");
        setStats(data);
    } catch(e) {}
  };

  const fetchUsers = async () => {
    try {
        const data = await apiFetch<any[]>("/admin/users");
        setUsers(data);
    } catch(e) {}
  };

  const fetchPosts = async () => {
    try {
        const data = await apiFetch<any[]>("/admin/posts");
        setPosts(data);
    } catch(e) {}
  };

  const fetchLogs = async () => {
    try {
        const data = await apiFetch<any[]>("/logs");
        setLogs(data);
    } catch(e) {}
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(), fetchPosts(), fetchLogs()]).then(() => setLoading(false));
  }, []);

  const handleSuspendUser = async (id: string, currentlyActive: boolean) => {
    const action = currentlyActive ? "suspend" : "activate";
    try {
        await apiFetch(`/admin/users/${id}/${action}`, { method: "PATCH" });
        fetchUsers();
    } catch(e) {
        alert("Failed to update user status");
    }
  };

  const handleDeletePost = async (id: string) => {
    if(!window.confirm("Are you sure you want to delete this post?")) return;
    try {
        await apiFetch(`/admin/posts/${id}`, { method: "DELETE" });
        fetchPosts();
    } catch(e) {
        alert("Failed to delete post");
    }
  };

  const downloadLogs = async () => {
    try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5000/logs/export", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "activity_logs.csv";
        a.click();
    } catch(e) {
        alert("Download failed");
    }
  };

  if(loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Admin Space</h1>
           <p className="text-sm text-slate-500 font-medium">Platform overview, moderation, and audit logs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 mb-8 pb-px">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "users", label: "Users", icon: Users },
          { id: "posts", label: "Posts", icon: FileText },
          { id: "logs", label: "Audit Logs", icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
                isActive ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      <div className="min-h-[50vh]">
          {activeTab === "overview" && stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-xl shadow-slate-200/50">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Users</div>
                    <div className="text-4xl font-extrabold text-blue-600">{stats.totalUsers}</div>
                 </div>
                 <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-xl shadow-slate-200/50">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Active Posts</div>
                    <div className="text-4xl font-extrabold text-indigo-600">{stats.activePosts} <span className="text-sm font-medium text-slate-400">/ {stats.totalPosts}</span></div>
                 </div>
                 <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-xl shadow-slate-200/50">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Meetings Requested</div>
                    <div className="text-4xl font-extrabold text-emerald-600">{stats.totalMeetings}</div>
                 </div>
              </div>
          )}

          {activeTab === "users" && (
              <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 text-xs uppercase font-bold tracking-wider text-slate-500 border-b border-slate-100">
                      <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Role / Inst.</th>
                          <th className="px-6 py-4">Profile Completion</th>
                          <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="font-bold text-slate-900">{u.fullName}</div>
                                  <div className="text-xs text-slate-500">{u.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="font-bold text-blue-600">{u.role}</div>
                                  <div className="text-xs text-slate-500">{u.institution || "Unknown"}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                                          <div className="bg-emerald-500 h-2 rounded-full" style={{width: u.profileCompleteness}}></div>
                                      </div>
                                      <span className="text-xs font-bold text-slate-700">{u.profileCompleteness}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  {u.role !== "ADMIN" && (
                                     <button onClick={() => handleSuspendUser(u.id, u.isActive)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${u.isActive ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                                        {u.isActive ? <><Ban className="w-3.5 h-3.5" /> Suspend</> : <><CheckCircle className="w-3.5 h-3.5" /> Activate</>}
                                     </button>
                                  )}
                              </td>
                          </tr>
                       ))}
                    </tbody>
                </table>
              </div>
          )}

          {activeTab === "posts" && (
              <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 text-xs uppercase font-bold tracking-wider text-slate-500 border-b border-slate-100">
                      <tr>
                          <th className="px-6 py-4">Post Info</th>
                          <th className="px-6 py-4">Author</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {posts.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors max-w-sm truncate" title={p.title}>{p.title}</div>
                                  <div className="text-xs text-slate-500">{p.workingDomain}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="font-bold text-slate-700">{p.user?.fullName}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{p.status}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button onClick={() => handleDeletePost(p.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                                     <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                              </td>
                          </tr>
                       ))}
                    </tbody>
                </table>
              </div>
          )}

          {activeTab === "logs" && (
              <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-700">Recent Activity</h3>
                    <button onClick={downloadLogs} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-white text-xs uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 sticky top-0">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Result</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-xs">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{log.actionType}</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={log.targetEntity}>{log.targetEntity}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-700">{log.user?.email || "SYSTEM"}</div>
                                    <div className="text-[10px] text-slate-400">{log.ipAddress}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md ${log.resultStatus === "SUCCESS" ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                        {log.resultStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
              </div>
          )}
      </div>
    </div>
  );
};
