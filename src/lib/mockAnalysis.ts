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
}

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

  return {
    nucleiCount, meanArea, stdArea, circularity, aggregationScore,
    diceScore, iouScore, densityPerUnit, stabilityScore, uniformityScore,
    interactionStrength, screeningDecision, particleSizes, densityData, radarData,
  };
}
