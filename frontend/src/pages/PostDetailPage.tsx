import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

export const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await apiFetch(`/posts/${id}`);
        setPost(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading post details...</div>;
  if (!post) return <div className="p-8 text-center text-red-500">Post not found.</div>;

  const isOwner = localStorage.getItem("accessToken") 
    ? post.userId === JSON.parse(atob(localStorage.getItem("accessToken")!.split('.')[1])).id
    : false;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mb-8">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">{post.workingDomain}</span>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">{post.projectStage}</span>
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">{post.commitmentLevel}</span>
          </div>

          <div className="space-y-6">
              <div>
                  <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Project Description</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{post.shortExplanation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Required Expertise</h4>
                      <p className="text-slate-800">{post.requiredExpertise}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Location & Logistics</h4>
                      <p className="text-slate-800">{post.city}, {post.country}</p>
                  </div>
              </div>

              {post.highLevelIdea && (
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 mt-6">High Level Vision</h3>
                      <p className="text-slate-600 leading-relaxed">{post.highLevelIdea}</p>
                  </div>
              )}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500 shrink-0">Posted on: {new Date(post.createdAt).toLocaleDateString()}</p>
              
              {localStorage.getItem("accessToken") && isOwner && (
                  <div className="ml-auto inline-flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 px-8 py-3 text-sm font-bold text-slate-400 cursor-not-allowed">
                      This is your own post
                  </div>
              )}
              {localStorage.getItem("accessToken") && !isOwner && post.status === "ACTIVE" && (
                  <Link
                      to={`/posts/${post.id}/meetings/new`}
                      className="ml-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                      Request a Meeting
                  </Link>
              )}
          </div>
      </div>
    </div>
  );
};
