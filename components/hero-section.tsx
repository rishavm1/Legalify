"use client";

import { SparklesCore } from "./ui/sparkles";
import { LiquidButton } from "./ui/liquid-glass-button";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={1}
        />
      </div>
      
      <div className="relative z-20 flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <h1 className="md:text-7xl text-5xl lg:text-9xl font-bold text-center text-white">
            Legalify
          </h1>
          <p className="text-neutral-300 text-lg md:text-xl">
            AI-Powered Legal Document Drafter
          </p>
        </div>
        
        <LiquidButton onClick={() => router.push("/auth/signin")}>
          Get Started
        </LiquidButton>
      </div>
    </div>
  );
}
