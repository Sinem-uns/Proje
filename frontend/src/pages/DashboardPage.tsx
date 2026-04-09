import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { PlusCircle, Calendar, FileText, CheckCircle, XCircle, ArrowRight } from "lucide-react";

type Meeting = {
  id: string;
  status: string;
  message?: string;
  proposedTime?: string;
  post: { title: string };
  requester: { fullName: string; role: string };
};

export const DashboardPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // First get my profile which includes posts and meetings
      const profile = await apiFetch<any>("/profile/export"); // Reusing export endpoint to get all user data 
      setPosts(profile.posts || []);
      setSentRequests(profile.meetingRequests || []);
      
      // we need to see meetings that were requested ON our posts
      // but export only shows meetings requested BY us.
      // So let's fetch my posts in detail
      const myPostsDetailed = await Promise.all(
         (profile.posts || []).map((p: any) => apiFetch<any>(`/posts/${p.id}`))
      );
      
      const incomingMeetings: any[] = [];
      myPostsDetailed.forEach((p) => {
         if (p.meetingRequests) {
            p.meetingRequests.forEach((m: any) => {
                incomingMeetings.push({ ...m, post: { title: p.title } });
            });
         }
      });
      setMeetings(incomingMeetings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMeetingAction = async (id: string, action: "ACCEPT" | "REJECT") => {
    try {
        await apiFetch(`/meetings/${id}/respond`, {
            method: "PATCH",
            body: JSON.stringify({ action })
        });
        fetchData(); // Refresh UI
    } catch(e) {
        alert("Failed to update meeting status");
    }
  };

  const handleClosePost = async (id: string) => {
    if (!window.confirm("Great news! Mark this post as 'Partner Found' and close it?")) return;
    try {
      await apiFetch(`/posts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "PARTNER_FOUND" })
      });
      fetchData();
    } catch(e) {
      alert("Failed to close post");
    }
  };

  const handleReopenPost = async (id: string) => {
    if (!window.confirm("Are you sure you want to reopen this post and accept new meetings?")) return;
    try {
      await apiFetch(`/posts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" })
      });
      fetchData();
    } catch(e) {
      alert("Failed to reopen post");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await apiFetch(`/posts/${id}`, { method: "DELETE" });
      fetchData();
    } catch(e) {
      alert("Failed to delete post");
    }
  };

  const handleEditRequest = async (req: any) => {
    if (req.status !== "PENDING") {
      alert("You can only edit PENDING requests.");
      return;
    }
    const newMsg = prompt("Update your introductory message:", req.message || "");
    if (newMsg === null) return;
    try {
      await apiFetch(`/meetings/${req.id}`, {
        method: "PUT",
        body: JSON.stringify({ message: newMsg }),
      });
      fetchData();
    } catch (e) {
      alert("Failed to edit request");
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this meeting request?")) return;
    try {
      await apiFetch(`/meetings/${id}`, { method: "DELETE" });
      fetchData();
    } catch(e) {
      alert("Failed to delete request");
    }
  };

  if (loading) return (
      <div className="min-h-[50vh] flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            My Dashboard
            </h1>
            <p className="text-slate-500 font-medium">Manage your collaboration posts and meeting requests.</p>
        </div>
        <Link
          to="/posts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Posts Sections */}
        <section className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><FileText className="w-5 h-5" /></div>
             <h2 className="text-xl font-bold text-slate-800">My Posts</h2>
          </div>
          
          <div className="space-y-4">
             {posts.length === 0 ? (
                 <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-slate-500 text-sm font-medium">You haven't created any posts yet.</p>
                 </div>
             ) : (
                 posts.map(post => (
                    <div key={post.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                <Link to={`/posts/${post.id}`}>{post.title}</Link>
                            </h3>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{post.status.replace(/_/g, " ")}</span>
                                <div className="flex gap-2 text-[10px] font-semibold">
                                    {post.status !== "PARTNER_FOUND" && post.status !== "EXPIRED" && (
                                        <button onClick={(e) => { e.preventDefault(); handleClosePost(post.id); }} className="text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-2 py-0.5 rounded">Mark Found</button>
                                    )}
                                    {(post.status === "PARTNER_FOUND" || post.status === "EXPIRED") && (
                                        <button onClick={(e) => { e.preventDefault(); handleReopenPost(post.id); }} className="text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 px-2 py-0.5 rounded">Reopen</button>
                                    )}
                                    <Link to={`/posts/${post.id}/edit`} className="text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-0.5 rounded cursor-pointer">Edit</Link>
                                    <button onClick={(e) => { e.preventDefault(); handleDeletePost(post.id); }} className="text-red-500 hover:text-red-700 transition-colors bg-red-50 px-2 py-0.5 rounded">Delete</button>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{post.shortExplanation}</p>
                        <div className="text-xs text-slate-400 font-medium">Created {new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>
                 ))
             )}
          </div>
        </section>

        {/* Meetings Section */}
        <section className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl"><Calendar className="w-5 h-5" /></div>
             <h2 className="text-xl font-bold text-slate-800">Incoming Meetings</h2>
          </div>
          
          <div className="space-y-4">
             {meetings.length === 0 ? (
                 <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-slate-500 text-sm font-medium">No incoming meeting requests at the moment.</p>
                 </div>
             ) : (
                 meetings.map(meeting => (
                    <div key={meeting.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800 mb-0.5">Regarding: {meeting.post.title}</h3>
                                {meeting.proposedTime && (
                                   <div className="text-xs font-semibold text-blue-600 mb-2">
                                     Proposed: {new Date(meeting.proposedTime).toLocaleString()}
                                   </div>
                                )}
                            </div>
                            <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{meeting.status}</span>
                        </div>
                        
                        {meeting.message && (
                            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                                "{meeting.message}"
                            </div>
                        )}

                        {meeting.status === "PENDING" && (
                            <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                                <button onClick={() => handleMeetingAction(meeting.id, "ACCEPT")} className="flex-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs py-2.5 hover:bg-emerald-100 transition-colors flex justify-center items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4" /> Accept
                                </button>
                                <button onClick={() => handleMeetingAction(meeting.id, "REJECT")} className="flex-1 rounded-xl bg-red-50 text-red-700 font-bold text-xs py-2.5 hover:bg-red-100 transition-colors flex justify-center items-center gap-1.5">
                                    <XCircle className="w-4 h-4" /> Decline
                                </button>
                            </div>
                        )}
                    </div>
                 ))
             )}
          </div>
        </section>

        {/* Sent Requests Section */}
        <section className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 lg:col-span-2 mt-8 lg:mt-0">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-orange-100 text-orange-600 p-2 rounded-xl"><ArrowRight className="w-5 h-5" /></div>
             <h2 className="text-xl font-bold text-slate-800">My Sent Requests</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {sentRequests.length === 0 ? (
                 <div className="col-span-1 md:col-span-2 text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-slate-500 text-sm font-medium">You haven't requested any meetings yet.</p>
                 </div>
             ) : (
                 sentRequests.map(req => (
                    <div key={req.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-800 line-clamp-1">To Post: {req.post?.title}</h3>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{req.status}</span>
                                {req.status === "PENDING" && (
                                  <div className="flex gap-2 text-[10px] font-semibold mt-1">
                                      <button onClick={() => handleEditRequest(req)} className="text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-0.5 rounded cursor-pointer">Edit</button>
                                      <button onClick={() => handleDeleteRequest(req.id)} className="text-red-500 hover:text-red-700 transition-colors bg-red-50 px-2 py-0.5 rounded cursor-pointer">Delete</button>
                                  </div>
                                )}
                            </div>
                        </div>
                        {req.proposedTime && (
                           <div className="text-xs font-semibold text-blue-600 mb-2">
                             Proposed: {new Date(req.proposedTime).toLocaleString()}
                           </div>
                        )}
                        <p className="text-sm text-slate-500 line-clamp-2 italic">"{req.message}"</p>
                    </div>
                 ))
             )}
          </div>
        </section>
      </div>
    </div>
  );
};
