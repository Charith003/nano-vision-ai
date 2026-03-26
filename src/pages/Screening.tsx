import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { getHistoryEntries, type AnalysisHistoryEntry } from "@/lib/historyDb";

const Screening = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const entries = getHistoryEntries();
    setHistory(entries);
    setSelectedIds(entries.slice(0, 3).map((entry) => entry.id));
  }, []);

  const selectedSamples = useMemo(
    () => history.filter((entry) => selectedIds.includes(entry.id)).slice(0, 3),
    [history, selectedIds],
  );

  const comparisonData = selectedSamples.map((sample) => ({
    id: sample.imageName.slice(0, 16),
    risk: sample.result.screeningMetrics.riskScore,
    final: sample.result.screeningMetrics.finalScreeningScore,
    psnr: sample.result.screeningMetrics.psnr,
  }));

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return [...prev, id].slice(0, 3);
      return prev.filter((item) => item !== id);
    });
  };

  const metricCard = (label: string, getter: (entry: AnalysisHistoryEntry) => string) => (
    <div className="grid md:grid-cols-3 gap-3 mt-3">
      {selectedSamples.map((sample) => (
        <div key={`${sample.id}-${label}`} className="rounded-lg bg-secondary/50 p-3 border border-border/40">
          <p className="text-[11px] text-muted-foreground truncate">{sample.imageName}</p>
          <p className="text-lg font-mono font-bold">{getter(sample)}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Drug Screening Dashboard</h1>
          <p className="text-muted-foreground">Select history samples and compare model-driven screening features.</p>
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
              <h3 className="font-semibold mb-4">Select up to 3 samples from history</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {history.map((entry) => (
                  <label key={entry.id} className="flex items-start gap-2 rounded-lg border border-border/40 p-3 cursor-pointer bg-secondary/20">
                    <Checkbox
                      checked={selectedIds.includes(entry.id)}
                      onCheckedChange={(checked) => toggleSelection(entry.id, Boolean(checked))}
                    />
                    <span className="text-sm">
                      <span className="font-medium block truncate">{entry.imageName}</span>
                      <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {selectedSamples.length > 0 && (
              <div className="space-y-5">
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">10) Screening Output Visualization</h3>
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

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">1️⃣ Screening Module Overview</h3>
                  {metricCard("overview", (s) => `${s.result.screeningMetrics.riskScore.toFixed(1)} risk | ${s.result.screeningDecision}`)}
                </section>

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">2️⃣ Morphology-Based Screening</h3>
                  {metricCard("morphology", (s) => `${s.result.nucleiCount} particles · ${s.result.meanArea.toFixed(1)} area · ${s.result.circularity.toFixed(2)} circ`)}
                </section>

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">3️⃣ Reconstruction Quality Assessment</h3>
                  {metricCard("recon", (s) => `PSNR ${s.result.screeningMetrics.psnr.toFixed(2)} · SSIM ${s.result.screeningMetrics.ssim.toFixed(3)} · Conf ${s.result.screeningMetrics.segmentationConfidence.toFixed(1)}`)}
                </section>

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">4️⃣ Nano–Bio Interaction Indicators</h3>
                  {metricCard("interaction", (s) => `Mem ${s.result.screeningMetrics.membraneInteractionScore.toFixed(1)} · Cyto ${s.result.screeningMetrics.cytotoxicityRisk.toFixed(1)} · Zeta ${s.result.screeningMetrics.zetaPotentialProxy.toFixed(1)}`)}
                </section>

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">5️⃣ Formulation Stability Evaluation</h3>
                  {metricCard("formulation", (s) => `Diff ${s.result.screeningMetrics.diffusionCoefficient.toFixed(3)} · Transport ${s.result.screeningMetrics.transportEfficiency.toFixed(1)} · Bio ${s.result.screeningMetrics.bioavailabilityPrediction.toFixed(1)}`)}
                </section>

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">6️⃣ Aggregation Behavior Analysis</h3>
                  {metricCard("aggregation", (s) => `Cluster ${s.result.screeningMetrics.clusterFormation.toFixed(1)} · Density Δ ${s.result.screeningMetrics.densityVariation.toFixed(1)} · Overlap ${s.result.screeningMetrics.particleOverlap.toFixed(1)}`)}
                </section>

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">7️⃣ Multi-Factor Risk Score Calculation</h3>
                  {metricCard("risk", (s) => `Vector ${s.result.screeningMetrics.featureVectorIntegration.toFixed(1)} · Weighted ${s.result.screeningMetrics.weightedScore.toFixed(1)} · Gap ${s.result.screeningMetrics.thresholdGap.toFixed(1)}`)}
                </section>

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">8️⃣ Screening Decision Classification</h3>
                  {metricCard("decision", (s) => `${s.result.screeningDecision} · Stability Risk ${s.result.screeningMetrics.stabilityRisk.toFixed(1)}`)}
                </section>

                <section className="glass rounded-xl p-5">
                  <h3 className="font-semibold">9️⃣ Model-Based Screening Head (NanoVisionNet-X)</h3>
                  {metricCard("head", (s) => `Encoder proxy ${s.result.screeningMetrics.featureVectorIntegration.toFixed(1)} · Sigmoid risk ${s.result.screeningMetrics.modelHeadRisk.toFixed(1)}`)}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Screening;
