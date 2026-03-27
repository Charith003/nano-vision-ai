import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Atom, Target, Ruler, CircleDot, Layers, BrainCircuit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";
import ImageUploader from "@/components/ImageUploader";
import StatCard from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMockAnalysis, type AnalysisResult } from "@/lib/mockAnalysis";
import { addHistoryEntry, type AnalysisHistoryEntry } from "@/lib/historyDb";

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const compressImageForStorage = (file: File, maxSide = 1400, quality = 0.72) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const longestSide = Math.max(image.width, image.height) || 1;
      const scale = Math.min(1, maxSide / longestSide);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to initialize canvas context for image compression."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      const compressedData = canvas.toDataURL("image/jpeg", quality);
      URL.revokeObjectURL(objectUrl);
      resolve(compressedData);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to compress selected image."));
    };

    image.src = objectUrl;
  });

const isStorageQuotaError = (error: unknown) =>
  error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");

const Analyze = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const modelConfidence = useMemo(() => {
    if (!result) return null;
    return Math.round((result.diceScore * 0.45 + result.iouScore * 0.25 + result.screeningMetrics.segmentationConfidence / 100 * 0.3) * 100);
  }, [result]);

  const temporalStability = useMemo(() => {
    if (!result) return [];
    const base = result.stabilityScore - 14;
    return ["T1", "T2", "T3", "T4", "T5"].map((t, i) => ({
      t,
      value: Number((base + i * 4).toFixed(1)),
    }));
  }, [result]);

  const analysisSmilesDiagramUrl = useMemo(() => {
    if (!result) return "";
    const encodedSmiles = encodeURIComponent(result.screeningMetrics.smiles);
    return `https://cactus.nci.nih.gov/chemical/structure/${encodedSmiles}/image?format=png&resolver=smiles`;
  }, [result]);

  const handleAnalyze = () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setSaveMessage(null);
    setSavedEntryId(null);

    setTimeout(() => {
      const nextResult = runMockAnalysis();
      setResult(nextResult);
      setAnalyzing(false);
    }, 1200);
  };

  const saveAnalysisToHistory = async () => {
    if (!imageFile || !result || saving) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      let imageData = await toBase64(imageFile);
      let saved: AnalysisHistoryEntry | null = null;

      try {
        saved = addHistoryEntry({
          imageName: imageFile.name,
          imageData,
          result,
        });
      } catch (error) {
        if (!isStorageQuotaError(error)) throw error;
        imageData = await compressImageForStorage(imageFile);
        saved = addHistoryEntry({
          imageName: imageFile.name,
          imageData,
          result,
        });
      }

      if (!saved) {
        throw new Error("No history entry was saved.");
      }

      setSavedEntryId(saved.id);
      setSaveMessage(`Saved successfully. Record ID: ${saved.id}`);
    } catch (error) {
      console.error("Failed to save analysis history", error);
      setSaveMessage("Failed to save analysis. Storage may be full or blocked in this browser.");
    } finally {
      setSaving(false);
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
            <ImageUploader
              onImageSelect={(file, url) => {
                setImagePreview(url);
                setImageFile(file);
                setResult(null);
                setSavedEntryId(null);
                setSaveMessage(null);
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
                <Button
                  onClick={saveAnalysisToHistory}
                  disabled={saving || Boolean(savedEntryId)}
                  variant={savedEntryId ? "outline" : "default"}
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : savedEntryId ? "Saved to History" : "Save Analysis"}
                </Button>
                {saveMessage && <p className="text-xs text-muted-foreground break-all">{saveMessage}</p>}
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
              <div className="glass rounded-xl flex items-start justify-center min-h-[180px] py-8">
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Running reconstruction & segmentation pipeline...</p>
                  <p className="text-xs text-muted-foreground/60 font-mono">Autoencoder → U-Net → Nanoparticle Analysis</p>
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

                <Tabs defaultValue="characterization" className="glass rounded-xl p-4">
                  <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 bg-secondary/40 h-auto gap-1">
                    <TabsTrigger value="characterization">Characterization</TabsTrigger>
                    <TabsTrigger value="formulation">Formulation</TabsTrigger>
                    <TabsTrigger value="nanobio">Nano-Bio</TabsTrigger>
                    <TabsTrigger value="drug">Drug Prediction</TabsTrigger>
                    <TabsTrigger value="screening">Screening</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="characterization" className="pt-3 space-y-4">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Physics-informed score<br /><strong className="text-2xl">{result.screeningMetrics.multiFactorScore.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Multi-scale index<br /><strong className="text-2xl">{(result.screeningMetrics.featureVectorIntegration + 5).toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Fractal dimension<br /><strong className="text-2xl">{(1.1 + result.circularity * 0.3).toFixed(1)}</strong></div>
                    </div>
                    <div className="rounded-lg border border-border/40 p-4">
                      <p className="font-semibold mb-3">Temporal Stability Tracking</p>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={temporalStability}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
                          <XAxis dataKey="t" stroke="hsl(215 15% 50%)" />
                          <YAxis stroke="hsl(215 15% 50%)" domain={[0, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(220 18% 7%)", border: "1px solid hsl(220 15% 14%)" }} />
                          <Line type="monotone" dataKey="value" stroke="hsl(190 90% 55%)" strokeWidth={2.5} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="formulation" className="pt-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Diffusion coefficient<br /><strong className="text-3xl">{result.screeningMetrics.diffusionCoefficient.toExponential(2)} m²/s</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Transport efficiency<br /><strong className="text-3xl">{result.screeningMetrics.transportEfficiency.toFixed(1)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Predicted bioavailability<br /><strong className="text-3xl">{Math.round(result.screeningMetrics.bioavailabilityPrediction)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Drug efficacy prediction<br /><strong className="text-3xl">{Math.round(result.screeningMetrics.weightedScore)}%</strong></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="nanobio" className="pt-3">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Membrane interaction<br /><strong className="text-4xl">{result.screeningMetrics.membraneInteractionScore.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Cytotoxicity risk<br /><strong className="text-4xl">{Math.round(result.screeningMetrics.cytotoxicityRisk)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Zeta potential<br /><strong className="text-4xl">{result.screeningMetrics.zetaPotentialProxy.toFixed(0)} mV</strong></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="drug" className="pt-3 space-y-4">
                    <div className="grid md:grid-cols-4 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3 md:col-span-2">SMILES<br /><strong className="text-lg break-all">{result.screeningMetrics.smiles}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Molecular weight<br /><strong className="text-3xl">{result.screeningMetrics.molecularWeight.toFixed(2)} Da</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Binding affinity<br /><strong className="text-3xl">{result.screeningMetrics.bindingAffinity.toFixed(2)} kcal/mol</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Solubility<br /><strong className="text-3xl">{result.screeningMetrics.solubility.toFixed(2)} mg/mL</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Cell uptake<br /><strong className="text-3xl">{result.screeningMetrics.cellUptakeRate.toFixed(1)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Protein interaction<br /><strong className="text-3xl">{result.screeningMetrics.proteinInteraction.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Target receptor binding<br /><strong className="text-3xl">{result.screeningMetrics.targetReceptorBinding.toFixed(1)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Toxicity label<br /><strong className="text-3xl">{result.screeningMetrics.toxicityLabel}</strong></div>
                    </div>
                    <div className="rounded-lg border border-border/40 p-4 bg-white">
                      <p className="font-semibold mb-3 text-foreground">2D Chemical Diagram</p>
                      <img
                        key={result.screeningMetrics.smiles}
                        src={analysisSmilesDiagramUrl}
                        alt={`2D chemical structure for ${result.screeningMetrics.smiles}`}
                        className="h-44 object-contain mx-auto"
                        onError={(event) => {
                          event.currentTarget.src = "https://placehold.co/520x220?text=SMILES+diagram+unavailable";
                        }}
                      />
                    </div>
                    <div className="rounded-lg border border-border/40 p-4">
                      <p className="font-semibold mb-3">Time-Series Dynamics (Diffusion / Movement / Cell Response)</p>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={result.dynamicsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
                          <XAxis dataKey="t" stroke="hsl(215 15% 50%)" />
                          <YAxis stroke="hsl(215 15% 50%)" domain={[0, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(220 18% 7%)", border: "1px solid hsl(220 15% 14%)" }} />
                          <Line type="monotone" dataKey="diffusion" stroke="hsl(190 90% 55%)" strokeWidth={2} />
                          <Line type="monotone" dataKey="movement" stroke="hsl(280 70% 65%)" strokeWidth={2} />
                          <Line type="monotone" dataKey="cellResponse" stroke="hsl(34 95% 60%)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Predicted efficacy<br /><strong className="text-4xl">{result.screeningMetrics.predictedDrugEfficacy.toFixed(1)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Predictive toxicity<br /><strong className="text-4xl">{result.screeningMetrics.predictiveToxicityScore.toFixed(1)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Decision engine<br /><strong className="text-4xl">{result.screeningMetrics.automatedDecision}</strong></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="screening" className="pt-3 space-y-3">
                    <div className="rounded-xl border border-border/40 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wider text-muted-foreground">Screening Decision</p>
                        <p className="text-4xl font-bold">{result.screeningDecision}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Multi-factor score</p>
                        <p className="text-4xl font-bold">{result.screeningMetrics.multiFactorScore.toFixed(1)}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Predictive toxicity<br /><strong className="text-4xl">{Math.round(result.screeningMetrics.cytotoxicityRisk)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Outcome prediction<br /><strong className="text-4xl">{Math.round(result.screeningMetrics.finalScreeningScore)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Risk score<br /><strong className="text-4xl">{result.screeningMetrics.riskScore.toFixed(1)}</strong></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="pt-3 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-secondary/40 p-3">Drug synthesis simulation yield<br /><strong className="text-4xl">{Math.round(result.screeningMetrics.weightedScore)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Molecular interaction model<br /><strong className="text-4xl">{result.screeningMetrics.featureVectorIntegration.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Pharmacodynamics index<br /><strong className="text-4xl">{result.screeningMetrics.pharmacodynamicsIndex.toFixed(1)}</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Docking affinity<br /><strong className="text-4xl">{result.screeningMetrics.dockingAffinity.toFixed(2)} kcal/mol</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3">Patient-level outcome<br /><strong className="text-4xl">{Math.round(result.screeningMetrics.finalScreeningScore)}%</strong></div>
                      <div className="rounded-lg bg-secondary/40 p-3 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-primary" />Multimodal fusion score<br /><strong className="text-4xl">{(result.screeningMetrics.featureVectorIntegration - 8).toFixed(1)}</strong></div>
                    </div>
                    <div className="glass rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Particle Size Distribution</h3>
                      <ResponsiveContainer width="100%" height={280}>
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
