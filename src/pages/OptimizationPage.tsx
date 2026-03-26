import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHistoryEntries, type AnalysisHistoryEntry, updateHistoryEntry } from "@/lib/historyDb";
import { optimizeForLowerRisk } from "@/lib/optimizer";

const OptimizationPage = () => {
  const [entries, setEntries] = useState<AnalysisHistoryEntry[]>([]);

  const refresh = () => setEntries(getHistoryEntries());

  useEffect(() => {
    refresh();
  }, []);

  const optimizeOne = (id: string) => {
    updateHistoryEntry(id, (entry) => ({ ...entry, optimizedResult: optimizeForLowerRisk(entry.result) }));
    refresh();
  };

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-6">
      <h1 className="text-3xl font-bold mb-2">Optimization</h1>
      <p className="text-muted-foreground mb-6">History-linked optimization to reduce screening risk and improve final decision confidence.</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {entries.map((entry) => {
          const original = entry.result.screeningMetrics.riskScore;
          const optimized = entry.optimizedResult?.screeningMetrics.riskScore;
          return (
            <div key={entry.id} className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Link to={`/history/${entry.id}`} className="font-semibold hover:text-primary truncate">{entry.imageName}</Link>
                <Button size="sm" onClick={() => optimizeOne(entry.id)} className="gap-2">
                  <WandSparkles className="w-3.5 h-3.5" /> Optimize
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary/40 rounded-lg p-2">Original risk: <strong>{original.toFixed(1)}</strong></div>
                <div className="bg-secondary/40 rounded-lg p-2">Optimized risk: <strong>{optimized?.toFixed(1) ?? "-"}</strong></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OptimizationPage;
