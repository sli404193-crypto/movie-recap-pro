import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { GenerationLoadingOverlay } from "@/components/GenerationLoadingOverlay";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { useLocation } from "wouter";
import { Copy, Download, ArrowLeft, FileText, File } from "lucide-react";

const LANGUAGES = ["English", "Chinese", "Myanmar"] as const;

export default function VideoToScript() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [videoInput, setVideoInput] = useState<"file" | "url">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<"English" | "Chinese" | "Myanmar">("English");
  const [targetLanguage, setTargetLanguage] = useState<"English" | "Chinese" | "Myanmar">("English");
  const [rawTranscript, setRawTranscript] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [step, setStep] = useState<"input" | "transcript" | "output">("input");

  const extractMutation = trpc.videoTranscripts.extractTranscript.useMutation();
  const convertMutation = trpc.videoTranscripts.convertToScript.useMutation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center">
        <Spinner className="w-12 h-12 text-amber-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-200 mb-4">Please log in to use this feature</p>
          <Button onClick={() => setLocation("/")} className="bg-amber-600 hover:bg-amber-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleExtractTranscript = async () => {
    if (!videoUrl) {
      toast.error("Please provide a video URL (direct link to audio/video file)");
      return;
    }

    try {
      const result = await extractMutation.mutateAsync({
        videoUrl,
        sourceLanguage,
      });

      setRawTranscript(result.rawTranscript);
      setStep("transcript");
      toast.success("Transcript extracted successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to extract transcript";
      toast.error(errorMessage);
      console.error("Extraction error:", error);
    }
  };

  const handleConvertToScript = async () => {
    if (!rawTranscript.trim()) {
      toast.error("Please provide a transcript");
      return;
    }

    try {
      const result = await convertMutation.mutateAsync({
        rawTranscript,
        sourceLanguage,
        targetLanguage,
      });

      setGeneratedScript(result.generatedScript);
      setWordCount(result.wordCount);
      setStep("output");
      toast.success("Script generated successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to convert transcript to script";
      toast.error(errorMessage);
      console.error("Conversion error:", error);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    toast.success("Script copied to clipboard!");
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedScript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `movie-recap-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Script downloaded as TXT!");
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = `# Movie Recap Script

**Source Language:** ${sourceLanguage}  
**Target Language:** ${targetLanguage}  
**Word Count:** ${wordCount}  
**Created:** ${new Date().toLocaleDateString()}

---

${generatedScript}
`;
    const element = document.createElement("a");
    const file = new Blob([markdownContent], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `movie-recap-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Script downloaded as Markdown!");
  };

  const handleReset = () => {
    setVideoUrl("");
    setVideoFile(null);
    setRawTranscript("");
    setGeneratedScript("");
    setWordCount(0);
    setStep("input");
  };

  return (
    <>
      {(extractMutation.isPending || convertMutation.isPending) && <GenerationLoadingOverlay />}
      
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black py-12 px-4">
        {/* Atmospheric background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setLocation("/")}
                variant="ghost"
                className="text-amber-200 hover:text-amber-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-300 via-white to-gray-400 bg-clip-text text-transparent uppercase tracking-wider">
                VIDEO TO SCRIPT
              </h1>
              <div className="w-20"></div>
            </div>
            <p className="text-amber-200/80 text-lg">
              Convert video dialogue to movie recap scripts in multiple languages
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8 flex justify-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === "input" ? "bg-amber-900/30 border border-amber-600" : "bg-slate-800/30"}`}>
              <span className="text-amber-200">1. Input</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === "transcript" ? "bg-amber-900/30 border border-amber-600" : "bg-slate-800/30"}`}>
              <span className="text-amber-200">2. Transcript</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === "output" ? "bg-amber-900/30 border border-amber-600" : "bg-slate-800/30"}`}>
              <span className="text-amber-200">3. Output</span>
            </div>
          </div>

          {/* Step 1: Video Input */}
          {step === "input" && (
            <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide">Step 1: Provide Video Link</h2>

              {/* Video URL Input */}
              <div className="mb-6">
                <Label className="text-amber-200 mb-2 block">Direct Video/Audio URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/video.mp4 or https://example.com/audio.mp3"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="bg-slate-800/50 border-amber-900/30 text-white placeholder-gray-500"
                />
                <p className="text-amber-100/60 text-sm mt-2">Supported: Direct links to MP4, MP3, WAV, WebM files (max 16MB). Not supported: YouTube, Vimeo, or other video pages.</p>
              </div>

              {/* Source Language */}
              <div className="mb-6">
                <Label className="text-amber-200 mb-2 block">Source Language</Label>
                <Select value={sourceLanguage} onValueChange={(value: any) => setSourceLanguage(value)}>
                  <SelectTrigger className="bg-slate-800/50 border-amber-900/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-900/30">
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang} className="text-white hover:bg-amber-900/30">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Extract Button */}
              <Button
                onClick={handleExtractTranscript}
                disabled={extractMutation.isPending || !videoUrl}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 uppercase tracking-wide"
              >
                {extractMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Extracting Transcript...
                  </>
                ) : (
                  "Extract Transcript"
                )}
              </Button>
            </Card>
          )}

          {/* Step 2: Transcript Editing */}
          {step === "transcript" && (
            <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide">Step 2: Review & Edit Transcript</h2>

              <div className="mb-6">
                <Label className="text-amber-200 mb-2 block">Raw Transcript (Editable)</Label>
                <Textarea
                  value={rawTranscript}
                  onChange={(e) => setRawTranscript(e.target.value)}
                  className="bg-slate-800/50 border-amber-900/30 text-white min-h-64 placeholder-gray-500"
                  placeholder="Edit the extracted transcript here..."
                />
              </div>

              {/* Target Language Selection */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-amber-200 mb-2 block">Source Language</Label>
                  <Select value={sourceLanguage} onValueChange={(value: any) => setSourceLanguage(value)}>
                    <SelectTrigger className="bg-slate-800/50 border-amber-900/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-amber-900/30">
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang} className="text-white hover:bg-amber-900/30">
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-amber-200 mb-2 block">Target Output Language</Label>
                  <Select value={targetLanguage} onValueChange={(value: any) => setTargetLanguage(value)}>
                    <SelectTrigger className="bg-slate-800/50 border-amber-900/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-amber-900/30">
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang} className="text-white hover:bg-amber-900/30">
                          {lang === "Myanmar" ? "Myanmar (ရုပ်ရှင်အညွှန်း)" : lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setStep("input")}
                  variant="outline"
                  className="flex-1 border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConvertToScript}
                  disabled={convertMutation.isPending || !rawTranscript.trim()}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wide"
                >
                  {convertMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Converting...
                    </>
                  ) : (
                    "Convert to Movie Recap Script"
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Output */}
          {step === "output" && (
            <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Generated Movie Recap Script</h2>
              <p className="text-amber-200/80 mb-6">
                Language: {targetLanguage} | Word Count: {wordCount}
              </p>

              {/* Script Display */}
              <div className="mb-6 bg-slate-800/30 border border-amber-900/20 rounded-lg p-6 max-h-96 overflow-y-auto">
                <p className="text-amber-100 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {generatedScript}
                </p>
              </div>

              {/* Export Buttons */}
              <div className="mb-6 flex flex-wrap gap-3">
                <Button
                  onClick={handleCopyScript}
                  variant="outline"
                  className="border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>

                <Button
                  onClick={handleDownloadTxt}
                  variant="outline"
                  className="border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  TXT
                </Button>

                <Button
                  onClick={handleDownloadMarkdown}
                  variant="outline"
                  className="border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Markdown
                </Button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 border-amber-600 text-amber-100 hover:bg-amber-900/20"
                >
                  Start Over
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wide"
                >
                  Go Home
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
