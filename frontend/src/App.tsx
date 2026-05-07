import { Route, Routes, Link } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { EditPostPage } from "./pages/EditPostPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { MeetingRequestPage } from "./pages/MeetingRequestPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotificationsPopover } from "./components/NotificationsPopover";

const getTokenPayload = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
};

const App = () => {
  const payload = getTokenPayload();
  const isLoggedIn = !!payload;
  const isAdmin = payload?.role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50 relative selection:bg-brand-500/30">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-healthcare-500 shadow-md flex items-center justify-center text-white font-bold text-xl group-hover:shadow-brand-500/40 group-hover:scale-105 transition-all">
              H
            </div>
            <span className="font-display font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              HEALTH AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/search" className="text-slate-600 hover:text-brand-600 transition-colors">
              Explore Posts
            </Link>
            {isLoggedIn && (
              <Link to="/dashboard" className="text-slate-600 hover:text-brand-600 transition-colors">
                Dashboard
              </Link>
            )}
            {isLoggedIn && (
              <Link to="/profile" className="text-slate-600 hover:text-brand-600 transition-colors">
                Profile
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="font-bold text-red-600 hover:text-red-800 transition-colors">
                Admin Panel
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <NotificationsPopover />
                <button
                  onClick={() => { localStorage.removeItem("accessToken"); window.location.href = "/login"; }}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-600 to-healthcare-500 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up flex flex-col relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/posts/new" element={<CreatePostPage />} />
            <Route path="/posts/:id/edit" element={<EditPostPage />} />
            <Route path="/posts/:id/meetings/new" element={<MeetingRequestPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
          </Route>
        </Routes>
      </main>

      <footer className="mt-auto border-t border-slate-200/60 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-90">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">H</div>
            <span className="font-display font-semibold tracking-wide text-slate-700">HEALTH AI PLATFORM</span>
          </div>
          <p className="text-sm text-slate-500 text-center md:text-left max-w-md">
            Connecting Engineers and Healthcare Professionals securely.
            <br className="hidden md:block" />
            We strictly enforce .edu registration and GDPR-compliant data minimalism.
          </p>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            © {new Date().getFullYear()} Demo Project
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
