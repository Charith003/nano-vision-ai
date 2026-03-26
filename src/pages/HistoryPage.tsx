import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearHistoryEntries, getHistoryEntries, type AnalysisHistoryEntry } from "@/lib/historyDb";

const HistoryPage = () => {
  const [entries, setEntries] = useState<AnalysisHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistoryEntries());
  }, []);

  const clearHistory = () => {
    clearHistoryEntries();
    setEntries([]);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
            <p className="text-muted-foreground">Stored image uploads with AI results.</p>
          </div>
          {entries.length > 0 && (
            <Button variant="outline" onClick={clearHistory} className="gap-2">
              <Trash2 className="w-4 h-4" /> Clear History
            </Button>
          )}
        </motion.div>

        {entries.length === 0 ? (
          <div className="glass rounded-xl flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-primary/40" />
              </div>
              <p className="text-muted-foreground mb-2">No analysis history yet</p>
              <p className="text-xs text-muted-foreground/60">Run analysis from the Analyze page to build your local database history.</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <article key={entry.id} className="glass rounded-xl p-4 space-y-3">
                <Link to={`/history/${entry.id}`}>
                  <img src={entry.imageData} alt={entry.imageName} className="w-full h-44 rounded-lg object-cover border border-border/40 hover:border-primary/50 transition-colors" />
                </Link>
                <div>
                  <p className="font-medium truncate">{entry.imageName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-secondary/50 p-2">
                    <span className="text-muted-foreground block">Decision</span>
                    <span className="font-semibold">{entry.result.screeningDecision}</span>
                  </div>
                  <div className="rounded-md bg-secondary/50 p-2">
                    <span className="text-muted-foreground block">Risk Score</span>
                    <span className="font-semibold">{entry.result.screeningMetrics.riskScore.toFixed(1)}</span>
                  </div>
                </div>
                {entry.optimizedResult && (
                  <div className="rounded-md bg-primary/10 border border-primary/30 p-2 text-xs">
                    Optimized risk: <span className="font-semibold">{entry.optimizedResult.screeningMetrics.riskScore.toFixed(1)}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
