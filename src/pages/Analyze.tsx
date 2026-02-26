import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Atom, Target, Ruler, CircleDot, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ImageUploader from "@/components/ImageUploader";
import StatCard from "@/components/StatCard";
import { runMockAnalysis, type AnalysisResult } from "@/lib/mockAnalysis";

const Analyze = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setResult(runMockAnalysis());
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Upload & Analyze</h1>
          <p className="text-muted-foreground mb-8">Upload a microscopy image for AI-powered reconstruction, segmentation, and nanoparticle characterization.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Upload */}
          <div className="lg:col-span-1 space-y-4">
            <ImageUploader onImageSelect={(_, url) => { setImagePreview(url); setResult(null); }} />
            
            {imagePreview && (
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full gradient-primary text-primary-foreground font-semibold gap-2"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Run Analysis
                  </>
                )}
              </Button>
            )}

            {result && (
              <div className="glass rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Segmentation Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-xs text-muted-foreground">Dice Score</span>
                    <p className="text-lg font-bold font-mono text-primary">{result.diceScore}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-xs text-muted-foreground">IoU Score</span>
                    <p className="text-lg font-bold font-mono text-accent">{result.iouScore}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            {!result && !analyzing && (
              <div className="glass rounded-xl h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Atom className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Upload an image and run analysis to see results</p>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="glass rounded-xl h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Running reconstruction & segmentation pipeline...</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 font-mono">Autoencoder → U-Net → Nanoparticle Analysis</p>
                </div>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Nuclei Count" value={result.nucleiCount} icon={CircleDot} />
                  <StatCard label="Mean Area" value={result.meanArea} icon={Target} unit="px²" />
                  <StatCard label="Circularity" value={result.circularity} icon={Ruler} />
                  <StatCard label="Density" value={result.densityPerUnit} icon={Layers} unit="/unit" />
                </div>

                {/* Screening badge */}
                <div className={`glass rounded-xl p-4 flex items-center justify-between ${
                  result.screeningDecision === "Promising Candidate" ? "box-glow" : ""
                }`}>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Screening Decision</span>
                    <p className={`text-xl font-bold ${
                      result.screeningDecision === "Promising Candidate" ? "text-accent" :
                      result.screeningDecision === "Needs Optimization" ? "text-chart-4" : "text-destructive"
                    }`}>
                      {result.screeningDecision}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Aggregation Score</span>
                    <p className="text-lg font-mono font-bold">{result.aggregationScore}</p>
                  </div>
                </div>

                {/* Histogram */}
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Particle Size Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.particleSizes}>
                      <XAxis dataKey="size" stroke="hsl(215 15% 50%)" fontSize={11} tickLine={false} />
                      <YAxis stroke="hsl(215 15% 50%)" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(220 18% 7%)", border: "1px solid hsl(220 15% 14%)", borderRadius: "8px", fontSize: "12px" }}
                        labelStyle={{ color: "hsl(200 20% 92%)" }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {result.particleSizes.map((_, i) => (
                          <Cell key={i} fill={`hsl(${190 - i * 8} 90% ${50 + i * 3}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
