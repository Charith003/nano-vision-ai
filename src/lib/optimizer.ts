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

  optimized.screeningDecision =
    m.finalScreeningScore >= 80 ? "Promising Candidate" : m.finalScreeningScore >= 62 ? "Needs Optimization" : "Low Performance";

  return optimized;
}
