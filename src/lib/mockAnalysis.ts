export interface AnalysisResult {
  nucleiCount: number;
  meanArea: number;
  stdArea: number;
  circularity: number;
  aggregationScore: number;
  diceScore: number;
  iouScore: number;
  densityPerUnit: number;
  stabilityScore: number;
  uniformityScore: number;
  interactionStrength: number;
  screeningDecision: "Promising Candidate" | "Needs Optimization" | "Low Performance";
  particleSizes: { size: string; count: number }[];
  densityData: { region: string; density: number }[];
  radarData: { metric: string; value: number; fullMark: number }[];
  screeningMetrics: {
    riskScore: number;
    multiFactorScore: number;
    areaComparisonScore: number;
    aggregationDetectionScore: number;
    psnr: number;
    ssim: number;
    structuralClarity: number;
    segmentationConfidence: number;
    membraneInteractionScore: number;
    cytotoxicityRisk: number;
    surfaceStability: number;
    zetaPotentialProxy: number;
    diffusionCoefficient: number;
    transportEfficiency: number;
    bioavailabilityPrediction: number;
    structuralConsistency: number;
    clusterFormation: number;
    densityVariation: number;
    particleOverlap: number;
    stabilityRisk: number;
    featureVectorIntegration: number;
    weightedScore: number;
    thresholdGap: number;
    finalScreeningScore: number;
    modelHeadRisk: number;
  };
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function runMockAnalysis(): AnalysisResult {
  const nucleiCount = Math.floor(Math.random() * 120) + 30;
  const meanArea = parseFloat((Math.random() * 500 + 200).toFixed(1));
  const stdArea = parseFloat((Math.random() * 100 + 20).toFixed(1));
  const circularity = parseFloat((Math.random() * 0.4 + 0.6).toFixed(3));
  const aggregationScore = parseFloat((Math.random() * 0.6 + 0.1).toFixed(2));
  const diceScore = parseFloat((Math.random() * 0.15 + 0.82).toFixed(3));
  const iouScore = parseFloat((diceScore - Math.random() * 0.1).toFixed(3));
  const densityPerUnit = parseFloat((nucleiCount / (Math.random() * 5 + 8)).toFixed(1));
  const stabilityScore = parseFloat((Math.random() * 40 + 55).toFixed(1));
  const uniformityScore = parseFloat((Math.random() * 35 + 60).toFixed(1));
  const interactionStrength = parseFloat((Math.random() * 50 + 40).toFixed(1));

  const total = stabilityScore + uniformityScore + (100 - aggregationScore * 100) + interactionStrength;
  const screeningDecision: AnalysisResult["screeningDecision"] =
    total > 300 ? "Promising Candidate" : total > 220 ? "Needs Optimization" : "Low Performance";

  const particleSizes = [
    { size: "0-50", count: Math.floor(Math.random() * 20 + 5) },
    { size: "50-100", count: Math.floor(Math.random() * 40 + 15) },
    { size: "100-200", count: Math.floor(Math.random() * 30 + 20) },
    { size: "200-400", count: Math.floor(Math.random() * 25 + 10) },
    { size: "400-600", count: Math.floor(Math.random() * 15 + 3) },
    { size: "600+", count: Math.floor(Math.random() * 8 + 1) },
  ];

  const densityData = [
    { region: "Q1", density: Math.floor(Math.random() * 30 + 5) },
    { region: "Q2", density: Math.floor(Math.random() * 30 + 5) },
    { region: "Q3", density: Math.floor(Math.random() * 30 + 5) },
    { region: "Q4", density: Math.floor(Math.random() * 30 + 5) },
  ];

  const radarData = [
    { metric: "Stability", value: stabilityScore, fullMark: 100 },
    { metric: "Uniformity", value: uniformityScore, fullMark: 100 },
    { metric: "Low Aggr.", value: 100 - aggregationScore * 100, fullMark: 100 },
    { metric: "Interaction", value: interactionStrength, fullMark: 100 },
    { metric: "Circularity", value: circularity * 100, fullMark: 100 },
    { metric: "Density", value: Math.min(densityPerUnit * 5, 100), fullMark: 100 },
  ];

  const riskScore = clamp(100 - (stabilityScore * 0.35 + uniformityScore * 0.25 + interactionStrength * 0.2 + (100 - aggregationScore * 100) * 0.2));
  const multiFactorScore = clamp(stabilityScore * 0.4 + uniformityScore * 0.3 + interactionStrength * 0.3);
  const areaComparisonScore = clamp(100 - stdArea * 0.7);
  const aggregationDetectionScore = clamp(aggregationScore * 100);
  const psnr = parseFloat((22 + Math.random() * 15).toFixed(2));
  const ssim = parseFloat((0.75 + Math.random() * 0.23).toFixed(3));
  const structuralClarity = clamp((psnr - 20) * 5);
  const segmentationConfidence = clamp((diceScore * 100 + iouScore * 100) / 2);
  const membraneInteractionScore = clamp(interactionStrength);
  const cytotoxicityRisk = clamp(aggregationScore * 90 + (1 - circularity) * 25);
  const surfaceStability = clamp(stabilityScore - aggregationScore * 15);
  const zetaPotentialProxy = parseFloat((-35 + Math.random() * 45).toFixed(1));
  const diffusionCoefficient = parseFloat((0.15 + Math.random() * 0.9).toFixed(3));
  const transportEfficiency = clamp(uniformityScore * 0.6 + stabilityScore * 0.4);
  const bioavailabilityPrediction = clamp(transportEfficiency * 0.65 + interactionStrength * 0.35);
  const structuralConsistency = clamp(100 - stdArea * 0.5 + circularity * 15);
  const clusterFormation = clamp(aggregationScore * 100);
  const densityVariation = clamp(Math.abs(densityData[0].density - densityData[2].density) * 2.1);
  const particleOverlap = clamp(aggregationScore * 80 + (100 - circularity * 100) * 0.25);
  const stabilityRisk = clamp((100 - stabilityScore) * 0.6 + clusterFormation * 0.4);
  const featureVectorIntegration = clamp((segmentationConfidence + membraneInteractionScore + bioavailabilityPrediction) / 3);
  const weightedScore = clamp(featureVectorIntegration * 0.45 + (100 - riskScore) * 0.55);
  const thresholdGap = parseFloat((weightedScore - 62).toFixed(2));
  const finalScreeningScore = clamp(weightedScore - riskScore * 0.2);
  const modelHeadRisk = clamp(100 / (1 + Math.exp(-(riskScore - 45) / 8)));

  return {
    nucleiCount,
    meanArea,
    stdArea,
    circularity,
    aggregationScore,
    diceScore,
    iouScore,
    densityPerUnit,
    stabilityScore,
    uniformityScore,
    interactionStrength,
    screeningDecision,
    particleSizes,
    densityData,
    radarData,
    screeningMetrics: {
      riskScore,
      multiFactorScore,
      areaComparisonScore,
      aggregationDetectionScore,
      psnr,
      ssim,
      structuralClarity,
      segmentationConfidence,
      membraneInteractionScore,
      cytotoxicityRisk,
      surfaceStability,
      zetaPotentialProxy,
      diffusionCoefficient,
      transportEfficiency,
      bioavailabilityPrediction,
      structuralConsistency,
      clusterFormation,
      densityVariation,
      particleOverlap,
      stabilityRisk,
      featureVectorIntegration,
      weightedScore,
      thresholdGap,
      finalScreeningScore,
      modelHeadRisk,
    },
  };
}
