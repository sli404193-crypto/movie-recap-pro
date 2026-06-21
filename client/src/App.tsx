import React, { useState } from "react";
import { GoogleGenAI } from "@google/generative-ai";

export default function App() {
  // Navigation State: 'recap' or 'video-to-script'
  const [activeTab, setActiveTab] = useState<"recap" | "video-to-script">("recap");

  // API Key State (User can input or fetch from environment)
  const [apiKey, setApiKey] = useState<string>(
    import.meta.env.VITE_GEMINI_API_KEY || ""
  );

  // Movie Recap States
  const [movieSummary, setMovieSummary] = useState<string>("");
  const [recapScript, setRecapScript] = useState<string>("");
  const [loadingRecap, setLoadingRecap] = useState<boolean>(false);
  const [errorRecap, setErrorRecap] = useState<string>("");

  // Video to Script States
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [videoScript, setVideoScript] = useState<string>("");
  const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
  const [errorVideo, setErrorVideo] = useState<string>("");

  // Helper function to handle script generation using Gemini
  const generateScript = async (promptText: string, type: "recap" | "video") => {
    if (!apiKey) {
      const errorMsg = "Please provide a valid Gemini API Key first.";
      if (type === "recap") setErrorRecap(errorMsg);
      else setErrorVideo(errorMsg);
      return;
    }

    try {
      if (type === "recap") {
        setLoadingRecap(true);
        setErrorRecap("");
        setRecapScript("");
      } else {
        setLoadingVideo(true);
        setErrorVideo("");
        setVideoScript("");
      }

      const ai = new GoogleGenAI({ apiKey });
      // Using stable gemini-2.5-flash for high-speed content generation
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      if (type === "recap") {
        setRecapScript(text);
      } else {
        setVideoScript(text);
      }
    } catch (err: any) {
      const errMsg = err?.message || "An error occurred while generating content.";
      if (type === "recap") setErrorRecap(errMsg);
      else setErrorVideo(errMsg);
    } finally {
      if (type === "recap") setLoadingRecap(false);
      else setLoadingVideo(false);
    }
  };

  // Submit Handler for Movie Recap
  const handleRecapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieSummary.trim()) return;

    const prompt = `You are an expert video content creator and storyteller. Based on the following movie summary, generate an engaging, well-structured movie recap script optimized for short-form video (like TikTok/Reels) or long-form video recaps. Write it in an exciting, descriptive tone with scene markers: \n\n${movieSummary}`;
    generateScript(prompt, "recap");
  };

  // Submit Handler for Video to Script
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim() && !videoUrl.trim()) {
      setErrorVideo("Please provide either a video URL or paste a transcript/subtitle.");
      return;
    }

    const prompt = `You are a professional video editor and scriptwriter specializing in localizing and optimizing content. Take the following video context/transcript and rewrite it into a highly engaging, retention-optimized narration script suitable for social media video. Format it with clean pacing and speaker/hook guidelines:\n\nURL provided: ${videoUrl}\n\nTranscript:\n${transcript}`;
    generateScript(prompt, "video");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Header & Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold tracking-wider text-xl">
              AI
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              ScriptGen Workspace
            </h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab("recap")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === "recap"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🎬 Movie Recap Script
            </button>
            <button
              onClick={() => setActiveTab("video-to-script")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === "video-to-script"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📹 Video to Script
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Global API Key Settings Panel */}
        <div className="mb-8 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 shadow-md">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            🔑 Gemini API Key Configuration
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
            {import.meta.env.VITE_GEMINI_API_KEY && (
              <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-3 rounded-lg border border-emerald-500/20">
                Loaded via Env
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Your key remains local in your browser session. For local testing purposes.
          </p>
        </div>

        {/* Dynamic Tab Panels */}
        {activeTab === "recap" ? (
          /* ================= PANEL 1: MOVIE RECAP ================= */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col justify-between">
              <form onSubmit={handleRecapSubmit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Movie Summary Input</h2>
                  <p className="text-sm text-slate-400 mb-3">
                    Paste the movie plot details, summary, or timestamps below to cook a perfect recap script.
                  </p>
                  <textarea
                    rows={12}
                    value={movieSummary}
                    onChange={(e) => setMovieSummary(e.target.value)}
                    placeholder="Example: Main character wakes up in a loop. He realizes that every time he dies, the day resets at 7:00 AM..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-y min-h-[250px]"
                  />
                </div>

                {errorRecap && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                    ⚠️ {errorRecap}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingRecap || !movieSummary.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  {loadingRecap ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Script...
                    </>
                  ) : (
                    "🪄 Generate Movie Recap Script"
                  )}
                </button>
              </form>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-xs text-slate-400">
                <span>Characters: {movieSummary.length}</span>
                <span>Words: {movieSummary.trim() ? movieSummary.trim().split(/\s+/).length : 0}</span>
              </div>
            </div>

            {/* Output Display */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Generated Script</h2>
                {recapScript && (
                  <button
                    onClick={() => navigator.clipboard.writeText(recapScript)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 transition flex items-center gap-1"
                  >
                    📋 Copy Full Script
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 min-h-[350px] overflow-y-auto max-h-[550px]">
                {recapScript ? (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                    {recapScript}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm py-20 text-center">
                    <p className="mb-1">✨ Content will appear here.</p>
                    <p className="text-xs text-slate-600">Provide an API key and click generate to begin processing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================= PANEL 2: VIDEO TO SCRIPT ================= */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col justify-between">
              <form onSubmit={handleVideoSubmit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Video Details & Subtitles</h2>
                  <p className="text-sm text-slate-400 mb-4">
                    Provide a YouTube/TikTok URL reference or directly paste the messy text transcript below.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Video URL Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or TikTok link"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Transcript / Subtitle Box (Fallback/Direct Input)
                      </label>
                      <textarea
                        rows={8}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Paste auto-generated captions, subtitles, or raw text transcripts here..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-y min-h-[160px]"
                      />
                    </div>
                  </div>
                </div>

                {errorVideo && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                    ⚠️ {errorVideo}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingVideo || (!transcript.trim() && !videoUrl.trim())}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {loadingVideo ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Re-writing Content...
                    </>
                  ) : (
                    "🚀 Re-write Video Into Viral Script"
                  )}
                </button>
              </form>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-xs text-slate-400">
                <span>Transcript length: {transcript.length} chars</span>
              </div>
            </div>

            {/* Output Display */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Polished Content Script</h2>
                {videoScript && (
                  <button
                    onClick={() => navigator.clipboard.writeText(videoScript)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 transition flex items-center gap-1"
                  >
                    📋 Copy Full Script
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 min-h-[350px] overflow-y-auto max-h-[550px]">
                {videoScript ? (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                    {videoScript}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm py-20 text-center">
                    <p className="mb-1">✨ Polished outputs will arrive here.</p>
                    <p className="text-xs text-slate-600">Provide data and press the action button to process through Gemini AI.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
