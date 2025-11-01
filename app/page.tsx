"use client";

import { ChatInterface } from "@/components/chat-interface";
import { HeroSection } from "@/components/hero-section";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-neutral-900 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400/20 border-t-amber-400 mx-auto mb-6 shadow-lg shadow-amber-400/20"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500/20 border-b-blue-500 mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-white text-2xl font-semibold mb-2">Loading Legalify...</div>
          <div className="text-neutral-400 text-base">Setting up your legal assistant</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <HeroSection />;
  }

  if (!session) return null;

  return (
    <div className="h-screen bg-black relative">
      {/* Header */}
      <div className="absolute top-0 right-0 z-50 p-6">
        <div className="glass-card flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
            <span className="text-white text-sm font-medium">{session.user?.name || session.user?.email}</span>
          </div>
          <Button 
            onClick={() => signOut()} 
            variant="ghost" 
            size="sm"
            className="premium-button text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Chat Interface */}
      <ChatInterface />
    </div>
  );
}
