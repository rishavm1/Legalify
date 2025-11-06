"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";

export default function SignUp() {
  const [method, setMethod] = useState<"google" | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"method" | "form" | "verify">("method");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    // Clean up any browser extension attributes that might cause hydration issues
    const cleanupExtensionAttributes = () => {
      const elements = document.querySelectorAll('[fdprocessedid]');
      elements.forEach(el => el.removeAttribute('fdprocessedid'));
    };
    cleanupExtensionAttributes();
  }, []);

  useEffect(() => {
    if (otpExpiresAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
        setTimeRemaining(remaining);
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpExpiresAt]);

  const getPasswordStrength = () => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const passwordStrength = getPasswordStrength();
  const isPasswordValid = passwordStrength.score >= 4;

  const handleEmailSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Send OTP for verification
        const otpRes = await fetch("/api/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        
        if (otpRes.ok) {
          setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
          setStep("verify");
        } else {
          setError("Failed to send verification email");
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Signup failed");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    
    const result = await signIn("email-otp", {
      email,
      otp,
      redirect: false,
    });
    
    if (result?.error) {
      setError("Invalid OTP");
      setLoading(false);
    } else if (result?.ok) {
      window.location.href = "/auth/username";
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Join Legalify</h1>
          <p className="text-neutral-400">Create your account to get started</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-6">
          {step === "method" && (
            <>
              <Button
                onClick={() => signIn("google", { callbackUrl: "/auth/username" })}
                className="w-full bg-white text-black hover:bg-neutral-200 h-12 flex items-center gap-3"
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
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-neutral-900 text-neutral-400">Or</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setMethod("email");
                  setStep("form");
                }}
                variant="outline"
                className="w-full bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 h-12"
              >
                Continue with Email
              </Button>

              <div className="text-center">
                <p className="text-neutral-400 text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-white hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === "form" && method === "email" && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white pr-12"
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                    suppressHydrationWarning
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.checks.length ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
                      <span className={passwordStrength.checks.length ? "text-green-500" : "text-neutral-400"}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.checks.uppercase ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
                      <span className={passwordStrength.checks.uppercase ? "text-green-500" : "text-neutral-400"}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.checks.lowercase ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
                      <span className={passwordStrength.checks.lowercase ? "text-green-500" : "text-neutral-400"}>One lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.checks.number ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
                      <span className={passwordStrength.checks.number ? "text-green-500" : "text-neutral-400"}>One number</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.checks.special ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
                      <span className={passwordStrength.checks.special ? "text-green-500" : "text-neutral-400"}>One special character</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white pr-12"
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                    suppressHydrationWarning
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button
                onClick={handleEmailSignup}
                disabled={loading || !email || !password || !confirmPassword || !isPasswordValid}
                className="w-full bg-white text-black hover:bg-neutral-200 h-12"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email"}
              </Button>

              <Button
                onClick={() => {
                  setStep("method");
                  setMethod(null);
                  setError("");
                }}
                variant="outline"
                className="w-full bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800"
              >
                Back
              </Button>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
                <p className="text-neutral-400 text-sm mb-2">
                  We've sent a verification code to {email}
                </p>
                {timeRemaining > 0 ? (
                  <div className="inline-flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-lg mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-500 text-sm font-medium">
                      Expires in {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <p className="text-red-500 text-sm mb-4">Code expired. Please request a new one.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-white"
                  suppressHydrationWarning
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-white text-black hover:bg-neutral-200 h-12"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      const otpRes = await fetch("/api/otp/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      if (otpRes.ok) {
                        setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
                        setOtp("");
                        setError("");
                      } else {
                        setError("Failed to resend OTP");
                      }
                    } catch (err) {
                      setError("Failed to resend OTP");
                    }
                    setLoading(false);
                  }}
                  variant="outline"
                  disabled={loading}
                  className="flex-1 bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                >
                  Resend OTP
                </Button>
                <Button
                  onClick={() => {
                    setStep("form");
                    setError("");
                    setOtp("");
                  }}
                  variant="outline"
                  className="flex-1 bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}