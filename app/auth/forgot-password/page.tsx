"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP sent to your email. Check your inbox!");
        setTimeout(() => {
          window.location.href = `/auth/reset-password?email=${encodeURIComponent(email)}`;
        }, 2000);
      } else {
        setError(data.error || "Failed to send OTP");
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
            <Mail className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent mb-3">
            Forgot Password?
          </h1>
          <p className="text-neutral-400 text-lg">
            Enter your email to receive an OTP
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
            />
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
            onClick={handleSendOTP}
            disabled={loading || !email}
            className="premium-button w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black h-12 font-bold shadow-lg hover:shadow-amber-400/25"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
          </Button>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-neutral-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}