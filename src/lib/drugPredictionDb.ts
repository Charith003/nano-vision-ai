export interface DrugPredictionRecord {
  id: string;
  createdAt: string;
  sampleName: string;
  smiles: string;
  molecularWeight: number;
  bindingAffinity: number;
  solubility: number;
  cellUptakeRate: number;
  proteinInteraction: number;
  targetReceptorBinding: number;
  diffusionTrend: number;
  movementTrend: number;
  responseTrend: number;
  outputs: {
    predictedEfficacy: number;
    predictiveToxicity: number;
    multiFactorScore: number;
    decision: string;
    lipinskiCompliance: "PASS" | "FAIL";
    cyp3a4InhibitionRisk: "LOW RISK" | "MODERATE RISK" | "HIGH RISK";
    waterSolubilityClass: "LOW" | "MODERATE" | "HIGH";
    plasmaProteinBinding: number;
    halfLifeHours: number;
    clearanceRate: "LOW" | "MODERATE" | "HIGH";
    hydrogenBondCount: number;
    hydrophobicInteractionScore: number;
    bindingPocketCoverage: number;
    rmsdStability: number;
    hepatotoxicityRisk: "LOW" | "MODERATE" | "HIGH";
    cardiotoxicityRisk: "LOW" | "MODERATE" | "HIGH";
    mutagenicityRisk: "LOW" | "MODERATE" | "HIGH";
    cytotoxicityRisk: "LOW" | "MODERATE" | "HIGH";
    skinSensitivityRisk: "LOW" | "MODERATE" | "HIGH";
    drugLikenessScore: number;
    syntheticAccessibility: number;
    leadLikeness: "PASS" | "FAIL";
    predictionConfidence: number;
    modelUncertainty: "LOW" | "MODERATE" | "HIGH";
    datasetSimilarityIndex: number;
    referenceDockingScore: number;
    compoundDockingScore: number;
    dockingImprovementPercent: number;
  };
}

const STORAGE_KEY = "nano-vision-drug-prediction-history-v1";
const DRUG_PREDICTION_UPDATED_EVENT = "nano-drug-prediction-updated";

function notifyDrugPredictionUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DRUG_PREDICTION_UPDATED_EVENT));
  }
}

export function getDrugPredictionHistory(): DrugPredictionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DrugPredictionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDrugPredictionHistory(entries: DrugPredictionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addDrugPredictionRecord(entry: Omit<DrugPredictionRecord, "id" | "createdAt">): DrugPredictionRecord {
  const next: DrugPredictionRecord = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const existing = getDrugPredictionHistory();
  const updated = [next, ...existing].slice(0, 100);
  saveDrugPredictionHistory(updated);
  notifyDrugPredictionUpdated();
  return next;
}

export function clearDrugPredictionHistory() {
  localStorage.removeItem(STORAGE_KEY);
  notifyDrugPredictionUpdated();
}

export function deleteDrugPredictionRecord(id: string): boolean {
  const entries = getDrugPredictionHistory();
  const filtered = entries.filter((entry) => entry.id !== id);
  if (filtered.length === entries.length) return false;
  saveDrugPredictionHistory(filtered);
  notifyDrugPredictionUpdated();
  return true;
}

export { DRUG_PREDICTION_UPDATED_EVENT };
