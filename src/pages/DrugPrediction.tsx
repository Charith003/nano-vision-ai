import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Sparkles, TestTubeDiagonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getHistoryEntries, type AnalysisHistoryEntry } from "@/lib/historyDb";

const DrugPrediction = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [smiles, setSmiles] = useState("");
  const [molecularWeight, setMolecularWeight] = useState(320);
  const [bindingAffinity, setBindingAffinity] = useState(-8.2);
  const [solubility, setSolubility] = useState(4.1);
  const [cellUptakeRate, setCellUptakeRate] = useState(65);
  const [proteinInteraction, setProteinInteraction] = useState(70);
  const [targetReceptorBinding, setTargetReceptorBinding] = useState(72);
  const [diffusionTrend, setDiffusionTrend] = useState(74);
  const [movementTrend, setMovementTrend] = useState(71);
  const [responseTrend, setResponseTrend] = useState(69);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const entries = getHistoryEntries();
    setHistory(entries);

    const latest = entries[0]?.result.screeningMetrics;
    if (!latest) return;

    setSmiles(latest.smiles);
    setMolecularWeight(latest.molecularWeight);
    setBindingAffinity(latest.bindingAffinity);
    setSolubility(latest.solubility);
    setCellUptakeRate(latest.cellUptakeRate);
    setProteinInteraction(latest.proteinInteraction);
    setTargetReceptorBinding(latest.targetReceptorBinding);
    setDiffusionTrend(latest.diffusionTrend);
    setMovementTrend(latest.movementTrend);
    setResponseTrend(latest.responseTrend);
  }, []);

  const prediction = useMemo(() => {
    const efficacy = Math.max(
      0,
      Math.min(
        100,
        targetReceptorBinding * 0.24 +
          proteinInteraction * 0.2 +
          cellUptakeRate * 0.18 +
          diffusionTrend * 0.14 +
          movementTrend * 0.12 +
          responseTrend * 0.12,
      ),
    );

    const toxicity = Math.max(
      0,
      Math.min(
        100,
        (Math.abs(bindingAffinity) * 5.2 + (100 - solubility * 4) + (100 - cellUptakeRate)) / 3,
      ),
    );

    const multiFactor = Math.max(0, Math.min(100, efficacy * 0.67 + (100 - toxicity) * 0.33));

    const decision = multiFactor >= 72 ? "Promising Candidate" : multiFactor >= 55 ? "Needs Optimization" : "Reject";

    return {
      efficacy: Number(efficacy.toFixed(1)),
      toxicity: Number(toxicity.toFixed(1)),
      multiFactor: Number(multiFactor.toFixed(1)),
      transportEfficiency: Number(((diffusionTrend + movementTrend) / 2).toFixed(1)),
      bioavailability: Number(((responseTrend * 0.45 + diffusionTrend * 0.35 + cellUptakeRate * 0.2)).toFixed(1)),
      dockingAffinity: Number(bindingAffinity.toFixed(2)),
      pharmacodynamicsIndex: Number(((efficacy + targetReceptorBinding + proteinInteraction) / 3).toFixed(1)),
      decision,
    };
  }, [bindingAffinity, cellUptakeRate, diffusionTrend, movementTrend, proteinInteraction, responseTrend, solubility, targetReceptorBinding]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Drug Prediction</h1>
          <p className="text-muted-foreground">Multimodal nanomedicine discovery workspace: image-derived morphology + molecular descriptors + nano-bio interaction + dynamics.</p>
        </motion.div>

        <div className="glass rounded-xl p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMILES</Label>
              <Input value={smiles} onChange={(event) => setSmiles(event.target.value)} placeholder="Enter molecular SMILES" />
            </div>
            <div className="space-y-2">
              <Label>Molecular Weight (Da)</Label>
              <Input type="number" value={molecularWeight} onChange={(event) => setMolecularWeight(Number(event.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Binding Affinity (kcal/mol)</Label>
              <Input type="number" value={bindingAffinity} onChange={(event) => setBindingAffinity(Number(event.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Solubility (mg/mL)</Label>
              <Input type="number" value={solubility} onChange={(event) => setSolubility(Number(event.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Cell Uptake Rate (%)</Label>
              <Input type="number" value={cellUptakeRate} onChange={(event) => setCellUptakeRate(Number(event.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Protein Interaction Score</Label>
              <Input type="number" value={proteinInteraction} onChange={(event) => setProteinInteraction(Number(event.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Target Receptor Binding (%)</Label>
              <Input type="number" value={targetReceptorBinding} onChange={(event) => setTargetReceptorBinding(Number(event.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Diffusion Trend (T5)</Label>
              <Input type="number" value={diffusionTrend} onChange={(event) => setDiffusionTrend(Number(event.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Particle Movement (T5)</Label>
              <Input type="number" value={movementTrend} onChange={(event) => setMovementTrend(Number(event.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Cell Response Evolution (T5)</Label>
              <Input type="number" value={responseTrend} onChange={(event) => setResponseTrend(Number(event.target.value) || 0)} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button className="gradient-primary text-primary-foreground gap-2" onClick={() => setOpen(true)}>
              <Sparkles className="w-4 h-4" /> Generate Drug Prediction Output
            </Button>
            <p className="text-xs text-muted-foreground">
              {history.length > 0
                ? `Loaded defaults from latest history sample (${history[0].imageName}).`
                : "No analysis history found yet. Enter values manually."}
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><TestTubeDiagonal className="w-5 h-5 text-primary" /> Drug Prediction Result</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-secondary/40 p-3">Predicted efficacy<br /><strong className="text-3xl">{prediction.efficacy}%</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Predictive toxicity score<br /><strong className="text-3xl">{prediction.toxicity}%</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Multi-factor screening score<br /><strong className="text-3xl">{prediction.multiFactor}</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Automated decision<br /><strong className="text-3xl">{prediction.decision}</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Transport efficiency<br /><strong className="text-3xl">{prediction.transportEfficiency}%</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Predicted bioavailability<br /><strong className="text-3xl">{prediction.bioavailability}%</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Docking affinity<br /><strong className="text-3xl">{prediction.dockingAffinity} kcal/mol</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Pharmacodynamics index<br /><strong className="text-3xl">{prediction.pharmacodynamicsIndex}</strong></div>
            </div>
            <p className="text-xs text-muted-foreground">Claims this build supports now: morphology-based early screening and AI-assisted filtering; true efficacy validation still requires wet-lab and curated datasets (e.g., ChEMBL/PubChem + cell viability assays).</p>
          </DialogContent>
        </Dialog>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4">
            <p className="font-semibold mb-1">Level 1–2</p>
            <p className="text-sm text-muted-foreground">Image reconstruction, morphology extraction, segmentation, and structured morphology labels.</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="font-semibold mb-1">Level 3</p>
            <p className="text-sm text-muted-foreground">Biological labels + toxicity prediction from nano-bio interaction features and time-series evolution.</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="font-semibold mb-1">Level 4</p>
            <p className="text-sm text-muted-foreground">Full multimodal fusion with molecular docking, efficacy prediction, and ranking-ready drug discovery decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugPrediction;
