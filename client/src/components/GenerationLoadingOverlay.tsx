import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";

const GENERATION_STAGES = [
  "Analyzing movie plot...",
  "Crafting narrative structure...",
  "Generating opening sequence...",
  "Building dramatic tension...",
  "Weaving story threads...",
  "Finalizing script...",
];

export function GenerationLoadingOverlay() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % GENERATION_STAGES.length);
    }, 2000);

    return () => clearInterval(stageInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Atmospheric background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-4">
        {/* Spinner */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24">
            <Spinner className="w-24 h-24 text-amber-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-bold text-amber-400">{Math.round(progress)}%</div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-300 via-white to-gray-400 bg-clip-text text-transparent uppercase tracking-wider">
          Generating Script
        </h2>

        {/* Progress Bar */}
        <div className="mb-8 bg-slate-800/50 rounded-full h-2 overflow-hidden border border-amber-900/30">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Stage Text with animation */}
        <div className="h-12 flex items-center justify-center">
          <p className="text-amber-200/80 text-lg animate-fade-in-out">
            {GENERATION_STAGES[currentStage]}
          </p>
        </div>

        {/* Tips */}
        <p className="text-gray-400 text-sm mt-8">
          This typically takes 10-30 seconds depending on script length
        </p>
      </div>

      {/* CSS for fade animation */}
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
