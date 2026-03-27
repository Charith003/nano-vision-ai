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
  dynamicsData: { t: string; diffusion: number; movement: number; cellResponse: number }[];
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
    smiles: string;
    molecularWeight: number;
    bindingAffinity: number;
    solubility: number;
    cellUptakeRate: number;
    toxicityLabel: "Low" | "Moderate" | "High";
    proteinInteraction: number;
    targetReceptorBinding: number;
    diffusionTrend: number;
    movementTrend: number;
    responseTrend: number;
    formulationTransportScore: number;
    predictedDrugEfficacy: number;
    predictiveToxicityScore: number;
    multiCriteriaScreeningScore: number;
    dockingAffinity: number;
    synthesisYield: number;
    pharmacodynamicsIndex: number;
    automatedDecision: "Promising Candidate" | "Needs Optimization" | "Reject";
  };
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const mockCompounds = [
  { smiles: "CC(=O)OC1=CC=CC=C1C(=O)O", molecularWeight: 180.16, solubility: 3.2 }, // Aspirin
  { smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", molecularWeight: 206.28, solubility: 0.08 }, // Ibuprofen
  { smiles: "CC(=O)NC1=CC=C(O)C=C1", molecularWeight: 151.16, solubility: 14.0 }, // Paracetamol
  { smiles: "CN1CCC[C@H]1C2=CN=CC=C2", molecularWeight: 162.23, solubility: 10.5 }, // Nicotine
  { smiles: "C1=CC=C(C=C1)C=O", molecularWeight: 106.12, solubility: 6.7 }, // Benzaldehyde
] as const;

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

  const dynamicsData = ["T0", "T1", "T2", "T3", "T4", "T5"].map((t, i) => ({
    t,
    diffusion: parseFloat(clamp(42 + i * 8 + Math.random() * 10).toFixed(1)),
    movement: parseFloat(clamp(34 + i * 9 + Math.random() * 9).toFixed(1)),
    cellResponse: parseFloat(clamp(38 + i * 7 + Math.random() * 8).toFixed(1)),
  }));

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
  const selectedCompound = mockCompounds[Math.floor(Math.random() * mockCompounds.length)];
  const smiles = selectedCompound.smiles;
  const molecularWeight = parseFloat((selectedCompound.molecularWeight + (Math.random() * 6 - 3)).toFixed(2));
  const bindingAffinity = parseFloat((-5.2 - Math.random() * 6.4).toFixed(2));
  const solubility = parseFloat(clamp(selectedCompound.solubility + (Math.random() * 2.4 - 1.2), 0.02, 20).toFixed(2));
  const cellUptakeRate = parseFloat(clamp(45 + Math.random() * 45).toFixed(1));
  const toxicityLabel: AnalysisResult["screeningMetrics"]["toxicityLabel"] =
    cytotoxicityRisk < 35 ? "Low" : cytotoxicityRisk < 62 ? "Moderate" : "High";
  const proteinInteraction = parseFloat(clamp(interactionStrength + Math.random() * 10).toFixed(1));
  const targetReceptorBinding = parseFloat(clamp(55 + Math.random() * 35).toFixed(1));
  const latestDynamics = dynamicsData[dynamicsData.length - 1];
  const diffusionTrend = parseFloat((latestDynamics?.diffusion ?? 0).toFixed(1));
  const movementTrend = parseFloat((latestDynamics?.movement ?? 0).toFixed(1));
  const responseTrend = parseFloat((latestDynamics?.cellResponse ?? 0).toFixed(1));
  const formulationTransportScore = parseFloat(clamp((transportEfficiency + diffusionTrend) / 2).toFixed(1));
  const predictedDrugEfficacy = parseFloat(clamp((bioavailabilityPrediction * 0.35) + (targetReceptorBinding * 0.25) + (proteinInteraction * 0.2) + (100 - cytotoxicityRisk) * 0.2).toFixed(1));
  const predictiveToxicityScore = parseFloat(clamp(cytotoxicityRisk * 0.7 + modelHeadRisk * 0.3).toFixed(1));
  const multiCriteriaScreeningScore = parseFloat(clamp(predictedDrugEfficacy * 0.65 + (100 - predictiveToxicityScore) * 0.35).toFixed(1));
  const dockingAffinity = bindingAffinity;
  const synthesisYield = parseFloat(clamp(weightedScore + (Math.random() * 8 - 4)).toFixed(1));
  const pharmacodynamicsIndex = parseFloat(clamp((predictedDrugEfficacy + proteinInteraction + targetReceptorBinding) / 3).toFixed(1));
  const automatedDecision: AnalysisResult["screeningMetrics"]["automatedDecision"] =
    multiCriteriaScreeningScore >= 72 ? "Promising Candidate" : multiCriteriaScreeningScore >= 52 ? "Needs Optimization" : "Reject";

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
    dynamicsData,
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
      smiles,
      molecularWeight,
      bindingAffinity,
      solubility,
      cellUptakeRate,
      toxicityLabel,
      proteinInteraction,
      targetReceptorBinding,
      diffusionTrend,
      movementTrend,
      responseTrend,
      formulationTransportScore,
      predictedDrugEfficacy,
      predictiveToxicityScore,
      multiCriteriaScreeningScore,
      dockingAffinity,
      synthesisYield,
      pharmacodynamicsIndex,
      automatedDecision,
    },
  };
}
