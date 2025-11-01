import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Legalify - AI Legal Document Drafter",
  description: "Generate professional legal documents with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="fade-in">
          <SessionProvider>{children}</SessionProvider>
        </div>
      </body>
    </html>
  );
}
