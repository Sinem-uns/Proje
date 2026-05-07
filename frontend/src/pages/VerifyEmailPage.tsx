import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }
    apiFetch("/auth/verify", { method: "POST", body: JSON.stringify({ token }) })
      .then(() => { setStatus("success"); setMessage("Your email has been verified. You can now log in."); })
      .catch((err) => { setStatus("error"); setMessage(err.message || "Verification failed. The link may have expired."); });
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl border border-white p-10 shadow-xl text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-500 mb-8">{message}</p>
            <Link to="/login" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Go to Login →
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-500 mb-8">{message}</p>
            <Link to="/login" className="text-blue-600 font-bold hover:underline text-sm">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
};
