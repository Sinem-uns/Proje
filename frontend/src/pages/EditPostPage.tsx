import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Check, ClipboardEdit, ArrowRight, EyeOff, MapPin, Briefcase, ChevronDown } from "lucide-react";
import clsx from "clsx";

export const EditPostPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "",
    required_expertise: "",
    project_stage: "IDEA",
    commitment_level: "Part-time",
    collaboration_type: "Research Partner",
    confidentiality_level: "Public Pitch",
    high_level_idea: "",
    city: "",
    country: "",
    expiry_date: "",
  });
  
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE">("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await apiFetch<any>(`/posts/${id}`);
        setFormData({
          title: post.title,
          description: post.shortExplanation,
          domain: post.workingDomain,
          required_expertise: post.requiredExpertise,
          project_stage: post.projectStage,
          commitment_level: post.commitmentLevel,
          collaboration_type: post.collaborationType,
          confidentiality_level: post.confidentiality,
          high_level_idea: post.highLevelIdea || "",
          city: post.city,
          country: post.country,
          expiry_date: post.expiryDate ? new Date(post.expiryDate).toISOString().split('T')[0] : "",
        });
      } catch (e) {
        setError("Failed to load post data");
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitStatusRef = useRef<"DRAFT" | "ACTIVE">("ACTIVE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitStatus = submitStatusRef.current;
    setLoading(true);
    setError(null);

    try {
      await apiFetch(`/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          status: submitStatus,
        }),
      });
      navigate("/dashboard"); // or wherever user sees their posts
    } catch (err: any) {
      setError(err.message || "Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
          Edit Collaboration Post
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Define your project needs and find the perfect academic or medical partner. 
          Please remember: <strong className="text-red-500 bg-red-50 px-2 py-0.5 rounded">No patient data or PHI</strong> is allowed.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white p-8 sm:p-10">
        
        {error && (
            <div className="mb-8 rounded-2xl bg-red-50/80 border border-red-100 p-4 text-sm text-red-600 flex items-center gap-3 shadow-sm">
                <div className="bg-red-100 rounded-full p-1"><Check className="w-4 h-4 text-red-600"/></div>
                {error}
            </div>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ClipboardEdit className="w-5 h-5 text-blue-500" />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Project Title</label>
              <input 
                name="title" value={formData.title} onChange={handleChange} required
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium" 
                placeholder="e.g., AI-Driven ECG Analysis Tool" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Short Explanation</label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} required
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none h-28" 
                placeholder="Briefly describe what the project is about..." 
              />
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Expertise & Domain
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Working Domain</label>
                <input 
                  name="domain" value={formData.domain} onChange={handleChange} required
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                  placeholder="e.g., Cardiology, Machine Learning" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Expertise</label>
                <input 
                  name="required_expertise" value={formData.required_expertise} onChange={handleChange} required
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                  placeholder="e.g., Data Scientist, Clinical Researcher" 
                />
              </div>
              
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Project Stage</label>
                <ChevronDown className="absolute right-4 top-10 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  name="project_stage" value={formData.project_stage} onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                >
                  <option value="IDEA">Idea</option>
                  <option value="CONCEPT_VALIDATION">Concept Validation</option>
                  <option value="PROTOTYPE_DEVELOPED">Prototype Developed</option>
                  <option value="PILOT_TESTING">Pilot Testing</option>
                  <option value="PRE_DEPLOYMENT">Pre-Deployment</option>
                </select>
              </div>
              
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Collaboration Type</label>
                <ChevronDown className="absolute right-4 top-10 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  name="collaboration_type" value={formData.collaboration_type} onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                >
                  <option value="Advisor">Advisor</option>
                  <option value="Research Partner">Research Partner</option>
                  <option value="Co-founder">Co-founder</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <EyeOff className="w-5 h-5 text-blue-500" />
              Commitment & Privacy
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Commitment Level</label>
                <ChevronDown className="absolute right-4 top-10 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  name="commitment_level" value={formData.commitment_level} onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                >
                  <option value="Part-time">Part-time (few hrs/week)</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Ad-hoc">Ad-hoc consultation</option>
                </select>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confidentiality</label>
                <ChevronDown className="absolute right-4 top-10 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  name="confidentiality_level" value={formData.confidentiality_level} onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                >
                  <option value="Public Pitch">Public Pitch</option>
                  <option value="Meeting Only">Meeting Only Details</option>
                  <option value="Strict NDA">Strict NDA Required</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">High Level Idea (Optional)</label>
              <textarea 
                name="high_level_idea" value={formData.high_level_idea} onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none h-20" 
                placeholder="Any additional high-level thoughts you want to share..." 
              />
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Location & Logistics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">City</label>
                <input 
                  name="city" value={formData.city} onChange={handleChange} required
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                  placeholder="San Francisco" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                <input 
                  name="country" value={formData.country} onChange={handleChange} required
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                  placeholder="USA" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                <input 
                  name="expiry_date" type="date" value={formData.expiry_date} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center justify-end border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              onClick={() => { submitStatusRef.current = "DRAFT"; }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-all disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={() => { submitStatusRef.current = "ACTIVE"; }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? "Processing..." : (
                  <>
                    Update Post 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
