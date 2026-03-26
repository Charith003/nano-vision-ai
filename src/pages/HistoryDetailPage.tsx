import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHistoryEntryById, updateHistoryEntry } from "@/lib/historyDb";
import { optimizeForLowerRisk } from "@/lib/optimizer";

const HistoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);

  const entry = useMemo(() => (id ? getHistoryEntryById(id) : null), [id, version]);

  if (!entry) {
    return (
      <div className="min-h-screen pt-24 pb-16 container mx-auto px-6">
        <p className="text-muted-foreground">Record not found.</p>
      </div>
    );
  }

  const optimize = () => {
    updateHistoryEntry(entry.id, (current) => ({
      ...current,
      optimizedResult: optimizeForLowerRisk(current.result),
    }));
    setVersion((v) => v + 1);
  };

  const base = entry.result;
  const optimized = entry.optimizedResult;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 space-y-5">
        <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass rounded-xl p-4 space-y-4">
            <img src={entry.imageData} alt={entry.imageName} className="w-full h-[360px] object-contain rounded-lg bg-black/20" />
            <div>
              <h1 className="text-2xl font-bold">{entry.imageName}</h1>
              <p className="text-sm text-muted-foreground">Captured: {new Date(entry.createdAt).toLocaleString()}</p>
            </div>
            <Button className="gradient-primary text-primary-foreground gap-2" onClick={optimize}>
              <WandSparkles className="w-4 h-4" /> Run Risk Optimization
            </Button>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-4">
              <h3 className="font-semibold mb-3">Original Results</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary/40 rounded-lg p-3">Decision: <strong>{base.screeningDecision}</strong></div>
                <div className="bg-secondary/40 rounded-lg p-3">Risk Score: <strong>{base.screeningMetrics.riskScore.toFixed(1)}</strong></div>
                <div className="bg-secondary/40 rounded-lg p-3">Final Score: <strong>{base.screeningMetrics.finalScreeningScore.toFixed(1)}</strong></div>
                <div className="bg-secondary/40 rounded-lg p-3">Stability Risk: <strong>{base.screeningMetrics.stabilityRisk.toFixed(1)}</strong></div>
              </div>
            </div>

            {optimized && (
              <div className="glass rounded-xl p-4 border border-primary/30">
                <h3 className="font-semibold mb-3 text-primary">Optimized Results (Reduced Risk)</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-secondary/40 rounded-lg p-3">Decision: <strong>{optimized.screeningDecision}</strong></div>
                  <div className="bg-secondary/40 rounded-lg p-3">Risk Score: <strong>{optimized.screeningMetrics.riskScore.toFixed(1)}</strong></div>
                  <div className="bg-secondary/40 rounded-lg p-3">Final Score: <strong>{optimized.screeningMetrics.finalScreeningScore.toFixed(1)}</strong></div>
                  <div className="bg-secondary/40 rounded-lg p-3">Stability Risk: <strong>{optimized.screeningMetrics.stabilityRisk.toFixed(1)}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailPage;
