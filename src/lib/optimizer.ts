import type { AnalysisResult } from "@/lib/mockAnalysis";

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function optimizeForLowerRisk(result: AnalysisResult): AnalysisResult {
  const optimized = structuredClone(result);

  optimized.aggregationScore = parseFloat(Math.max(0.05, result.aggregationScore * 0.72).toFixed(2));
  optimized.circularity = parseFloat(Math.min(0.99, result.circularity + 0.06).toFixed(3));
  optimized.stabilityScore = parseFloat(clamp(result.stabilityScore + 9).toFixed(1));
  optimized.uniformityScore = parseFloat(clamp(result.uniformityScore + 7).toFixed(1));
  optimized.interactionStrength = parseFloat(clamp(result.interactionStrength + 4).toFixed(1));

  const m = optimized.screeningMetrics;
  m.riskScore = parseFloat(clamp(result.screeningMetrics.riskScore * 0.72).toFixed(1));
  m.cytotoxicityRisk = parseFloat(clamp(result.screeningMetrics.cytotoxicityRisk * 0.8).toFixed(1));
  m.clusterFormation = parseFloat(clamp(result.screeningMetrics.clusterFormation * 0.7).toFixed(1));
  m.particleOverlap = parseFloat(clamp(result.screeningMetrics.particleOverlap * 0.75).toFixed(1));
  m.stabilityRisk = parseFloat(clamp(result.screeningMetrics.stabilityRisk * 0.72).toFixed(1));
  m.surfaceStability = parseFloat(clamp(result.screeningMetrics.surfaceStability + 7).toFixed(1));
  m.transportEfficiency = parseFloat(clamp(result.screeningMetrics.transportEfficiency + 8).toFixed(1));
  m.bioavailabilityPrediction = parseFloat(clamp(result.screeningMetrics.bioavailabilityPrediction + 7).toFixed(1));
  m.featureVectorIntegration = parseFloat(clamp(result.screeningMetrics.featureVectorIntegration + 6).toFixed(1));
  m.weightedScore = parseFloat(clamp(result.screeningMetrics.weightedScore + 6).toFixed(1));
  m.finalScreeningScore = parseFloat(clamp(result.screeningMetrics.finalScreeningScore + 11).toFixed(1));
  m.thresholdGap = parseFloat((m.weightedScore - 62).toFixed(2));
  m.modelHeadRisk = parseFloat(clamp(result.screeningMetrics.modelHeadRisk * 0.76).toFixed(1));
  m.cellUptakeRate = parseFloat(clamp(result.screeningMetrics.cellUptakeRate + 5).toFixed(1));
  m.proteinInteraction = parseFloat(clamp(result.screeningMetrics.proteinInteraction + 4).toFixed(1));
  m.targetReceptorBinding = parseFloat(clamp(result.screeningMetrics.targetReceptorBinding + 5).toFixed(1));
  m.formulationTransportScore = parseFloat(clamp(result.screeningMetrics.formulationTransportScore + 6).toFixed(1));
  m.predictedDrugEfficacy = parseFloat(clamp(result.screeningMetrics.predictedDrugEfficacy + 8).toFixed(1));
  m.predictiveToxicityScore = parseFloat(clamp(result.screeningMetrics.predictiveToxicityScore * 0.8).toFixed(1));
  m.multiCriteriaScreeningScore = parseFloat(clamp(result.screeningMetrics.multiCriteriaScreeningScore + 8).toFixed(1));
  m.synthesisYield = parseFloat(clamp(result.screeningMetrics.synthesisYield + 6).toFixed(1));
  m.pharmacodynamicsIndex = parseFloat(clamp(result.screeningMetrics.pharmacodynamicsIndex + 5).toFixed(1));
  m.automatedDecision =
    m.multiCriteriaScreeningScore >= 72 ? "Promising Candidate" : m.multiCriteriaScreeningScore >= 52 ? "Needs Optimization" : "Reject";
  m.toxicityLabel =
    m.predictiveToxicityScore < 35 ? "Low" : m.predictiveToxicityScore < 62 ? "Moderate" : "High";

  optimized.screeningDecision =
    m.finalScreeningScore >= 80 ? "Promising Candidate" : m.finalScreeningScore >= 62 ? "Needs Optimization" : "Low Performance";

  return optimized;
}

export async function createOptimizedImageData(imageData: string): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageData;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext("2d");
  if (!context) return imageData;

  context.filter = "contrast(1.08) saturate(1.05) brightness(1.02)";
  context.drawImage(image, 0, 0);

  return canvas.toDataURL("image/png");
}

export function downloadOptimizedImage(imageData: string, name: string) {
  const anchor = document.createElement("a");
  anchor.href = imageData;
  anchor.download = `${name || "optimized-sample"}.png`;
  anchor.click();
}
