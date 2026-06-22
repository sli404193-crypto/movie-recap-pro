import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState } from "react";
import { ArrowLeft, Copy, Download, Sparkles } from "lucide-react";

export default function VideoToScript() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Step 1: Video Input
  const [videoUrl, setVideoUrl] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<"English" | "Chinese" | "Myanmar">("English");

  // Step 2: Transcript
  const [transcript, setTranscript] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 3: Output Script
  const [targetLanguage, setTargetLanguage] = useState<"English" | "Chinese" | "Myanmar">("Myanmar");
  const [outputScript, setOutputScript] = useState("");

  // Mutations
  const extractMutation = trpc.videoTranscripts.extractTranscript.useMutation({
    onSuccess: (data) => {
      setTranscript(data.transcript);
      setSourceLanguage(data.language as "English" | "Chinese" | "Myanmar");
      setCurrentStep(2);
      toast.success("Transcript extracted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to extract transcript");
    },
  });

  const convertMutation = trpc.videoTranscripts.convertToScript.useMutation({
    onSuccess: (data) => {
      setOutputScript(data.script);
      setCurrentStep(3);
      toast.success("Script generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to convert to script");
    },
  });

  const handleExtractTranscript = () => {
    if (!videoUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }
    extractMutation.mutate({
      videoUrl,
      sourceLanguage,
    });
  };

  const handleConvertToScript = () => {
    if (!transcript.trim()) {
      toast.error("Please provide a transcript");
      return;
    }
    convertMutation.mutate({
      rawTranscript: transcript,
      sourceLanguage,
      targetLanguage,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputScript);
    toast.success("Script copied to clipboard!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([outputScript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `recap-script-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Script downloaded!");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
        <Card className="p-8 max-w-md bg-slate-900/50 border-amber-900/30">
          <p className="text-center text-amber-100 mb-4">Please log in to use this feature</p>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="w-full border-amber-600 text-amber-100"
          >
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black py-12 px-4">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="mb-4 text-amber-200 hover:text-amber-100 hover:bg-amber-900/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-400 via-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider">
            Video to Script
          </h1>
          <p className="text-amber-200/70 mt-2">Extract dialogue from videos and generate professional recap scripts</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex gap-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-all ${
                step <= currentStep ? "bg-amber-500" : "bg-slate-700"
              }`}
            ></div>
          ))}
        </div>

        {/* Step 1: Video Input */}
        {currentStep >= 1 && (
          <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8 shadow-2xl mb-6">
            <h2 className="text-2xl font-bold text-amber-100 mb-4 uppercase tracking-wider">
              Step 1: Video Input
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-amber-100 font-semibold mb-2">Video URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or direct video link"
                  disabled={currentStep > 1}
                  className="w-full bg-slate-800/50 border border-amber-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-600 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-amber-100 font-semibold mb-2">Source Language</label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value as "English" | "Chinese" | "Myanmar")}
                  disabled={currentStep > 1}
                  className="w-full bg-slate-800/50 border border-amber-900/30 rounded-lg px-4 py-3 text-white disabled:opacity-50"
                >
                  <option>English</option>
                  <option>Chinese</option>
                  <option>Myanmar</option>
                </select>
              </div>

              {currentStep === 1 && (
                <Button
                  onClick={handleExtractTranscript}
                  disabled={extractMutation.isPending || !videoUrl.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider py-3"
                >
                  {extractMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Extracting Transcript...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Original Script
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Transcript Editing */}
        {currentStep >= 2 && (
          <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8 shadow-2xl mb-6">
            <h2 className="text-2xl font-bold text-amber-100 mb-4 uppercase tracking-wider">
              Step 2: Edit Transcript
            </h2>
            <div className="space-y-4">
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Edit the extracted transcript here..."
                className="w-full bg-slate-800/50 border border-amber-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-600 min-h-48 resize-none font-mono text-sm"
              />
              <div className="text-sm text-amber-200/70">
                Word Count: <span className="font-bold text-amber-100">{transcript.split(/\s+/).length}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Output Script */}
        {currentStep >= 3 && (
          <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8 shadow-2xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-100 uppercase tracking-wider">
                Step 3: Generated Script
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-6 min-h-64 overflow-auto max-h-96">
              <p className="text-gray-100 whitespace-pre-wrap font-serif leading-relaxed">
                {outputScript || "Script will appear here..."}
              </p>
            </div>

            <div className="mt-4 text-sm text-amber-200/70">
              Target Language: <span className="font-bold text-amber-100">{targetLanguage}</span> | Word Count:{" "}
              <span className="font-bold text-amber-100">{outputScript.split(/\s+/).length}</span>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">Target Output Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as "English" | "Chinese" | "Myanmar")}
                className="w-full bg-slate-800/50 border border-amber-900/30 rounded-lg px-4 py-3 text-white"
              >
                <option>English</option>
                <option>Chinese</option>
                <option>Myanmar</option>
              </select>
            </div>
            <Button
              onClick={handleConvertToScript}
              disabled={convertMutation.isPending || !transcript.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider py-3"
            >
              {convertMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Converting to Script...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Convert to Movie Recap Script
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
