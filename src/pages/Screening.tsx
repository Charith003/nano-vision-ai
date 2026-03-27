import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Trash2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HISTORY_UPDATED_EVENT, deleteHistoryEntry, getHistoryEntries, type AnalysisHistoryEntry } from "@/lib/historyDb";

const sections = [
  { key: "overview", title: "Screening Module Overview" },
  { key: "morphology", title: "Morphology-Based Screening" },
  { key: "reconstruction", title: "Reconstruction Quality Assessment" },
  { key: "interaction", title: "Nano–Bio Interaction Indicators" },
  { key: "formulation", title: "Formulation Stability Evaluation" },
  { key: "drug", title: "Drug Prediction (Multimodal)" },
  { key: "aggregation", title: "Aggregation Behavior Analysis" },
  { key: "risk", title: "Multi-Factor Risk Score Calculation" },
  { key: "classification", title: "Screening Decision Classification" },
  { key: "model", title: "Model-Based Screening Head (NanoVisionNet-X)" },
  { key: "visualization", title: "Screening Output Visualization" },
] as const;

const Screening = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openSection, setOpenSection] = useState<(typeof sections)[number]["key"] | null>(null);

  useEffect(() => {
    const refreshHistory = () => {
      const entries = getHistoryEntries();
      setHistory(entries);
      setSelectedIds((prev) => {
        const existingIds = new Set(entries.map((entry) => entry.id));
        const kept = prev.filter((id) => existingIds.has(id));
        return kept.length > 0 ? kept : entries.map((entry) => entry.id);
      });
    };

    refreshHistory();
    window.addEventListener(HISTORY_UPDATED_EVENT, refreshHistory);

    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, refreshHistory);
    };
  }, []);

  const selectedSamples = useMemo(
    () => history.filter((entry) => selectedIds.includes(entry.id)),
    [history, selectedIds],
  );

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return history;
    return history.filter((entry) => entry.imageName.toLowerCase().includes(query));
  }, [history, search]);

  const comparisonData = selectedSamples.map((sample) => ({
    id: sample.imageName.slice(0, 16),
    risk: sample.result.screeningMetrics.riskScore,
    final: sample.result.screeningMetrics.finalScreeningScore,
    psnr: sample.result.screeningMetrics.psnr,
  }));

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id)));
  };

  const deleteSample = (id: string) => {
    deleteHistoryEntry(id);
    const entries = getHistoryEntries();
    setHistory(entries);
    setSelectedIds((prev) => prev.filter((value) => value !== id));
  };

  const sectionRows = (section: string, sample: AnalysisHistoryEntry) => {
    const s = sample.result;
    switch (section) {
      case "overview":
        return `${s.screeningMetrics.riskScore.toFixed(1)} risk | ${s.screeningDecision}`;
      case "morphology":
        return `${s.nucleiCount} particles · ${s.meanArea.toFixed(1)} area · ${s.circularity.toFixed(2)} circ`;
      case "reconstruction":
        return `PSNR ${s.screeningMetrics.psnr.toFixed(2)} · SSIM ${s.screeningMetrics.ssim.toFixed(3)} · Conf ${s.screeningMetrics.segmentationConfidence.toFixed(1)}`;
      case "interaction":
        return `Mem ${s.screeningMetrics.membraneInteractionScore.toFixed(1)} · Cyto ${s.screeningMetrics.cytotoxicityRisk.toFixed(1)} · Zeta ${s.screeningMetrics.zetaPotentialProxy.toFixed(1)}`;
      case "formulation":
        return `Diff ${s.screeningMetrics.diffusionCoefficient.toFixed(3)} · Transport ${s.screeningMetrics.transportEfficiency.toFixed(1)} · Bio ${s.screeningMetrics.bioavailabilityPrediction.toFixed(1)}`;
      case "drug":
        return `Efficacy ${s.screeningMetrics.predictedDrugEfficacy.toFixed(1)} · Toxicity ${s.screeningMetrics.predictiveToxicityScore.toFixed(1)} · ${s.screeningMetrics.automatedDecision}`;
      case "aggregation":
        return `Cluster ${s.screeningMetrics.clusterFormation.toFixed(1)} · Density Δ ${s.screeningMetrics.densityVariation.toFixed(1)} · Overlap ${s.screeningMetrics.particleOverlap.toFixed(1)}`;
      case "risk":
        return `Vector ${s.screeningMetrics.featureVectorIntegration.toFixed(1)} · Weighted ${s.screeningMetrics.weightedScore.toFixed(1)} · Gap ${s.screeningMetrics.thresholdGap.toFixed(1)}`;
      case "classification":
        return `${s.screeningDecision} · Stability Risk ${s.screeningMetrics.stabilityRisk.toFixed(1)}`;
      case "model":
        return `Encoder ${s.screeningMetrics.featureVectorIntegration.toFixed(1)} · Sigmoid risk ${s.screeningMetrics.modelHeadRisk.toFixed(1)}`;
      default:
        return `Risk ${s.screeningMetrics.riskScore.toFixed(1)} · Final ${s.screeningMetrics.finalScreeningScore.toFixed(1)} · PSNR ${s.screeningMetrics.psnr.toFixed(2)}`;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Drug Screening Dashboard</h1>
          <p className="text-muted-foreground">Select history samples and open any screening section in one click popup.</p>
        </motion.div>

        {history.length === 0 ? (
          <div className="glass rounded-xl flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No history found. Analyze images first to enable screening comparison.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Select samples from history</h3>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sample name"
                className="mb-3"
              />
              <div className="grid md:grid-cols-3 gap-3">
                {filteredHistory.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border/40 p-3 bg-secondary/20 space-y-2 min-w-0">
                    <label className="flex items-start gap-2 cursor-pointer min-w-0">
                      <Checkbox
                        checked={selectedIds.includes(entry.id)}
                        onCheckedChange={(checked) => toggleSelection(entry.id, Boolean(checked))}
                      />
                      <span className="text-sm min-w-0 flex-1">
                        <span className="font-medium block break-all leading-snug">{entry.imageName}</span>
                        <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </span>
                    </label>
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="h-7 px-2 gap-1" onClick={() => deleteSample(entry.id)}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredHistory.length === 0 && <p className="text-xs text-muted-foreground mt-2">No matching samples found.</p>}
            </div>

            {selectedSamples.length > 0 && (
              <>
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Risk / Final / PSNR Comparison</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
                      <XAxis dataKey="id" stroke="hsl(215 15% 50%)" />
                      <YAxis stroke="hsl(215 15% 50%)" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(220 18% 7%)", border: "1px solid hsl(220 15% 14%)" }} />
                      <Bar dataKey="risk" fill="hsl(12 85% 60%)" />
                      <Bar dataKey="final" fill="hsl(190 90% 50%)" />
                      <Bar dataKey="psnr" fill="hsl(160 70% 45%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sections.map((section) => (
                    <button
                      key={section.key}
                      type="button"
                      className="glass rounded-xl p-4 text-left hover:box-glow transition-all"
                      onClick={() => setOpenSection(section.key)}
                    >
                      <p className="font-semibold mb-1">{section.title}</p>
                      <p className="text-xs text-muted-foreground">Open popup details for {selectedSamples.length} selected sample(s).</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <Dialog open={Boolean(openSection)} onOpenChange={(open) => !open && setOpenSection(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl leading-snug break-words">
                {sections.find((section) => section.key === openSection)?.title ?? "Screening Details"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Showing {selectedSamples.length} selected sample{selectedSamples.length === 1 ? "" : "s"}.
              </p>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-3 max-h-[65vh] overflow-auto pr-1">
              {selectedSamples.map((sample) => (
                <div key={`${sample.id}-${openSection}`} className="rounded-lg border border-border/40 p-3 bg-secondary/20 min-w-0">
                  <p className="text-sm font-semibold break-all mb-1">{sample.imageName}</p>
                  <p className="text-sm text-muted-foreground">{sectionRows(openSection ?? "overview", sample)}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Screening;
