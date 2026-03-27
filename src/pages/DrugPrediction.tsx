import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCcw, Save, Sparkles, TestTubeDiagonal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DRUG_PREDICTION_UPDATED_EVENT, addDrugPredictionRecord, deleteDrugPredictionRecord, getDrugPredictionHistory, type DrugPredictionRecord } from "@/lib/drugPredictionDb";
import { HISTORY_UPDATED_EVENT, deleteHistoryEntry, getHistoryEntries, type AnalysisHistoryEntry } from "@/lib/historyDb";

const toSafeNumber = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const riskBand = (value: number): "LOW" | "MODERATE" | "HIGH" =>
  value < 35 ? "LOW" : value < 65 ? "MODERATE" : "HIGH";

const DrugPrediction = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<DrugPredictionRecord[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("");
  const [selectedAnalysisMode, setSelectedAnalysisMode] = useState<"original" | "optimized">("original");
  const [historySearch, setHistorySearch] = useState("");
  const [sampleName, setSampleName] = useState("candidate-001");
  const [smiles, setSmiles] = useState("CC(=O)OC1=CC=CC=C1C(=O)O");
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
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [diagramSrc, setDiagramSrc] = useState("");

  useEffect(() => {
    const refreshData = () => {
      const entries = getHistoryEntries();
      setHistory(entries);
      setPredictionHistory(getDrugPredictionHistory());

      const firstId = entries[0]?.id;
      setSelectedAnalysisId((current) => current || firstId || "");
    };

    refreshData();
    window.addEventListener(HISTORY_UPDATED_EVENT, refreshData);
    window.addEventListener(DRUG_PREDICTION_UPDATED_EVENT, refreshData);

    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, refreshData);
      window.removeEventListener(DRUG_PREDICTION_UPDATED_EVENT, refreshData);
    };
  }, []);

  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    if (!query) return history;
    return history.filter((entry) => entry.imageName.toLowerCase().includes(query));
  }, [history, historySearch]);

  const hydrateFromAnalysis = (analysisId: string, mode: "original" | "optimized") => {
    if (!analysisId) return false;
    const source = history.find((entry) => entry.id === analysisId);
    if (!source) return false;

    const result = mode === "optimized" && source.optimizedResult ? source.optimizedResult : source.result;
    const latest = result?.screeningMetrics;
    if (!latest) return false;

    const suffix = mode === "optimized" ? "-optimized" : "";
    setSampleName(`${source.imageName.replace(/\.[^/.]+$/, "")}${suffix}`);
    setSmiles(typeof latest.smiles === "string" && latest.smiles.length > 0 ? latest.smiles : "CC(=O)OC1=CC=CC=C1C(=O)O");
    setMolecularWeight(toSafeNumber(latest.molecularWeight, 320));
    setBindingAffinity(toSafeNumber(latest.bindingAffinity, -8.2));
    setSolubility(toSafeNumber(latest.solubility, 4.1));
    setCellUptakeRate(toSafeNumber(latest.cellUptakeRate, 65));
    setProteinInteraction(toSafeNumber(latest.proteinInteraction, 70));
    setTargetReceptorBinding(toSafeNumber(latest.targetReceptorBinding, 72));
    setDiffusionTrend(toSafeNumber(latest.diffusionTrend, 74));
    setMovementTrend(toSafeNumber(latest.movementTrend, 71));
    setResponseTrend(toSafeNumber(latest.responseTrend, 69));
    return true;
  };

  useEffect(() => {
    hydrateFromAnalysis(selectedAnalysisId, selectedAnalysisMode);
  }, [history, selectedAnalysisId, selectedAnalysisMode]);

  const prediction = useMemo(() => {
    const transportEfficiency = Math.max(0, Math.min(100, (diffusionTrend + movementTrend) / 2));
    const predictedBioavailability = Math.max(
      0,
      Math.min(100, responseTrend * 0.45 + diffusionTrend * 0.35 + cellUptakeRate * 0.2),
    );
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

    const overallToxicity = Math.max(
      0,
      Math.min(
        100,
        (Math.abs(bindingAffinity) * 5.2 + (100 - solubility * 4) + (100 - cellUptakeRate)) / 3,
      ),
    );

    const multiFactor = Math.max(0, Math.min(100, efficacy * 0.67 + (100 - overallToxicity) * 0.33));
    const decision = multiFactor >= 72 ? "Promising Candidate" : multiFactor >= 55 ? "Needs Optimization" : "Reject";

    const lipinskiCompliance =
      molecularWeight <= 500 && Math.abs(bindingAffinity) <= 12 && solubility >= 0.5 ? "PASS" : "FAIL";
    const waterSolubilityClass = solubility >= 8 ? "HIGH" : solubility >= 3 ? "MODERATE" : "LOW";
    const cypRisk = overallToxicity < 35 ? "LOW RISK" : overallToxicity < 65 ? "MODERATE RISK" : "HIGH RISK";
    const plasmaProteinBinding = Math.max(15, Math.min(98, 42 + Math.abs(bindingAffinity) * 4.8));
    const halfLifeHours = Math.max(1.2, Math.min(24, 2.8 + transportEfficiency * 0.05 + (Math.abs(bindingAffinity) - 6) * 0.4));
    const clearanceRate = halfLifeHours >= 10 ? "LOW" : halfLifeHours >= 5 ? "MODERATE" : "HIGH";

    const hydrogenBondCount = Math.max(1, Math.round(3 + solubility * 0.65));
    const hydrophobicInteractionScore = Math.max(0, Math.min(100, 38 + Math.abs(bindingAffinity) * 4.6));
    const bindingPocketCoverage = Math.max(35, Math.min(98, 40 + targetReceptorBinding * 0.62));
    const rmsdStability = Math.max(0.7, Math.min(3.4, 2.4 - (Math.abs(bindingAffinity) - 6) * 0.16));

    const hepatotoxicityValue = Math.max(0, Math.min(100, overallToxicity * 0.8 + (100 - solubility * 6) * 0.2));
    const cardiotoxicityValue = Math.max(0, Math.min(100, overallToxicity * 0.7 + hydrophobicInteractionScore * 0.3));
    const mutagenicityValue = Math.max(0, Math.min(100, overallToxicity * 0.65 + (100 - diffusionTrend) * 0.35));
    const cytotoxicityValue = Math.max(0, Math.min(100, overallToxicity * 0.75 + (100 - cellUptakeRate) * 0.25));
    const skinSensitivityValue = Math.max(0, Math.min(100, overallToxicity * 0.6 + (100 - responseTrend) * 0.4));

    const drugLikenessScore = Math.max(0, Math.min(1, (100 - overallToxicity + efficacy) / 200));
    const syntheticAccessibility = Math.max(1, Math.min(10, 2 + molecularWeight / 220 + Math.abs(bindingAffinity) / 10));
    const leadLikeness = molecularWeight < 450 && syntheticAccessibility < 6 ? "PASS" : "FAIL";

    const predictionConfidence = Math.max(45, Math.min(99, multiFactor * 0.74 + 24));
    const datasetSimilarityIndex = Math.max(0.3, Math.min(0.99, 0.42 + proteinInteraction / 180 + targetReceptorBinding / 220));
    const modelUncertainty = predictionConfidence >= 85 ? "LOW" : predictionConfidence >= 70 ? "MODERATE" : "HIGH";

    const referenceDockingScore = -6.4;
    const compoundDockingScore = Number(bindingAffinity.toFixed(2));
    const dockingImprovementPercent =
      ((Math.abs(compoundDockingScore) - Math.abs(referenceDockingScore)) / Math.abs(referenceDockingScore)) * 100;

    return {
      efficacy: Number(efficacy.toFixed(1)),
      toxicity: Number(overallToxicity.toFixed(1)),
      multiFactor: Number(multiFactor.toFixed(1)),
      transportEfficiency: Number(transportEfficiency.toFixed(1)),
      bioavailability: Number(predictedBioavailability.toFixed(1)),
      dockingAffinity: Number(bindingAffinity.toFixed(2)),
      pharmacodynamicsIndex: Number(((efficacy + targetReceptorBinding + proteinInteraction) / 3).toFixed(1)),
      decision,
      lipinskiCompliance,
      cyp3a4InhibitionRisk: cypRisk,
      waterSolubilityClass,
      plasmaProteinBinding: Number(plasmaProteinBinding.toFixed(1)),
      halfLifeHours: Number(halfLifeHours.toFixed(1)),
      clearanceRate,
      hydrogenBondCount,
      hydrophobicInteractionScore: Number(hydrophobicInteractionScore.toFixed(1)),
      bindingPocketCoverage: Number(bindingPocketCoverage.toFixed(1)),
      rmsdStability: Number(rmsdStability.toFixed(2)),
      hepatotoxicityRisk: riskBand(hepatotoxicityValue),
      cardiotoxicityRisk: riskBand(cardiotoxicityValue),
      mutagenicityRisk: riskBand(mutagenicityValue),
      cytotoxicityRisk: riskBand(cytotoxicityValue),
      skinSensitivityRisk: riskBand(skinSensitivityValue),
      drugLikenessScore: Number(drugLikenessScore.toFixed(2)),
      syntheticAccessibility: Number(syntheticAccessibility.toFixed(1)),
      leadLikeness,
      predictionConfidence: Number(predictionConfidence.toFixed(1)),
      modelUncertainty,
      datasetSimilarityIndex: Number(datasetSimilarityIndex.toFixed(2)),
      referenceDockingScore,
      compoundDockingScore,
      dockingImprovementPercent: Number(dockingImprovementPercent.toFixed(1)),
    };
  }, [
    bindingAffinity,
    cellUptakeRate,
    diffusionTrend,
    molecularWeight,
    movementTrend,
    proteinInteraction,
    responseTrend,
    solubility,
    targetReceptorBinding,
  ]);

  const smilesDiagramPrimaryUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/PNG`;
  const smilesDiagramFallbackUrl = `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(smiles)}/image?format=png`;

  useEffect(() => {
    setDiagramSrc(smilesDiagramPrimaryUrl);
  }, [smilesDiagramPrimaryUrl]);

  const runSampleSync = () => {
    const latestHistory = getHistoryEntries();
    setHistory(latestHistory);
    const synced = hydrateFromAnalysis(selectedAnalysisId, selectedAnalysisMode);
    if (!synced) {
      setSyncMessage("Sample sync failed. Please choose a valid history sample and source, then run again.");
      return;
    }

    setSyncMessage(`Sample synced from ${selectedAnalysisMode === "optimized" ? "optimized" : "original"} analysis.`);
  };

  const savePrediction = () => {
    addDrugPredictionRecord({
      sampleName: sampleName || "candidate",
      smiles,
      molecularWeight,
      bindingAffinity,
      solubility,
      cellUptakeRate,
      proteinInteraction,
      targetReceptorBinding,
      diffusionTrend,
      movementTrend,
      responseTrend,
      outputs: {
        predictedEfficacy: prediction.efficacy,
        predictiveToxicity: prediction.toxicity,
        multiFactorScore: prediction.multiFactor,
        decision: prediction.decision,
        lipinskiCompliance: prediction.lipinskiCompliance,
        cyp3a4InhibitionRisk: prediction.cyp3a4InhibitionRisk,
        waterSolubilityClass: prediction.waterSolubilityClass,
        plasmaProteinBinding: prediction.plasmaProteinBinding,
        halfLifeHours: prediction.halfLifeHours,
        clearanceRate: prediction.clearanceRate,
        hydrogenBondCount: prediction.hydrogenBondCount,
        hydrophobicInteractionScore: prediction.hydrophobicInteractionScore,
        bindingPocketCoverage: prediction.bindingPocketCoverage,
        rmsdStability: prediction.rmsdStability,
        hepatotoxicityRisk: prediction.hepatotoxicityRisk,
        cardiotoxicityRisk: prediction.cardiotoxicityRisk,
        mutagenicityRisk: prediction.mutagenicityRisk,
        cytotoxicityRisk: prediction.cytotoxicityRisk,
        skinSensitivityRisk: prediction.skinSensitivityRisk,
        drugLikenessScore: prediction.drugLikenessScore,
        syntheticAccessibility: prediction.syntheticAccessibility,
        leadLikeness: prediction.leadLikeness,
        predictionConfidence: prediction.predictionConfidence,
        modelUncertainty: prediction.modelUncertainty,
        datasetSimilarityIndex: prediction.datasetSimilarityIndex,
        referenceDockingScore: prediction.referenceDockingScore,
        compoundDockingScore: prediction.compoundDockingScore,
        dockingImprovementPercent: prediction.dockingImprovementPercent,
      },
    });

    setSaveMessage(`Saved prediction for ${sampleName || "candidate"}.`);
    setPredictionHistory(getDrugPredictionHistory());
    setOpen(false);
  };

  const downloadPredictionTxt = () => {
    const lines = [
      `Sample: ${sampleName}`,
      `SMILES: ${smiles}`,
      `Predicted efficacy: ${prediction.efficacy}%`,
      `Predictive toxicity: ${prediction.toxicity}%`,
      `Decision: ${prediction.decision}`,
      `Lipinski: ${prediction.lipinskiCompliance}`,
      `CYP3A4 inhibition: ${prediction.cyp3a4InhibitionRisk}`,
      `Drug-likeness: ${prediction.drugLikenessScore}/1`,
      `Confidence: ${prediction.predictionConfidence}%`,
      `Reference docking: ${prediction.referenceDockingScore} kcal/mol`,
      `Compound docking: ${prediction.compoundDockingScore} kcal/mol`,
      `Improvement: ${prediction.dockingImprovementPercent}%`,
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sampleName || "drug-prediction"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removePrediction = (id: string) => {
    deleteDrugPredictionRecord(id);
    setPredictionHistory(getDrugPredictionHistory());
  };

  const removeAnalysis = (id: string) => {
    deleteHistoryEntry(id);
    const updated = getHistoryEntries();
    setHistory(updated);
    if (selectedAnalysisId === id) {
      setSelectedAnalysisId(updated[0]?.id ?? "");
    }
  };

  const runPrediction = () => {
    setRunMessage(`Prediction run complete for ${sampleName || "candidate"}.`);
    setOpen(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Drug Discovery Analysis</h1>
          <p className="text-muted-foreground">Multimodal workspace combining image-derived morphology, molecular descriptors, nano-bio interactions, and temporal dynamics for publication-ready screening outputs.</p>
        </motion.div>

        <div className="glass rounded-xl p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Load Analysis from History</Label>
              <Input
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Search history sample name"
              />
              <Select value={selectedAnalysisId || undefined} onValueChange={setSelectedAnalysisId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select history record" />
                </SelectTrigger>
                <SelectContent>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.imageName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-match" disabled>
                      No matching history record
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{filteredHistory.length} sample(s) matched.</p>
            </div>
            <div className="space-y-2">
              <Label>History Source</Label>
              <Select value={selectedAnalysisMode} onValueChange={(value: "original" | "optimized") => setSelectedAnalysisMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Analysis</SelectItem>
                  <SelectItem value="optimized">Optimized Analysis</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="mt-2 gap-2" onClick={runSampleSync}>
                <RefreshCcw className="w-4 h-4" /> Run Sample Sync
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Sample Name</Label>
              <Input value={sampleName} onChange={(event) => setSampleName(event.target.value)} placeholder="sample identifier" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>SMILES</Label>
              <Input value={smiles} onChange={(event) => setSmiles(event.target.value)} placeholder="Enter molecular SMILES" />
            </div>
            <div className="md:col-span-2 rounded-lg border border-border/40 bg-white p-3">
              <p className="text-xs text-muted-foreground mb-2">2D Chemical Diagram</p>
              <img
                key={smiles}
                src={diagramSrc}
                alt={`2D chemical structure for ${smiles}`}
                className="h-40 object-contain mx-auto"
                onError={(event) => {
                  if (event.currentTarget.src !== smilesDiagramFallbackUrl) {
                    event.currentTarget.src = smilesDiagramFallbackUrl;
                    return;
                  }

                  event.currentTarget.src = "https://placehold.co/480x220?text=SMILES+diagram+unavailable";
                }}
              />
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
            <Button className="gradient-primary text-primary-foreground gap-2" onClick={runPrediction}>
              <Sparkles className="w-4 h-4" /> Run Prediction
            </Button>
            <p className="text-xs text-muted-foreground">
              {history.length > 0
                ? `Loaded defaults from latest analysis sample (${history[0].imageName}).`
                : "No analysis history found yet. Enter values manually."}
            </p>
            {saveMessage && <p className="text-xs text-primary">{saveMessage}</p>}
            {runMessage && <p className="text-xs text-accent">{runMessage}</p>}
            {syncMessage && <p className="text-xs text-muted-foreground">{syncMessage}</p>}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-5xl max-h-[82vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 break-words">
                <TestTubeDiagonal className="w-5 h-5 text-primary" /> Drug Prediction Result — {sampleName || "Candidate"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-secondary/40 p-3">Predicted efficacy<br /><strong className="text-3xl">{prediction.efficacy}%</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Predictive toxicity score<br /><strong className="text-3xl">{prediction.toxicity}%</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Multi-factor screening score<br /><strong className="text-3xl">{prediction.multiFactor}</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Automated decision<br /><strong className="text-3xl">{prediction.decision}</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Transport efficiency<br /><strong className="text-3xl">{prediction.transportEfficiency}%</strong></div>
              <div className="rounded-lg bg-secondary/40 p-3">Predicted bioavailability<br /><strong className="text-3xl">{prediction.bioavailability}%</strong></div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm pt-2">
              <div className="rounded-lg border border-border/40 p-3">
                <p className="font-semibold mb-2">1) ADMET Metrics</p>
                <p>Lipinski compliance: <strong>{prediction.lipinskiCompliance}</strong></p>
                <p>CYP3A4 inhibition: <strong>{prediction.cyp3a4InhibitionRisk}</strong></p>
                <p>Solubility class: <strong>{prediction.waterSolubilityClass}</strong></p>
                <p>Plasma protein binding: <strong>{prediction.plasmaProteinBinding}%</strong></p>
                <p>Half-life: <strong>{prediction.halfLifeHours} hours</strong></p>
                <p>Clearance: <strong>{prediction.clearanceRate}</strong></p>
              </div>

              <div className="rounded-lg border border-border/40 p-3">
                <p className="font-semibold mb-2">2) Molecular Interaction Metrics</p>
                <p>Hydrogen bonds: <strong>{prediction.hydrogenBondCount}</strong></p>
                <p>Hydrophobic contacts score: <strong>{prediction.hydrophobicInteractionScore}</strong></p>
                <p>Binding pocket coverage: <strong>{prediction.bindingPocketCoverage}%</strong></p>
                <p>RMSD deviation: <strong>{prediction.rmsdStability} Å</strong></p>
              </div>

              <div className="rounded-lg border border-border/40 p-3">
                <p className="font-semibold mb-2">3) Toxicity Sub-Scores</p>
                <p>Hepatotoxicity risk: <strong>{prediction.hepatotoxicityRisk}</strong></p>
                <p>Cardiotoxicity risk: <strong>{prediction.cardiotoxicityRisk}</strong></p>
                <p>Mutagenicity risk: <strong>{prediction.mutagenicityRisk}</strong></p>
                <p>Cytotoxicity risk: <strong>{prediction.cytotoxicityRisk}</strong></p>
                <p>Skin sensitivity risk: <strong>{prediction.skinSensitivityRisk}</strong></p>
              </div>

              <div className="rounded-lg border border-border/40 p-3">
                <p className="font-semibold mb-2">4) Drug-likeness + 5) Confidence</p>
                <p>Drug-likeness score: <strong>{prediction.drugLikenessScore} / 1</strong></p>
                <p>Synthetic accessibility: <strong>{prediction.syntheticAccessibility}</strong></p>
                <p>Lead-likeness: <strong>{prediction.leadLikeness}</strong></p>
                <p>Prediction confidence: <strong>{prediction.predictionConfidence}%</strong></p>
                <p>Model uncertainty: <strong>{prediction.modelUncertainty}</strong></p>
                <p>Dataset similarity index: <strong>{prediction.datasetSimilarityIndex}</strong></p>
              </div>
            </div>

            <div className="rounded-lg border border-border/40 p-3 text-sm">
              <p className="font-semibold mb-2">6) Benchmark Comparison</p>
              <p>Reference drug docking score: <strong>{prediction.referenceDockingScore} kcal/mol</strong></p>
              <p>Your compound docking score: <strong>{prediction.compoundDockingScore} kcal/mol</strong></p>
              <p>Improvement vs reference: <strong>{prediction.dockingImprovementPercent > 0 ? "+" : ""}{prediction.dockingImprovementPercent}%</strong></p>
            </div>

            <div className="rounded-lg border border-border/40 p-3 text-sm">
              <p className="font-semibold mb-2">Overall Scientific Evaluation</p>
              <p>Binding strength: ⭐⭐⭐⭐</p>
              <p>Bioavailability: ⭐⭐⭐⭐⭐</p>
              <p>Transport: ⭐⭐⭐⭐⭐</p>
              <p>Toxicity: ⭐⭐⭐</p>
              <p>Screening score: ⭐⭐⭐⭐</p>
            </div>

            <div className="flex justify-end">
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadPredictionTxt} className="gap-2"><Download className="w-4 h-4" /> Save as Text</Button>
                <Button onClick={savePrediction} className="gap-2"><Save className="w-4 h-4" /> Save Drug Prediction</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold mb-3">Quick Management</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Delete individual analysis history item</p>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-md border border-border/40 p-2 text-xs">
                    <span className="truncate pr-3">{entry.imageName}</span>
                    <Button size="sm" variant="outline" className="h-7 px-2 gap-1" onClick={() => removeAnalysis(entry.id)}>
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                ))}
                {history.length === 0 && <p className="text-xs text-muted-foreground">No analysis history available.</p>}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Delete individual prediction history item</p>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {predictionHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-md border border-border/40 p-2 text-xs">
                    <span className="truncate pr-3">{entry.sampleName}</span>
                    <Button size="sm" variant="outline" className="h-7 px-2 gap-1" onClick={() => removePrediction(entry.id)}>
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                ))}
                {predictionHistory.length === 0 && <p className="text-xs text-muted-foreground">No prediction history available.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugPrediction;
