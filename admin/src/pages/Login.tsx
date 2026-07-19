import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.error || err.response?.data?.message || "Invalid email or password"
      });
      setError(err.response?.data?.error || err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" style={{
      backgroundImage:"url('/images/login-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {/* Brand logo/name above the card */}

      <div className="w-full max-w-sm bg-white rounded-soft shadow-soft border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-6">
          {/* <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-sm mb-3">
            <Lock className="text-white" size={20} />
          </div> */}
      <div className="flex items-center gap-2 mb-6">
        <img src="/images/zb_header.png" height={35} className="h-10" alt="Zoberry Logo" />
        {/* <span className="text-xl font-bold text-slate-800 tracking-wide">Zoberry Enterprise</span> */}
      </div>
          <h2 className="text-lg font-semibold text-slate-800">Admin Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">Please enter your credentials to proceed</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2.5 rounded-lg text-xs mb-4">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) setValidationErrors({ ...validationErrors, email: undefined });
              }}
              className={`w-full px-3.5 py-2 text-sm border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/10 placeholder-slate-400 bg-slate-50/50 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
              placeholder="Enter Email"
              required
            />
            {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) setValidationErrors({ ...validationErrors, password: undefined });
                }}
                className={`w-full pl-3.5 pr-10 py-2 text-sm border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/10 placeholder-slate-400 bg-slate-50/50 ${validationErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        &copy; 2026 Zoberry Enterprise. All rights reserved.
      </div>
    </div>
  );
}

