import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Film, Sparkles, Clock, Download, Video } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black overflow-hidden">
      {/* Atmospheric background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 border-b border-amber-900/20 backdrop-blur-md bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent uppercase tracking-wider">
              Recap Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-amber-100 text-sm hidden sm:inline">
                  Welcome, {user?.name || "User"}
                </span>
                <Button
                  onClick={() => setLocation("/generate")}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider"
                >
                  Create Script
                </Button>
                <Button
                  onClick={() => setLocation("/video-to-script")}
                  variant="outline"
                  className="border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video to Script
                </Button>
                <Button
                  onClick={() => setLocation("/history")}
                  variant="outline"
                  className="border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  My Scripts
                </Button>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-gray-300 via-white to-gray-400 bg-clip-text text-transparent uppercase tracking-wider leading-tight">
            Cinematic Script<br />Generation
          </h1>
          <p className="text-xl md:text-2xl text-amber-200/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform any movie into a compelling, professionally-written recap script powered by advanced AI
          </p>
          
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/generate")}
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider py-6 px-8 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Your First Script
            </Button>
          ) : (
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider py-6 px-8 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {/* Feature 1 */}
          <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8 hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20">
            <div className="mb-4">
              <Film className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-amber-100 mb-3 uppercase tracking-wider">
              AI-Powered Generation
            </h3>
            <p className="text-gray-300">
              Advanced AI analyzes movie plots and generates compelling, well-structured recap scripts in seconds.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8 hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20">
            <div className="mb-4">
              <Clock className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-amber-100 mb-3 uppercase tracking-wider">
              Flexible Tones & Lengths
            </h3>
            <p className="text-gray-300">
              Choose from Dramatic, Comedic, Suspenseful, Educational, or Casual tones. Select your preferred length from Short to Long.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8 hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20">
            <div className="mb-4">
              <Download className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-amber-100 mb-3 uppercase tracking-wider">
              Easy Export & Editing
            </h3>
            <p className="text-gray-300">
              Edit scripts directly, copy to clipboard, or download as .txt files. Full control over your content.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-300 via-white to-gray-400 bg-clip-text text-transparent uppercase tracking-wider">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Enter Movie Details", desc: "Provide the movie title, year, genre, and plot summary" },
              { num: "2", title: "Select Style", desc: "Choose your desired tone and script length" },
              { num: "3", title: "Generate", desc: "AI creates a professional recap script instantly" },
              { num: "4", title: "Export", desc: "Edit, copy, or download your script" },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-2xl mb-4">
                  {step.num}
                </div>
                <h3 className="text-amber-100 font-bold mb-2 uppercase tracking-wider">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Card className="bg-gradient-to-r from-amber-900/20 to-amber-900/10 border-amber-600/30 backdrop-blur-sm p-12">
            <h2 className="text-3xl font-bold text-amber-100 mb-4 uppercase tracking-wider">
              Ready to Create?
            </h2>
            <p className="text-amber-200/80 mb-8 text-lg">
              Start generating professional movie recap scripts today
            </p>
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/generate")}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider py-6 px-8 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Script Now
              </Button>
            ) : (
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider py-6 px-8 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Sign In to Start
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-900/20 backdrop-blur-md bg-black/30 mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 Movie Recap Script Writer Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
