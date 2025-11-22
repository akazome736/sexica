import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Play, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      <div className="relative container mx-auto px-4 md:px-6 py-16 md:py-20 pt-24 md:pt-32 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
          {/* Main Title */}
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-extrabold text-orange-400 px-4">
              Sexica
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/70 font-light px-4">
              The New Era of Porn
            </p>
          </div>

          {/* Description */}
          <div className="max-w-2xl mx-auto px-4">
            <p className="text-base md:text-lg text-white/60 leading-relaxed">
              Download videos from any platform with ease. Fast, secure, and unlimited downloads from
              YouTube, TikTok, Instagram, Twitter, and 1800+ more sites.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 px-4">
            <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
              <CardHeader className="text-center pb-2 md:pb-4">
                <Play className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-orange-400" />
                <CardTitle className="text-white text-sm md:text-base">Any Platform</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-white/70 text-xs md:text-sm">
                  Download from YouTube, TikTok, Instagram, Twitter, and more
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
              <CardHeader className="text-center pb-2 md:pb-4">
                <Zap className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-red-400" />
                <CardTitle className="text-white text-sm md:text-base">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-white/70 text-xs md:text-sm">
                  High-speed downloads with multiple quality options
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
              <CardHeader className="text-center pb-2 md:pb-4">
                <Download className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-red-500" />
                <CardTitle className="text-white text-sm md:text-base">No Limits</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-white/70 text-xs md:text-sm">
                  Unlimited downloads, no registration required
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="pt-6 md:pt-8 px-4">
            <Link href="/download">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full md:w-auto"
              >
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Start Downloading
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="pt-8 md:pt-12 text-white/40 text-xs md:text-sm px-4">
            <p>© 2025 Sexica - The New Era of Porn</p>
          </div>
        </div>
      </div>
    </div>
  );
}
