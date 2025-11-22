"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-4 left-4 right-4 z-50 md:top-6 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:w-full md:max-w-7xl md:px-6">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3 md:px-8 md:py-4 shadow-2xl">
        <div className="flex items-center justify-between">
          {/* Logo - Far Left */}
          <Link href="/" className="text-2xl md:text-3xl font-benne text-yellow-400 hover:text-yellow-300 transition-all">
            Sexica
          </Link>

          {/* Navigation - Center (Hidden on mobile, shown on md+) */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <span className="text-white/30">|</span>
            <Link
              href="/download"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Download
            </Link>
          </nav>

          {/* CTA Button - Always visible, full width on mobile */}
          <Link href="/download">
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full px-4 md:px-6 py-2 shadow-lg"
            >
              Sexica +
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
