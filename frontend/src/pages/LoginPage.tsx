import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Mail, Lock, ArrowRight } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>

      <div className="w-full max-w-md animate-fade-in-up z-10">
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-healthcare-500 shadow-lg shadow-brand-600/30 text-white font-display font-bold text-3xl mb-6">
                    H
                </div>
                <h1 className="text-3xl font-display font-extrabold tracking-tight text-slate-900 mb-2">Welcome Back</h1>
                <p className="text-sm text-slate-500 font-medium">Enter your credentials to access your academic dashboard</p>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl bg-red-50/80 border border-red-100 p-4 text-sm text-red-600 flex items-center gap-3 shadow-sm animate-fade-in-up">
                    <svg className="h-5 w-5 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Institutional Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                        id="email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                </div>
                
                <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                     Password
                    </label>
                    <a href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        type="password"
                        className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                </div>
                
                <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-2xl bg-gradient-to-r from-brand-600 to-healthcare-500 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
                >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                    </>
                ) : (
                    <>
                        Sign in to Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600 font-medium">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 transition-all">
                    Sign up now
                </Link>
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
