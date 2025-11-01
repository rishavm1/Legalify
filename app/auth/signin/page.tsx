"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Clean up any browser extension attributes that might cause hydration issues
    const cleanupExtensionAttributes = () => {
      const elements = document.querySelectorAll('[fdprocessedid]');
      elements.forEach(el => el.removeAttribute('fdprocessedid'));
    };
    cleanupExtensionAttributes();
  }, []);

  const handleEmailLogin = async () => {
    setLoading(true);
    setError("");
    
    const result = await signIn("email-password", {
      email,
      password,
      redirect: false,
    });
    
    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else if (result?.ok) {
      window.location.href = "/";
    } else {
      setError("Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-10 fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-6 shadow-2xl shadow-amber-400/20">
            <span className="text-2xl">⚖️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent mb-3">Welcome Back</h1>
          <p className="text-neutral-400 text-lg">Sign in to your Legalify account</p>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="premium-button w-full bg-gradient-to-r from-white to-neutral-100 text-black hover:from-neutral-100 hover:to-neutral-200 h-12 flex items-center gap-3 shadow-lg font-semibold"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/50 backdrop-blur-sm text-neutral-400 font-medium rounded-lg">Or</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 font-medium"
              suppressHydrationWarning
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 pr-12 transition-all duration-300 font-medium"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors premium-button"
                suppressHydrationWarning
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

          <Button
            onClick={handleEmailLogin}
            disabled={loading || !email || !password}
            className="premium-button w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black h-12 font-bold shadow-lg hover:shadow-amber-400/25"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </Button>

          <div className="text-center space-y-3">
            <Link
              href="/auth/forgot-password"
              className="block text-amber-400 hover:text-amber-300 transition-colors font-medium text-sm"
            >
              Forgot your password?
            </Link>
            <p className="text-neutral-400 text-sm font-medium">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}