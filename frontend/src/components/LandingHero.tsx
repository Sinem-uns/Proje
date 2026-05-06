import React from 'react';

export const LandingHero: React.FC = () => {
  return (
    <section className="min-h-screen bg-slate-950 text-white flex items-center">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Secure • GDPR-first • No patient data
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Co-create health innovation
            <span className="block text-emerald-400">
              without sharing sensitive data.
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl">
            A trust-based platform that connects engineers and healthcare professionals for structured
            first contact and meeting scheduling. No technical documents, no medical records — only
            collaboration.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 rounded-full bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400 transition">
              I&apos;m an Engineer
            </button>
            <button className="px-6 py-3 rounded-full border border-slate-600 text-slate-100 hover:bg-slate-900 transition">
              I&apos;m a Healthcare Professional
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-4">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              GDPR-compliant by design
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              .edu institutional access only
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center">
          <div className="w-full rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Live opportunities
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-300 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Matches near you
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-800/80 p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Cardiology remote monitoring pilot</p>
                  <p className="text-xs text-slate-400">Istanbul • Prototype • Engineer needed</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Local match
                </span>
              </div>
              <div className="rounded-2xl bg-slate-800/40 p-3">
                <p className="text-sm font-medium">AI-assisted radiology triage workflow</p>
                <p className="text-xs text-slate-400">Ankara • Idea • Healthcare partner</p>
              </div>
              <div className="rounded-2xl bg-slate-800/40 p-3">
                <p className="text-sm font-medium">Surgical robotics safety dashboard</p>
                <p className="text-xs text-slate-400">Izmir • Pilot • Controls engineer</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              We never store technical documents, patient data, or medical advice. The platform only
              facilitates first contact and scheduling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

