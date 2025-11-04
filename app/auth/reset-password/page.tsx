"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Shield, Check, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [otpExpiresAt] = useState<number>(Date.now() + 10 * 60 * 1000);
  const [timeRemaining, setTimeRemaining] = useState<number>(600);

  useEffect(() => {
    setMounted(true);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const getPasswordStrength = () => {
    const checks = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const passwordStrength = getPasswordStrength();
  const isPasswordValid = passwordStrength.score >= 4;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-neutral-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-10 fade-in">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-6 shadow-2xl shadow-amber-400/20">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent mb-3">
              Reset Password
            </h1>
            <p className="text-neutral-400 text-lg">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => {
          window.location.href = "/auth/signin";
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-10 fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-6 shadow-2xl shadow-amber-400/20">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent mb-3">
            Reset Password
          </h1>
          <p className="text-neutral-400 text-lg">
            Enter the OTP and your new password
          </p>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
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
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 font-medium text-center text-2xl tracking-widest"
              suppressHydrationWarning
            />
            {timeRemaining > 0 ? (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-500 text-sm font-medium">
                  Expires in {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ) : (
              <p className="text-red-500 text-sm text-center mt-3">Code expired. Please request a new one.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 pr-12 transition-all duration-300 font-medium"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {newPassword && (
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
            <label className="block text-sm font-semibold text-neutral-300 mb-3">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 pr-12 transition-all duration-300 font-medium"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </p>
          )}

          {message && (
            <p className="text-green-400 text-sm font-medium bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              {message}
            </p>
          )}

          <Button
            onClick={handleResetPassword}
            disabled={loading || !otp || !newPassword || !confirmPassword || !isPasswordValid || timeRemaining === 0}
            className="premium-button w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black h-12 font-bold shadow-lg hover:shadow-amber-400/25"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-neutral-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-10 fade-in">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-6 shadow-2xl shadow-amber-400/20">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent mb-3">
              Reset Password
            </h1>
            <p className="text-neutral-400 text-lg">
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}