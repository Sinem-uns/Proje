import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Search, MapPin, Briefcase, Filter, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

type Post = {
  id: string;
  title: string;
  workingDomain: string;
  requiredExpertise: string;
  projectStage: string;
  city: string;
  country: string;
  status: string;
  shortExplanation: string;
  matchExplanation?: string;
  createdAt: string;
  user: {
      fullName: string;
      role: string;
      institution: string;
  }
};

type UserProfile = {
  city: string;
  country: string;
};

export const SearchResultsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Filters
  const [domain, setDomain] = useState("");
  const [expertise, setExpertise] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState(""); // Default to Any Status so closed posts appear

  const fetchCurrentUser = async () => {
    try {
      if (localStorage.getItem("accessToken")) {
        const userDate = await apiFetch<UserProfile>("/auth/me");
        setCurrentUser(userDate);
      }
    } catch (err) {
      console.warn("Logged out or token expired");
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (domain) params.append("domain", domain);
      if (expertise) params.append("required_expertise", expertise);
      if (city) params.append("city", city);
      if (country) params.append("country", country);
      if (stage) params.append("project_stage", stage);
      if (status) params.append("status", status);

      const data = await apiFetch<Post[]>(`/posts?${params.toString()}`);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial fetch

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[300px,1fr] items-start animate-fade-in-up py-4 relative">
      <div className="absolute top-40 right-40 w-96 h-96 bg-healthcare-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0 pointer-events-none"></div>
      
      {/* Sidebar Filters */}
      <aside className="sticky top-24 glass rounded-3xl p-6 shadow-xl shadow-brand-900/5 z-10 border-white/60">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-sm text-white">
            <Filter opacity={0.9} className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
            Discover Partners
          </h2>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Domain
            </label>
            <input 
              value={domain} onChange={e => setDomain(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium" 
              placeholder="e.g. Oncology"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Required Expertise
            </label>
            <input 
              value={expertise} onChange={e => setExpertise(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
              placeholder="e.g. Data Scientist"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                City
              </label>
              <input 
                value={city} onChange={e => setCity(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium" 
                placeholder="Any"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Country
              </label>
              <input 
                value={country} onChange={e => setCountry(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium" 
                placeholder="Any"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Project Stage
            </label>
            <select 
              value={stage} onChange={e => setStage(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
            >
              <option value="">Any Stage</option>
              <option value="IDEA">Idea</option>
              <option value="CONCEPT_VALIDATION">Concept Validation</option>
              <option value="PROTOTYPE_DEVELOPED">Prototype Developed</option>
              <option value="PILOT_TESTING">Pilot Testing</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Status
            </label>
            <select 
              value={status} onChange={e => setStatus(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium"
            >
              <option value="">Any Status</option>
              <option value="ACTIVE">Active</option>
              <option value="MEETING_SCHEDULED">Meeting scheduled</option>
              <option value="PARTNER_FOUND">Partner found</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading} className="mt-8 w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0 transition-all flex justify-center items-center gap-2">
            {loading ? "Searching..." : (
               <>Search <Search className="w-5 h-5 opacity-70" /></>
            )}
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <section className="min-w-0 pb-12 z-10">
        <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-900">
              Co-Creation Posts
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Found {posts.length} {posts.length === 1 ? 'result' : 'results'} matching your criteria.
            </p>
          </div>
        </div>

        <div className="grid gap-6 text-left">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <svg className="animate-spin h-10 w-10 text-brand-500 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-medium text-slate-500">Searching for academic partners...</p>
             </div>
          ) : posts.length === 0 ? (
             <div className="text-center py-20 rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
               <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
               <h3 className="text-xl font-display font-bold text-slate-700">No posts found</h3>
               <p className="text-slate-500 text-sm mt-2 font-medium">Try adjusting your filters to see more results.</p>
             </div>
          ) : (
            posts.map(post => {
              const isLocalMatch = currentUser && post.city === currentUser.city;

              const isClosed = post.status === "PARTNER_FOUND" || post.status === "EXPIRED";

              return (
              <div key={post.id} className={`group relative rounded-3xl border border-white/80 bg-white/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-400 overflow-hidden ${isClosed ? 'opacity-60 grayscale-[0.8] hover:grayscale-[0.5]' : 'shadow-brand-900/5 hover:shadow-brand-500/10'}`}>
                
                {post.matchExplanation && (
                    <div className="absolute top-0 right-0 py-1.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold tracking-widest uppercase rounded-bl-2xl shadow-sm flex items-center gap-1.5">
                       <Zap className="w-3 h-3 fill-current" />
                       Matches: {post.matchExplanation}
                    </div>
                )}

                {/* City Match Badge */}
                {isLocalMatch && !post.matchExplanation && (
                     <div className="absolute top-0 right-0 py-1.5 px-5 bg-gradient-to-r from-healthcare-500 to-emerald-500 text-white text-[10px] font-bold tracking-widest uppercase rounded-bl-2xl shadow-sm flex items-center gap-1.5">
                       <MapPin className="w-3 h-3" />
                       Local City Match
                     </div>
                )}

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 pt-2">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="inline-flex items-center rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold tracking-wide text-brand-700 shadow-sm border border-brand-100">
                            {post.workingDomain}
                          </span>
                          <span className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold tracking-wide text-indigo-700 shadow-sm border border-indigo-100">
                            {post.projectStage.replace(/_/g, " ")}
                          </span>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          <Link to={`/posts/${post.id}`} className="focus:outline-none">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
                          {post.shortExplanation}
                        </p>
                        
                        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/50 w-fit px-3 py-1.5 rounded-lg border border-slate-200">
                           <span className="text-slate-800">{post.user.fullName}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                           <span>{post.user.institution}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                           <span className="text-brand-600">{post.user.role.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-5 border-t border-slate-100 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className={`font-medium ${isLocalMatch ? 'text-healthcare-600 font-bold' : ''}`}>
                          {post.city}, {post.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">Need: <span className="text-slate-900 font-bold">{post.requiredExpertise}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:w-52 shrink-0 flex flex-col justify-between items-start sm:items-end sm:border-l border-slate-200 sm:pl-8">
                    <div className={`flex items-center gap-2 mb-6 sm:mb-0 px-3 py-1.5 rounded-lg border ${isClosed ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                      {!isClosed && (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                      )}
                      <span className="text-xs font-bold tracking-widest uppercase">{isClosed ? "CLOSED" : post.status.replace(/_/g, " ")}</span>
                    </div>
                    
                    <div className="text-left sm:text-right w-full mt-auto">
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-3">Posted {new Date(post.createdAt).toLocaleDateString()}</div>
                      <Link 
                        to={`/posts/${post.id}`} 
                        className="relative w-full inline-flex items-center justify-center rounded-2xl bg-brand-50 px-4 py-3.5 text-sm font-bold text-brand-700 border border-brand-200 hover:bg-brand-600 hover:text-white hover:border-brand-600 hover:shadow-lg hover:shadow-brand-500/20 transition-all z-10 group/btn"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                  
                </div>
              </div>
            )})
          )}
        </div>
      </section>
    </div>
  );
};
