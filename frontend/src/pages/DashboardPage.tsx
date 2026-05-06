import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { PlusCircle, Calendar, FileText, CheckCircle, XCircle, ArrowRight, Clock, Pencil, Trash2, RefreshCw } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-green-100 text-green-700",
  MEETING_SCHEDULED: "bg-blue-100 text-blue-700",
  PARTNER_FOUND: "bg-purple-100 text-purple-700",
  EXPIRED: "bg-red-100 text-red-600",
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
};

export const DashboardPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Propose new time modal state
  const [proposeModal, setProposeModal] = useState<{ open: boolean; meetingId: string; forRequester: boolean }>({
    open: false, meetingId: "", forRequester: false,
  });
  const [proposeTime, setProposeTime] = useState("");
  const [proposing, setProposing] = useState(false);

  // Edit message modal state
  const [editModal, setEditModal] = useState<{ open: boolean; req: any | null }>({ open: false, req: null });
  const [editMsg, setEditMsg] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exportData, incomingData, sentData] = await Promise.all([
        apiFetch<any>("/profile/export"),
        apiFetch<any[]>("/meetings/incoming"),
        apiFetch<any[]>("/meetings/sent"),
      ]);
      setPosts(exportData.posts || []);
      setIncoming(incomingData);
      setSent(sentData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMeetingAction = async (id: string, action: "ACCEPT" | "REJECT") => {
    try {
      await apiFetch(`/meetings/${id}/respond`, { method: "PATCH", body: JSON.stringify({ action }) });
      fetchData();
    } catch { alert("Failed to update meeting status"); }
  };

  const handleProposeNewTime = async () => {
    if (!proposeTime) return;
    setProposing(true);
    try {
      await apiFetch(`/meetings/${proposeModal.meetingId}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ action: "PROPOSE_NEW_TIME", new_time: new Date(proposeTime).toISOString() }),
      });
      setProposeModal({ open: false, meetingId: "", forRequester: false });
      setProposeTime("");
      fetchData();
    } catch { alert("Failed to propose new time"); }
    finally { setProposing(false); }
  };

  const handleEditRequest = async () => {
    if (!editModal.req) return;
    setEditSaving(true);
    try {
      await apiFetch(`/meetings/${editModal.req.id}`, {
        method: "PUT",
        body: JSON.stringify({
          message: editMsg,
          ...(editTime && { proposed_time: new Date(editTime).toISOString() }),
        }),
      });
      setEditModal({ open: false, req: null });
      fetchData();
    } catch { alert("Failed to edit request"); }
    finally { setEditSaving(false); }
  };

  const handlePostStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/posts/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      fetchData();
    } catch { alert("Failed to update post status"); }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await apiFetch(`/posts/${id}`, { method: "DELETE" });
      fetchData();
    } catch { alert("Failed to delete post"); }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm("Cancel this meeting request?")) return;
    try {
      await apiFetch(`/meetings/${id}`, { method: "DELETE" });
      fetchData();
    } catch { alert("Failed to cancel request"); }
  };

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );

  const pendingCount = incoming.filter(m => m.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
      {/* ── Propose New Time Modal ─────────────────────────────────────── */}
      {proposeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Propose a New Time</h3>
            <p className="text-sm text-slate-500 mb-6">
              Select a new proposed meeting time. Both parties will be notified.
            </p>
            <input
              type="datetime-local"
              value={proposeTime}
              onChange={e => setProposeTime(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={handleProposeNewTime}
                disabled={!proposeTime || proposing}
                className="flex-1 rounded-xl bg-blue-600 text-white font-bold text-sm py-3 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {proposing ? "Sending…" : "Confirm New Time"}
              </button>
              <button
                onClick={() => { setProposeModal({ open: false, meetingId: "", forRequester: false }); setProposeTime(""); }}
                className="flex-1 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm py-3 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Request Modal ─────────────────────────────────────────── */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Edit Meeting Request</h3>
            <p className="text-sm text-slate-500 mb-6">Update your message or proposed time.</p>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Proposed Time</label>
            <input
              type="datetime-local"
              value={editTime}
              onChange={e => setEditTime(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 mb-4"
            />
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Message</label>
            <textarea
              value={editMsg}
              onChange={e => setEditMsg(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 mb-6"
              placeholder="Update your introductory message…"
            />
            <div className="flex gap-3">
              <button
                onClick={handleEditRequest}
                disabled={editSaving}
                className="flex-1 rounded-xl bg-blue-600 text-white font-bold text-sm py-3 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditModal({ open: false, req: null })}
                className="flex-1 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm py-3 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">My Dashboard</h1>
          <p className="text-slate-500 font-medium">Manage your collaboration posts and meeting requests.</p>
        </div>
        <Link to="/posts/new" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
          <PlusCircle className="w-5 h-5" /> Create Post
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── MY POSTS ─────────────────────────────────────────────────── */}
        <section className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><FileText className="w-5 h-5" /></div>
            <h2 className="text-xl font-bold text-slate-800">My Posts</h2>
            <span className="text-xs text-slate-400 font-medium">{posts.length} total</span>
          </div>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-500 text-sm font-medium">No posts yet.</p>
                <Link to="/posts/new" className="text-blue-600 font-bold text-sm hover:underline mt-1 block">Create your first post →</Link>
              </div>
            ) : posts.map(post => (
              <div key={post.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${STATUS_COLOR[post.status] || "bg-slate-100 text-slate-600"}`}>
                    {post.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{post.shortExplanation}</p>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  {(post.status === "ACTIVE" || post.status === "MEETING_SCHEDULED") && (
                    <button onClick={() => handlePostStatus(post.id, "PARTNER_FOUND")} className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors">
                      ✓ Mark Partner Found
                    </button>
                  )}
                  {post.status === "DRAFT" && (
                    <button onClick={() => handlePostStatus(post.id, "ACTIVE")} className="bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors">
                      Publish
                    </button>
                  )}
                  {(post.status === "PARTNER_FOUND" || post.status === "EXPIRED") && (
                    <button onClick={() => handlePostStatus(post.id, "ACTIVE")} className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors">
                      Reopen
                    </button>
                  )}
                  <Link to={`/posts/${post.id}/edit`} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </Link>
                  <button onClick={() => handleDeletePost(post.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── INCOMING MEETINGS ─────────────────────────────────────────── */}
        <section className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl"><Calendar className="w-5 h-5" /></div>
            <h2 className="text-xl font-bold text-slate-800">Incoming Meetings</h2>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </div>
          <div className="space-y-4">
            {incoming.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-500 text-sm font-medium">No incoming meeting requests.</p>
              </div>
            ) : incoming.map(m => (
              <div key={m.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{m.requester?.fullName}</h3>
                    <p className="text-xs text-slate-500">{m.requester?.role?.replace(/_/g, " ")} · {m.requester?.institution}</p>
                    <p className="text-xs text-slate-400">{m.requester?.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${STATUS_COLOR[m.status] || "bg-slate-100 text-slate-600"}`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 mb-1">Post: <span className="font-semibold text-slate-700">{m.post?.title}</span></p>
                {m.proposedTime && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mb-2">
                    <Clock className="w-3 h-3" /> {new Date(m.proposedTime).toLocaleString()}
                  </div>
                )}
                {m.message && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 italic">"{m.message}"</div>
                )}
                {m.status === "PENDING" && (
                  <div className="flex gap-2 pt-3 border-t border-slate-100 flex-wrap">
                    <button onClick={() => handleMeetingAction(m.id, "ACCEPT")} className="flex-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs py-2.5 hover:bg-emerald-100 transition-colors flex justify-center items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleMeetingAction(m.id, "REJECT")} className="flex-1 rounded-xl bg-red-50 text-red-700 font-bold text-xs py-2.5 hover:bg-red-100 transition-colors flex justify-center items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                    <button
                      onClick={() => { setProposeModal({ open: true, meetingId: m.id, forRequester: false }); setProposeTime(""); }}
                      className="flex-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs py-2.5 hover:bg-blue-100 transition-colors flex justify-center items-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" /> Propose New Time
                    </button>
                  </div>
                )}
                {m.status === "ACCEPTED" && m.proposedTime && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
                    <CheckCircle className="w-4 h-4" />
                    Meeting confirmed: {new Date(m.proposedTime).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── SENT REQUESTS ─────────────────────────────────────────────── */}
        <section className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl"><ArrowRight className="w-5 h-5" /></div>
            <h2 className="text-xl font-bold text-slate-800">My Sent Requests</h2>
            <span className="text-xs text-slate-400 font-medium">{sent.length} total</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sent.length === 0 ? (
              <div className="col-span-2 text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-500 text-sm font-medium">No sent requests yet.</p>
              </div>
            ) : sent.map(req => (
              <div key={req.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{req.post?.title}</h3>
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${STATUS_COLOR[req.status] || "bg-slate-100 text-slate-600"}`}>
                    {req.status}
                  </span>
                </div>
                {req.proposedTime && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mb-2">
                    <Clock className="w-3 h-3" /> {new Date(req.proposedTime).toLocaleString()}
                  </div>
                )}
                {req.message && <p className="text-sm text-slate-500 italic mb-3 line-clamp-2">"{req.message}"</p>}

                {req.status === "ACCEPTED" && req.proposedTime && (
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
                    <CheckCircle className="w-4 h-4" />
                    Confirmed: {new Date(req.proposedTime).toLocaleString()}
                  </div>
                )}
                {req.status === "REJECTED" && (
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 rounded-xl px-3 py-2">
                    <XCircle className="w-4 h-4" /> Request was declined.
                  </div>
                )}

                {req.status === "PENDING" && (
                  <div className="flex gap-2 text-[11px] font-semibold flex-wrap">
                    <button
                      onClick={() => {
                        setEditModal({ open: true, req });
                        setEditMsg(req.message || "");
                        setEditTime(req.proposedTime ? new Date(req.proposedTime).toISOString().slice(0, 16) : "");
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDeleteRequest(req.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                      <Trash2 className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
