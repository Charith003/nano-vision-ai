import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Atom, Target, Ruler, CircleDot, Layers, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ImageUploader from "@/components/ImageUploader";
import StatCard from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMockAnalysis, type AnalysisResult } from "@/lib/mockAnalysis";
import { addHistoryEntry } from "@/lib/historyDb";

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Analyze = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const modelConfidence = useMemo(() => {
    if (!result) return null;
    return Math.round((result.diceScore * 0.45 + result.iouScore * 0.25 + result.screeningMetrics.segmentationConfidence / 100 * 0.3) * 100);
  }, [result]);

  const handleAnalyze = () => {
    if (!imageFile) return;
    setAnalyzing(true);

    setTimeout(async () => {
      const nextResult = runMockAnalysis();
      setResult(nextResult);

      const imageData = await toBase64(imageFile);
      addHistoryEntry({
        imageName: imageFile.name,
        imageData,
        result: nextResult,
      });

      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Upload & Analyze</h1>
          <p className="text-muted-foreground mb-8">Comprehensive nanomedicine AI suite: reconstruction, characterization, formulation, nano-bio interaction, screening, advanced modeling, and multimodal fusion.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <ImageUploader
              onImageSelect={(file, url) => {
                setImagePreview(url);
                setImageFile(file);
                setResult(null);
              }}
            />

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
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">ML Model</h3>
                <p className="text-primary font-semibold">NanoVisionNet-X (Autoencoder + Morphology + Multimodal Heads)</p>
                <p className="text-sm text-muted-foreground">Confidence: {modelConfidence}% (calibrated)</p>
                <p className="text-sm text-muted-foreground">Reconstruction PSNR: {result.screeningMetrics.psnr.toFixed(2)} dB</p>

                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">Segmentation Metrics</h3>
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

          <div className="lg:col-span-2 space-y-5">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Nuclei Count" value={result.nucleiCount} icon={CircleDot} />
                  <StatCard label="Mean Area" value={result.meanArea} icon={Target} unit="px²" />
                  <StatCard label="Circularity" value={result.circularity} icon={Ruler} />
                  <StatCard label="Density" value={result.densityPerUnit} icon={Layers} unit="/unit" />
                </div>

                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Reconstructed Microscopy Image</h3>
                  <div className="rounded-xl border border-border/40 overflow-hidden bg-black/20 min-h-[320px] flex items-center justify-center">
                    <img src={imagePreview ?? ""} alt="Reconstructed microscopy preview" className="max-h-[380px] w-auto object-contain" />
                  </div>
                </div>

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

                <Tabs defaultValue="characterization" className="glass rounded-xl p-4">
                  <TabsList className="w-full grid grid-cols-5 bg-secondary/40 h-auto">
                    <TabsTrigger value="characterization">Characterization</TabsTrigger>
                    <TabsTrigger value="formulation">Formulation</TabsTrigger>
                    <TabsTrigger value="nanobio">Nano-Bio</TabsTrigger>
                    <TabsTrigger value="screening">Screening</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="characterization" className="pt-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Particle count comparison: <strong>{result.nucleiCount}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Area analysis score: <strong>{result.screeningMetrics.areaComparisonScore.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Circularity evaluation: <strong>{result.circularity.toFixed(3)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Aggregation detection: <strong>{result.screeningMetrics.aggregationDetectionScore.toFixed(1)}</strong></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="formulation" className="pt-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Diffusion coefficient: <strong>{result.screeningMetrics.diffusionCoefficient.toFixed(3)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Transport efficiency: <strong>{result.screeningMetrics.transportEfficiency.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Bioavailability prediction: <strong>{result.screeningMetrics.bioavailabilityPrediction.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Structural consistency: <strong>{result.screeningMetrics.structuralConsistency.toFixed(1)}</strong></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="nanobio" className="pt-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Membrane interaction: <strong>{result.screeningMetrics.membraneInteractionScore.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Cytotoxicity risk: <strong>{result.screeningMetrics.cytotoxicityRisk.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Surface stability: <strong>{result.screeningMetrics.surfaceStability.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Zeta potential proxy: <strong>{result.screeningMetrics.zetaPotentialProxy.toFixed(1)} mV</strong></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="screening" className="pt-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Risk score generation: <strong>{result.screeningMetrics.riskScore.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Weighted scoring logic: <strong>{result.screeningMetrics.weightedScore.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Threshold comparison gap: <strong>{result.screeningMetrics.thresholdGap.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Final screening score: <strong>{result.screeningMetrics.finalScreeningScore.toFixed(1)}</strong></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="pt-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-primary" />Encoder feature extraction proxy: <strong>{result.screeningMetrics.featureVectorIntegration.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Sigmoid-based model risk: <strong>{result.screeningMetrics.modelHeadRisk.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">PSNR / SSIM: <strong>{result.screeningMetrics.psnr.toFixed(2)} / {result.screeningMetrics.ssim.toFixed(3)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Segmentation confidence: <strong>{result.screeningMetrics.segmentationConfidence.toFixed(1)}</strong></div>
                    </div>
                  </TabsContent>
                </Tabs>

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
