import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Microscope, CalendarCheck } from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center w-full">
      {/* Background Blobs for Visual Aesthetics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-healthcare-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-8 shadow-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Strictly .edu Institution Access Only</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Co-Create the Future of <br className="hidden md:block" />
          <span className="text-gradient">Medical Innovation.</span>
        </h1>
        
        <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto md:leading-relaxed mb-12">
          A secure, trust-based matchmaking infrastructure connecting brilliant engineers and healthcare professionals. 
          No patient data. Pure collaboration.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-healthcare-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            Start Collaborating
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/search"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white border-2 border-slate-200 px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
          >
            Explore Projects
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 text-left w-full mt-10">
          <div className="glass rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Microscope className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Structured Discovery</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Find partners based on required expertise, domain, and project stage (from Idea to Pilot).
            </p>
          </div>

          <div className="glass rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-healthcare-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-healthcare-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">GDPR Compliant</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              We never store medical documents or patient data. You own your profile and can export/delete anytime.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Secure Meetings</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Express interest, sign an NDA, and propose time slots directly on the platform before an external call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
