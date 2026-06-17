import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Eye, Trash2, Plus } from "lucide-react";
import { useState } from "react";

export default function ScriptHistory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const { data: scripts, isLoading, refetch } = trpc.scripts.list.useQuery();
  
  const deleteMutation = trpc.scripts.delete.useMutation({
    onSuccess: () => {
      toast.success("Script deleted successfully!");
      setDeletingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete script");
    },
  });

  const handleDelete = (scriptId: number) => {
    if (window.confirm("Are you sure you want to delete this script?")) {
      setDeletingId(scriptId);
      deleteMutation.mutate({ scriptId });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-muted-foreground">Please log in to view your scripts</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black py-12 px-4">
      {/* Atmospheric background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-400 via-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider">
              Script History
            </h1>
            <p className="text-amber-200/70 text-lg">Manage your generated movie recap scripts</p>
          </div>
          <Button
            onClick={() => setLocation("/generate")}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Script
          </Button>
        </div>

        {/* Scripts List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-12 h-12 text-amber-500" />
          </div>
        ) : !scripts || scripts.length === 0 ? (
          <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-12 text-center">
            <p className="text-amber-100 text-lg mb-6">No scripts yet. Create your first movie recap!</p>
            <Button
              onClick={() => setLocation("/generate")}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Script
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {scripts.map((script) => (
              <Card
                key={script.id}
                className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-6 hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent mb-2">
                      {script.movieTitle}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-amber-200/70">
                      {script.year && <span>{script.year}</span>}
                      {script.genre && <span>•</span>}
                      {script.genre && <span>{script.genre}</span>}
                      <span>•</span>
                      <span className="font-semibold text-amber-100">{script.tone}</span>
                      <span>•</span>
                      <span className="font-semibold text-amber-100">{script.length}</span>
                      <span>•</span>
                      <span>{script.wordCount} words</span>
                      <span>•</span>
                      <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setLocation(`/editor/${script.id}`)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleDelete(script.id)}
                      disabled={deletingId === script.id}
                      variant="destructive"
                      className="font-bold"
                    >
                      {deletingId === script.id ? (
                        <>
                          <Spinner className="w-4 h-4 mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
