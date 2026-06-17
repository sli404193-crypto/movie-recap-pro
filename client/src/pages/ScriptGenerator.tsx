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

const TONES = ["Dramatic", "Comedic", "Suspenseful", "Educational", "Casual"] as const;
const LENGTHS = ["Short", "Medium", "Long"] as const;

export default function ScriptGenerator() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [movieTitle, setMovieTitle] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [plotSummary, setPlotSummary] = useState("");
  const [tone, setTone] = useState<typeof TONES[number]>("Dramatic");
  const [length, setLength] = useState<typeof LENGTHS[number]>("Medium");
  
  const generateMutation = trpc.scripts.generate.useMutation({
    onSuccess: () => {
      toast.success("Script generated successfully!");
      setMovieTitle("");
      setYear("");
      setGenre("");
      setPlotSummary("");
      setTone("Dramatic");
      setLength("Medium");
      setLocation("/history");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate script");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movieTitle.trim()) {
      toast.error("Please enter a movie title");
      return;
    }
    
    if (plotSummary.trim().length < 10) {
      toast.error("Plot summary must be at least 10 characters");
      return;
    }
    
    generateMutation.mutate({
      movieTitle: movieTitle.trim(),
      year: year ? parseInt(year) : undefined,
      genre: genre.trim() || undefined,
      plotSummary: plotSummary.trim(),
      tone,
      length,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-muted-foreground">Please log in to generate scripts</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      {generateMutation.isPending && <GenerationLoadingOverlay />}
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black py-12 px-4">
      {/* Atmospheric background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-400 via-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider">
            Script Generator
          </h1>
          <p className="text-amber-200/70 text-lg">Craft cinematic movie recaps with AI</p>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-900/50 border-amber-900/30 backdrop-blur-sm p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Movie Title */}
            <div className="space-y-2">
              <Label htmlFor="movieTitle" className="text-amber-100 font-semibold">
                Movie Title *
              </Label>
              <Input
                id="movieTitle"
                placeholder="Enter movie title"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                className="bg-slate-800/50 border-amber-900/30 text-white placeholder-gray-500 focus:border-amber-600"
                disabled={generateMutation.isPending}
              />
            </div>

            {/* Year and Genre Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-amber-100 font-semibold">
                  Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="e.g., 2023"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-800/50 border-amber-900/30 text-white placeholder-gray-500 focus:border-amber-600"
                  disabled={generateMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre" className="text-amber-100 font-semibold">
                  Genre
                </Label>
                <Input
                  id="genre"
                  placeholder="e.g., Action, Drama"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="bg-slate-800/50 border-amber-900/30 text-white placeholder-gray-500 focus:border-amber-600"
                  disabled={generateMutation.isPending}
                />
              </div>
            </div>

            {/* Plot Summary */}
            <div className="space-y-2">
              <Label htmlFor="plotSummary" className="text-amber-100 font-semibold">
                Plot Summary *
              </Label>
              <Textarea
                id="plotSummary"
                placeholder="Describe the main plot points and story..."
                value={plotSummary}
                onChange={(e) => setPlotSummary(e.target.value)}
                className="bg-slate-800/50 border-amber-900/30 text-white placeholder-gray-500 focus:border-amber-600 min-h-32 resize-none"
                disabled={generateMutation.isPending}
              />
              <p className="text-xs text-gray-400">Minimum 10 characters</p>
            </div>

            {/* Tone and Length Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone" className="text-amber-100 font-semibold">
                  Tone
                </Label>
                <Select value={tone} onValueChange={(v) => setTone(v as typeof TONES[number])}>
                  <SelectTrigger className="bg-slate-800/50 border-amber-900/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-900/30">
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t} className="text-white hover:bg-amber-900/20">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="length" className="text-amber-100 font-semibold">
                  Length
                </Label>
                <Select value={length} onValueChange={(v) => setLength(v as typeof LENGTHS[number])}>
                  <SelectTrigger className="bg-slate-800/50 border-amber-900/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-900/30">
                    <SelectItem value="Short" className="text-white hover:bg-amber-900/20">
                      Short (~3 min)
                    </SelectItem>
                    <SelectItem value="Medium" className="text-white hover:bg-amber-900/20">
                      Medium (~7 min)
                    </SelectItem>
                    <SelectItem value="Long" className="text-white hover:bg-amber-900/20">
                      Long (~12 min)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold uppercase tracking-wider py-6 text-lg transition-all duration-300 disabled:opacity-50"
            >
              {generateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-5 h-5" />
                  Generating...
                </div>
              ) : (
                "Generate Script"
              )}
            </Button>
          </form>
        </Card>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-amber-900/10 border border-amber-900/30 rounded-lg backdrop-blur-sm">
          <p className="text-amber-100/80 text-sm">
            <span className="font-semibold">Tip:</span> The more detailed your plot summary, the more compelling your script will be. Include key plot points, character arcs, and the overall tone of the film.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
