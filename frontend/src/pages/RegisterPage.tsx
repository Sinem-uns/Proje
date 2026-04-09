import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Building2, MapPin, Mail, Lock, User, Hash, ShieldCheck } from "lucide-react";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ENGINEER");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the terms to register.");
      return;
    }
    if (!email.endsWith(".edu") && !email.endsWith(".edu.tr")) {
      setError("Registration requires an institutional .edu or .edu.tr email address.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<any>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          role,
          password,
          institution,
          city,
          country,
        }),
      });

      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob hover:scale-105 transition-transform duration-[4000ms]"></div>
      
      <div className="w-full max-w-2xl animate-fade-in-up z-10">
        <div className="glass rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Join HEALTH AI
            </h1>
            <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-1.5 flex-wrap">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Only <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-brand-600">.edu</span> emails are permitted to ensure academic integrity.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 rounded-xl bg-red-50/80 border border-red-100 p-4 text-sm text-red-600 flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                    placeholder="Alice"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Last name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Institutional email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Role
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select 
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-8 py-3 text-sm text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none appearance-none font-medium"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="ENGINEER">Engineer</option>
                    <option value="HEALTHCARE_PROFESSIONAL">Healthcare Professional</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Institution
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                    placeholder="MIT, Stanford, etc."
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    required
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                    placeholder="USA"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  type="password"
                  minLength={8}
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <label className="flex items-start gap-4 p-4 mt-2 rounded-2xl bg-white/60 hover:bg-white/80 border border-slate-200 hover:border-brand-200 transition-colors cursor-pointer group shadow-sm">
              <div className="relative flex items-center mt-1">
                <input 
                  type="checkbox" 
                  className="peer h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              </div>
              <span className="text-sm text-slate-700 leading-relaxed font-medium">
                I understand that this platform is for academic collaboration only
                and that <strong className="text-slate-900 border-b border-brand-300">no patient data or medical documents</strong> may be stored.
              </span>
            </label>
            
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand-600 to-healthcare-500 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : "Sign up for HEALTH AI"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
