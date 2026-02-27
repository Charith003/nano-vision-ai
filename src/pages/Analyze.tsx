import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Atom, Target, Ruler, CircleDot, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";
import ImageUploader from "@/components/ImageUploader";
import StatCard from "@/components/StatCard";
import { runMlMicroscopyAnalysis, type MlAnalysisResult } from "@/lib/mlAnalysis";

const metricClass = "rounded-lg bg-secondary/50 p-3";

const Analyze = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MlAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysis = await runMlMicroscopyAnalysis(selectedFile);
      setResult(analysis);
    } catch (error) {
      setResult(null);
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed. Please try a different image format.");
    } finally {
      setAnalyzing(false);
    }
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
            <ImageUploader onImageSelect={(file, url) => {
              setSelectedFile(file);
              setImagePreview(url);
              setResult(null);
              setAnalysisError(null);
            }} />

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


            {analysisError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                <p className="text-xs text-destructive font-medium">{analysisError}</p>
              </div>
            )}
            {result && (
              <div className="glass rounded-xl p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">ML Model</h3>
                  <p className="text-xs mt-1 text-primary font-medium">{result.modelName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Confidence: {(result.confidence * 100).toFixed(0)}% (calibrated {(result.confidenceCalibrated * 100).toFixed(0)}%)</p>
                  <p className="text-xs text-muted-foreground">Reconstruction PSNR: {result.reconstructionQuality} dB</p>
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Segmentation Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={metricClass}>
                    <span className="text-xs text-muted-foreground">Dice Score</span>
                    <p className="text-lg font-bold font-mono text-primary">{result.diceScore}</p>
                  </div>
                  <div className={metricClass}>
                    <span className="text-xs text-muted-foreground">IoU Score</span>
                    <p className="text-lg font-bold font-mono text-accent">{result.iouScore}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

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
                  <p className="text-sm text-muted-foreground">Running complete nanomedicine modeling pipeline...</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 font-mono">Reconstruction → Characterization → Formulation → Screening → Multimodal Fusion</p>
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

                <div className="glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reconstructed Microscopy Image</h3>
                  <img src={result.reconstructedImageUrl} alt="Reconstructed microscopy" className="w-full max-h-[320px] object-contain rounded-lg border border-border/50" />
                </div>

                <Tabs defaultValue="characterization" className="w-full">
                  <TabsList className="w-full overflow-auto">
                    <TabsTrigger value="characterization">Characterization</TabsTrigger>
                    <TabsTrigger value="formulation">Formulation</TabsTrigger>
                    <TabsTrigger value="interaction">Nano-Bio</TabsTrigger>
                    <TabsTrigger value="screening">Screening</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="characterization" className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Physics-informed score</p><p className="font-bold">{result.physicsInformedScore}</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Multi-scale index</p><p className="font-bold">{result.multiScaleStructuralIndex}</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Fractal dimension</p><p className="font-bold">{result.shapeIrregularity.fractalDimension}</p></div>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <h3 className="text-sm font-semibold mb-3">Temporal Stability Tracking</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={result.temporalStability}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 20%)" />
                          <XAxis dataKey="step" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="hsl(190 90% 55%)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="formulation" className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Diffusion coefficient</p><p className="font-bold">{result.drugFormulation.diffusionCoefficient} m²/s</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Transport efficiency</p><p className="font-bold">{result.drugFormulation.transportEfficiency}%</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Predicted bioavailability</p><p className="font-bold">{result.drugFormulation.pharmacokineticPrediction.bioavailability}%</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Drug efficacy prediction</p><p className="font-bold">{result.drugFormulation.efficacyPrediction}%</p></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="interaction" className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Membrane interaction</p><p className="font-bold">{result.nanoBioInteraction.membraneInteractionScore}</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Cytotoxicity risk</p><p className="font-bold">{result.nanoBioInteraction.cytotoxicityRisk}%</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Zeta potential</p><p className="font-bold">{result.surfacePropertyEstimate.zetaPotentialMv} mV</p></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="screening" className="space-y-4 mt-4">
                    <div className={`glass rounded-xl p-4 flex items-center justify-between ${
                      result.screeningDecision === "Promising Candidate" ? "box-glow" : ""
                    }`}>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Screening Decision</span>
                        <p className="text-xl font-bold">{result.screeningDecision}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Multi-factor score</span>
                        <p className="text-lg font-mono font-bold">{result.screeningModel.multiFactorScore}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Predictive toxicity</p><p className="font-bold">{result.screeningModel.predictiveToxicity}%</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Outcome prediction</p><p className="font-bold">{result.screeningModel.outcomePrediction}%</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Risk score</p><p className="font-bold">{result.screeningModel.riskScore}</p></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Drug synthesis simulation yield</p><p className="font-bold">{result.advancedModeling.synthesisSimulationYield}%</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Molecular interaction model</p><p className="font-bold">{result.advancedModeling.molecularInteractionScore}</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Pharmacodynamics index</p><p className="font-bold">{result.advancedModeling.pharmacodynamicsIndex}</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Docking affinity</p><p className="font-bold">{result.advancedModeling.dockingAffinityKcal} kcal/mol</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Patient-level outcome</p><p className="font-bold">{result.clinicalEvaluation.patientOutcomePrediction}%</p></div>
                      <div className={metricClass}><p className="text-xs text-muted-foreground">Multimodal fusion score</p><p className="font-bold">{result.multimodalFusion.fusionLearningScore}</p></div>
                    </div>
                    <div className="glass rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Particle Size Distribution</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={result.particleSizes}>
                          <XAxis dataKey="size" stroke="hsl(215 15% 50%)" fontSize={11} tickLine={false} />
                          <YAxis stroke="hsl(215 15% 50%)" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(220 18% 7%)", border: "1px solid hsl(220 15% 14%)", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "hsl(200 20% 92%)" }} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {result.particleSizes.map((_, i) => (
                              <Cell key={i} fill={`hsl(${190 - i * 8} 90% ${50 + i * 3}%)`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
