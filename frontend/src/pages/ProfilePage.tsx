import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { User, ShieldCheck, Download, Trash2, AlertTriangle } from "lucide-react";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch("/profile");
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDownloadData = async () => {
    try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5000/profile/export", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my_personal_data.json";
        a.click();
    } catch(e) {
        alert("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
        return;
    }
    try {
        await apiFetch("/profile", { method: "DELETE" });
        localStorage.removeItem("accessToken");
        navigate("/");
    } catch(e) {
        alert("Failed to delete account");
    }
  };

  if(loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30 text-white flex items-center justify-center font-bold text-2xl uppercase">
            {profile?.fullName?.charAt(0) || "U"}
        </div>
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">{profile?.fullName}</h1>
           <p className="text-sm text-slate-500 font-medium">{profile?.role} @ {profile?.institution}</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Stats */}
        <section className="col-span-1 lg:col-span-2 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-100 text-slate-600 p-2 rounded-xl"><User className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">Basic Info</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
             <div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
                 <div className="text-sm font-semibold text-slate-800">{profile?.email}</div>
             </div>
             <div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">City</div>
                 <div className="text-sm font-semibold text-slate-800">{profile?.city}</div>
             </div>
             <div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Country</div>
                 <div className="text-sm font-semibold text-slate-800">{profile?.country}</div>
             </div>
             <div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</div>
                 <div className="text-sm font-semibold text-slate-800">{new Date(profile?.createdAt || "").toLocaleDateString()}</div>
             </div>
          </div>
        </section>

        {/* GDPR Section */}
        <section className="col-span-1 border-2 border-slate-900 bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
          
          {/* Decorative */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
          </div>

          <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2">
                GDPR Center
            </h2>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                You have full control over your personal data. Request a portable export of your information or permanently delete your account at any time.
            </p>
            
            <div className="space-y-4 mt-auto">
                <button onClick={handleDownloadData} className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all group">
                    Extract JSON Data
                    <Download className="w-4 h-4 opacity-70 group-hover:translate-y-0.5 transition-transform" />
                </button>
                <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 font-bold text-sm transition-all group">
                    Delete Account
                    <Trash2 className="w-4 h-4 opacity-70 group-hover:scale-110 transition-transform" />
                </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
