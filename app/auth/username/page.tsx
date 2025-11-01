"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Username() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (username.length >= 3) {
      const timer = setTimeout(async () => {
        setChecking(true);
        try {
          const res = await fetch(`/api/auth/check-username?username=${username}`);
          const data = await res.json();
          setAvailable(data.available);
        } catch {
          setAvailable(null);
        }
        setChecking(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAvailable(null);
    }
  }, [username]);

  const handleSubmit = async () => {
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!available) {
      setError("Username is not available");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to set username");
    }
    setLoading(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-white to-neutral-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your Username</h1>
          <p className="text-neutral-400">This is how others will see you on Legalify</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="your_username"
                maxLength={20}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white pr-12"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {checking && <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />}
                {!checking && available === true && <Check className="w-5 h-5 text-green-400" />}
                {!checking && available === false && <div className="w-5 h-5 rounded-full bg-red-400" />}
              </div>
            </div>
            {username.length > 0 && username.length < 3 && (
              <p className="text-yellow-400 text-xs mt-1">Username must be at least 3 characters</p>
            )}
            {available === true && (
              <p className="text-green-400 text-xs mt-1">✓ Username is available</p>
            )}
            {available === false && (
              <p className="text-red-400 text-xs mt-1">✗ Username is already taken</p>
            )}
          </div>

          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Username Guidelines:</h3>
            <ul className="text-neutral-400 text-sm space-y-1">
              <li>• 3-20 characters long</li>
              <li>• Only letters, numbers, and underscores</li>
              <li>• Must be unique</li>
              <li>• Cannot be changed later</li>
            </ul>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading || !username || username.length < 3 || available !== true}
            className="w-full bg-white text-black hover:bg-neutral-200 h-12"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Legalify"}
          </Button>

          <div className="text-center">
            <p className="text-neutral-500 text-xs">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}