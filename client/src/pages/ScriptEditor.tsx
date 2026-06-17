import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Copy, Download, ArrowLeft } from "lucide-react";

export default function ScriptEditor() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/editor/:id");
  const scriptId = params?.id ? parseInt(params.id) : null;
  
  const [script, setScript] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: scriptData, isLoading } = trpc.scripts.getById.useQuery(
    { scriptId: scriptId! },
    { enabled: !!scriptId }
  );
  
  const updateMutation = trpc.scripts.update.useMutation({
    onSuccess: () => {
      toast.success("Script updated successfully!");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update script");
    },
  });

  useEffect(() => {
    if (scriptData) {
      setScript(scriptData.generatedScript);
    }
  }, [scriptData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    toast.success("Script copied to clipboard!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([script], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${scriptData?.movieTitle || "script"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Script downloaded!");
  };

  const handleSave = () => {
    if (!scriptId) return;
    updateMutation.mutate({
      scriptId,
      generatedScript: script,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-muted-foreground">Please log in to view scripts</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
        <Spinner className="w-12 h-12 text-amber-500" />
      </div>
    );
  }

  if (!scriptData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
        <Card className="p-8 max-w-md bg-slate-900/50 border-amber-900/30">
          <p className="text-center text-amber-100 mb-4">Script not found</p>
          <Button
            onClick={() => setLocation("/history")}
            variant="outline"
            className="w-full"
          >
            Back to History
          </Button>
        </Card>
      </div>
    );
  }

  const wordCount = script.split(/\s+/).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black py-12 px-4">
      {/* Atmospheric background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              onClick={() => setLocation("/history")}
              variant="ghost"
              className="mb-4 text-amber-200 hover:text-amber-100 hover:bg-amber-900/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-400 via-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider">
              {scriptData.movieTitle}
            </h1>
            <p className="text-amber-200/70 mt-2">
              {scriptData.year && `${scriptData.year} • `}
              {scriptData.genre} • {scriptData.tone} • {scriptData.length}
            </p>
          </div>
        </div>

        {/* Editor Card */}
        <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8 shadow-2xl mb-6">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-amber-900/20">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="border-amber-600 text-amber-100 hover:bg-amber-900/20"
            >
              {isEditing ? "View Mode" : "Edit Mode"}
            </Button>
            
            {isEditing && (
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {updateMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            )}
            
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

          {/* Script Content */}
          {isEditing ? (
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="bg-slate-800/50 border-amber-900/30 text-white placeholder-gray-500 focus:border-amber-600 min-h-96 resize-none font-mono text-sm"
              placeholder="Your script will appear here..."
            />
          ) : (
            <div className="bg-slate-800/30 rounded-lg p-6 min-h-96 overflow-auto">
              <p className="text-gray-100 whitespace-pre-wrap font-serif leading-relaxed">
                {script}
              </p>
            </div>
          )}

          {/* Word Count */}
          <div className="mt-6 flex justify-between items-center text-sm text-amber-200/70">
            <span>Word Count: <span className="font-bold text-amber-100">{wordCount}</span></span>
            <span>Target: <span className="font-bold text-amber-100">
              {scriptData.length === "Short" ? "~600" : scriptData.length === "Medium" ? "~1400" : "~2400"}
            </span></span>
          </div>
        </Card>

        {/* Script Metadata */}
        <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-6">
          <h3 className="text-amber-100 font-semibold mb-4 uppercase tracking-wider">Script Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Tone</p>
              <p className="text-amber-100 font-semibold">{scriptData.tone}</p>
            </div>
            <div>
              <p className="text-gray-400">Length</p>
              <p className="text-amber-100 font-semibold">{scriptData.length}</p>
            </div>
            <div>
              <p className="text-gray-400">Created</p>
              <p className="text-amber-100 font-semibold">
                {new Date(scriptData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Words</p>
              <p className="text-amber-100 font-semibold">{wordCount}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
