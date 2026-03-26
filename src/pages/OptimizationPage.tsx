import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WandSparkles } from "lucide-react";
import { getHistoryEntries, type AnalysisHistoryEntry } from "@/lib/historyDb";

const OptimizationPage = () => {
  const [entries, setEntries] = useState<AnalysisHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistoryEntries());
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-6">
      <h1 className="text-3xl font-bold mb-2">Optimization</h1>
      <p className="text-muted-foreground mb-6">Open any history sample and run optimization with process tracking, editable save name, and image download.</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {entries.map((entry) => (
          <div key={entry.id} className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold truncate">{entry.imageName}</span>
              <Link to={`/history/${entry.id}`} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-primary/15 hover:bg-primary/25 text-primary">
                <WandSparkles className="w-3.5 h-3.5" /> Open Optimizer
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-secondary/40 rounded-lg p-2">Original risk: <strong>{entry.result.screeningMetrics.riskScore.toFixed(1)}</strong></div>
              <div className="bg-secondary/40 rounded-lg p-2">Optimized risk: <strong>{entry.optimizedResult?.screeningMetrics.riskScore.toFixed(1) ?? "-"}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptimizationPage;
