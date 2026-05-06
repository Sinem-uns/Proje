import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { User, ShieldCheck, Download, Trash2, Pencil, Save, X, AlertTriangle, Lock } from "lucide-react";

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ email, onClose, onConfirm }: {
  email: string;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError("Please enter your password."); return; }
    setLoading(true);
    setError("");
    try {
      // verify password by attempting login first
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await onConfirm(password);
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
        onClick={e => e.stopPropagation()}>

        {/* icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 text-center mb-1">Delete Account?</h2>
        <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
          This will <strong className="text-slate-800">permanently delete</strong> your account and all
          associated data including posts, meeting requests, and activity logs.
          <br /><span className="text-red-600 font-semibold">This action cannot be undone.</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Confirm your password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                autoFocus
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {loading ? "Deleting…" : <><Trash2 className="w-4 h-4" /> Delete My Account</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile]       = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState({ fullName: "", institution: "", city: "", country: "" });

  const fetchProfile = async () => {
    try {
      const data = await apiFetch<any>("/profile");
      setProfile(data);
      setForm({ fullName: data.fullName || "", institution: data.institution || "", city: data.city || "", country: data.country || "" });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch<any>("/profile", { method: "PUT", body: JSON.stringify(form) });
      setProfile(updated);
      setEditing(false);
    } catch { alert("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleDownloadData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const base  = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res   = await fetch(`${base}/profile/export`, { headers: { Authorization: `Bearer ${token}` } });
      const blob  = await res.blob();
      const url   = window.URL.createObjectURL(blob);
      const a     = document.createElement("a");
      a.href = url; a.download = "my_personal_data.json"; a.click();
    } catch { alert("Failed to export data"); }
  };

  const handleDeleteConfirmed = async () => {
    await apiFetch("/profile", { method: "DELETE" });
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading Profile...</div>;

  const field = (label: string, key: keyof typeof form, readVal: string) => (
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      {editing ? (
        <input
          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
        />
      ) : (
        <div className="text-sm font-semibold text-slate-800">{readVal || "—"}</div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30 text-white flex items-center justify-center font-bold text-2xl uppercase">
          {profile?.fullName?.charAt(0) || "U"}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">{profile?.fullName}</h1>
          <p className="text-sm text-slate-500 font-medium">{profile?.role?.replace(/_/g, " ")} @ {profile?.institution}</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Info */}
        <section className="col-span-1 lg:col-span-2 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 text-slate-600 p-2 rounded-xl"><User className="w-5 h-5" /></div>
              <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                <Pencil className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl disabled:opacity-50 transition-colors">
                  <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm font-bold text-slate-500 border border-slate-200 hover:text-slate-900 px-3 py-1.5 rounded-xl transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
              <div className="text-sm font-semibold text-slate-800">{profile?.email}</div>
            </div>
            {field("Full Name",   "fullName",    profile?.fullName)}
            {field("Institution", "institution", profile?.institution)}
            {field("City",        "city",        profile?.city)}
            {field("Country",     "country",     profile?.country)}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</div>
              <div className="text-sm font-semibold text-slate-800">{new Date(profile?.createdAt || "").toLocaleDateString()}</div>
            </div>
          </div>
        </section>

        {/* GDPR */}
        <section className="col-span-1 border-2 border-slate-900 bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-xl font-extrabold text-white mb-2">GDPR Center</h2>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed">
              You have full control over your personal data. Export your information or permanently delete your account at any time.
            </p>
            <div className="space-y-4 mt-auto">
              <button onClick={handleDownloadData}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all group">
                Extract JSON Data
                <Download className="w-4 h-4 opacity-70 group-hover:translate-y-0.5 transition-transform" />
              </button>
              <button onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 font-bold text-sm transition-all group">
                Delete Account
                <Trash2 className="w-4 h-4 opacity-70 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {showDeleteModal && (
        <DeleteModal
          email={profile?.email}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirmed}
        />
      )}
    </div>
  );
};
