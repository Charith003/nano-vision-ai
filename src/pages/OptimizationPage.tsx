import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WandSparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getHistoryEntries, HISTORY_UPDATED_EVENT, type AnalysisHistoryEntry } from "@/lib/historyDb";

const OptimizationPage = () => {
  const [entries, setEntries] = useState<AnalysisHistoryEntry[]>([]);
  const [search, setSearch] = useState("");

  const refresh = () => setEntries(getHistoryEntries());

  useEffect(() => {
    refresh();

    const onFocus = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onHistoryUpdated = () => refresh();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdated);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdated);
    };
  }, []);

  const filteredEntries = entries.filter((entry) =>
    entry.imageName.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-6">
      <h1 className="text-3xl font-bold mb-2">Optimization</h1>
      <p className="text-muted-foreground mb-6">Open any history sample and run optimization with process tracking, editable save name, and image download.</p>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search optimization sample"
        className="mb-4"
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {filteredEntries.map((entry) => (
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
            <p className="text-xs text-muted-foreground">Saved as: {entry.optimizedName ?? (entry.optimizedResult ? `${entry.imageName.replace(/\.[^/.]+$/, "")}-optimized` : "not saved")}</p>
            <p className="text-[11px] text-muted-foreground/70">Record time: {new Date(entry.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {filteredEntries.length === 0 && <p className="text-sm text-muted-foreground mt-4">No optimization sample matches your search.</p>}
    </div>
  );
};

export default OptimizationPage;
