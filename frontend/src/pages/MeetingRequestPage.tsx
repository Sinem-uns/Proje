import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Calendar, MessageSquare, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

export const MeetingRequestPage = () => {
  const { id } = useParams<{ id: string }>(); // Post ID
  const navigate = useNavigate();
  
  const [postTitle, setPostTitle] = useState("Loading Post...");
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [proposedTime, setProposedTime] = useState(""); // Simplified to a single time for better UI
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch post title to show context
    const loadPost = async () => {
        try {
            const data = await apiFetch<any>(`/posts/${id}`);
            setPostTitle(data.title);
        } catch(e) {
            setPostTitle("Unknown Post");
        }
    }
    loadPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
        setError("You must accept the NDA to request a meeting.");
        return;
    }
    if (!proposedTime) {
        setError("Please select a proposed time.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiFetch(`/meetings/posts/${id}`, {
        method: "POST",
        body: JSON.stringify({
          message,
          nda_accepted: agreed,
          proposed_time: new Date(proposedTime).toISOString()
        }),
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to send meeting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in-up">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
          Express Interest
        </h1>
        <p className="text-sm text-slate-500 font-medium">Requesting a meeting for: <span className="font-bold text-slate-800">{postTitle}</span></p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white p-6 sm:p-8">
        
        {/* NDA Warning Banner */}
        <div className="mb-4 rounded-xl bg-amber-50/80 border border-amber-200/50 p-3 flex items-start gap-3 shadow-sm">
            <div className="bg-amber-100 rounded-full p-2 mt-0.5"><ShieldAlert className="w-5 h-5 text-amber-600"/></div>
            <div>
                <h3 className="text-sm font-bold text-amber-900 mb-1">Non-Disclosure & Data Policy</h3>
                <p className="text-sm text-amber-800/80 leading-relaxed">
                    By proposing a meeting, you are bound by strict academic confidentiality.
                    <strong> Never share patient data, PHI, or identifiable medical records</strong>. 
                    Meeting logistics (Zoom/Teams links) will be handled externally upon acceptance.
                </p>
            </div>
        </div>

        {error && (
            <div className="mb-6 rounded-2xl bg-red-50/80 border border-red-100 p-4 text-sm text-red-600 flex items-center gap-3">
                <div className="bg-red-100 rounded-full p-1"><ShieldAlert className="w-4 h-4 text-red-600"/></div>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Proposed Time
            </label>
            <div className="relative">
                <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                    type="datetime-local" 
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-12 pr-4 py-3.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                    required 
                />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Introductory Message (Optional)
            </label>
            <div className="relative">
                <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-12 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none h-20" 
                    placeholder="Briefly introduce yourself and why you're a good fit..."
                />
            </div>
          </div>
          
          <div className="pt-2 pb-1">
            <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                    <input 
                        type="checkbox" 
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="peer h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all" 
                    />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-bold text-slate-800 block mb-0.5 group-hover:text-blue-900 transition-colors">I accept the Non-Disclosure Agreement</span>
                    <span className="text-xs text-slate-500 block">I confirm that no patient data will be discussed.</span>
                </div>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2 group"
          >
            {loading ? "Sending Request..." : (
               <>
                  Submit Meeting Request
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
