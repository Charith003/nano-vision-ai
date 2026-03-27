import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DRUG_PREDICTION_UPDATED_EVENT, clearDrugPredictionHistory, deleteDrugPredictionRecord, getDrugPredictionHistory, type DrugPredictionRecord } from "@/lib/drugPredictionDb";
import { HISTORY_UPDATED_EVENT, clearHistoryEntries, deleteHistoryEntry, getHistoryEntries, type AnalysisHistoryEntry } from "@/lib/historyDb";

const HistoryPage = () => {
  const [analysisEntries, setAnalysisEntries] = useState<AnalysisHistoryEntry[]>([]);
  const [predictionEntries, setPredictionEntries] = useState<DrugPredictionRecord[]>([]);
  const [activePrediction, setActivePrediction] = useState<DrugPredictionRecord | null>(null);
  const [analysisSearch, setAnalysisSearch] = useState("");
  const [predictionSearch, setPredictionSearch] = useState("");

  const refresh = () => {
    setAnalysisEntries(getHistoryEntries());
    setPredictionEntries(getDrugPredictionHistory());
  };

  useEffect(() => {
    refresh();

    const onHistoryUpdated = () => refresh();
    const onPredictionUpdated = () => refresh();
    window.addEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdated);
    window.addEventListener(DRUG_PREDICTION_UPDATED_EVENT, onPredictionUpdated);

    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdated);
      window.removeEventListener(DRUG_PREDICTION_UPDATED_EVENT, onPredictionUpdated);
    };
  }, []);

  const clearAnalysis = () => {
    clearHistoryEntries();
    setAnalysisEntries([]);
  };

  const clearPrediction = () => {
    clearDrugPredictionHistory();
    setPredictionEntries([]);
  };

  const removeAnalysisItem = (id: string) => {
    deleteHistoryEntry(id);
    setAnalysisEntries(getHistoryEntries());
  };

  const removePredictionItem = (id: string) => {
    deleteDrugPredictionRecord(id);
    setPredictionEntries(getDrugPredictionHistory());
  };

  const filteredAnalysisEntries = useMemo(() => {
    const query = analysisSearch.trim().toLowerCase();
    if (!query) return analysisEntries;
    return analysisEntries.filter((entry) => entry.imageName.toLowerCase().includes(query));
  }, [analysisEntries, analysisSearch]);

  const filteredPredictionEntries = useMemo(() => {
    const query = predictionSearch.trim().toLowerCase();
    if (!query) return predictionEntries;
    return predictionEntries.filter(
      (entry) => entry.sampleName.toLowerCase().includes(query) || entry.smiles.toLowerCase().includes(query),
    );
  }, [predictionEntries, predictionSearch]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">History</h1>
          <p className="text-muted-foreground">Separate tabs for microscopy analysis records and drug prediction records.</p>
        </motion.div>

        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList className="grid w-full md:w-[420px] grid-cols-2">
            <TabsTrigger value="analysis">Analysis History</TabsTrigger>
            <TabsTrigger value="prediction">Prediction History</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="flex justify-end">
              {analysisEntries.length > 0 && (
                <Button variant="outline" onClick={clearAnalysis} className="gap-2">
                  <Trash2 className="w-4 h-4" /> Clear Analysis History
                </Button>
              )}
            </div>
            <Input
              value={analysisSearch}
              onChange={(event) => setAnalysisSearch(event.target.value)}
              placeholder="Search analysis history by file name"
            />

            {filteredAnalysisEntries.length === 0 ? (
              <div className="glass rounded-xl flex items-center justify-center min-h-[320px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground mb-2">{analysisEntries.length === 0 ? "No analysis history yet" : "No analysis records match your search"}</p>
                  <p className="text-xs text-muted-foreground/60">{analysisEntries.length === 0 ? "Run analysis from the Analyze page to build your local database history." : "Try a different keyword."}</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAnalysisEntries.map((entry) => (
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
                        Optimized saved · Risk: <strong>{entry.optimizedResult.screeningMetrics.riskScore.toFixed(1)}</strong>
                        {entry.optimizedName ? <> · Name: <strong>{entry.optimizedName}</strong></> : null}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="gap-1 h-7 px-2" onClick={() => removeAnalysisItem(entry.id)}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prediction" className="space-y-4">
            <div className="flex justify-end">
              {predictionEntries.length > 0 && (
                <Button variant="outline" onClick={clearPrediction} className="gap-2">
                  <Trash2 className="w-4 h-4" /> Clear Prediction History
                </Button>
              )}
            </div>
            <Input
              value={predictionSearch}
              onChange={(event) => setPredictionSearch(event.target.value)}
              placeholder="Search prediction history by sample or SMILES"
            />

            {filteredPredictionEntries.length === 0 ? (
              <div className="glass rounded-xl flex items-center justify-center min-h-[320px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground mb-2">{predictionEntries.length === 0 ? "No drug prediction history yet" : "No prediction records match your search"}</p>
                  <p className="text-xs text-muted-foreground/60">{predictionEntries.length === 0 ? "Generate and save outputs from the Drug Prediction tab." : "Try a different sample name or SMILES keyword."}</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPredictionEntries.map((entry) => (
                  <article
                    key={entry.id}
                    className="glass rounded-xl p-4 space-y-3 text-sm cursor-pointer hover:box-glow transition-all"
                    onClick={() => setActivePrediction(entry)}
                  >
                    <div>
                      <p className="font-semibold truncate">{entry.sampleName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-xs break-all text-muted-foreground">SMILES: {entry.smiles}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-secondary/50 p-2">Efficacy: <strong>{entry.outputs.predictedEfficacy}%</strong></div>
                      <div className="rounded-md bg-secondary/50 p-2">Toxicity: <strong>{entry.outputs.predictiveToxicity}%</strong></div>
                      <div className="rounded-md bg-secondary/50 p-2">Docking: <strong>{entry.outputs.compoundDockingScore}</strong></div>
                      <div className="rounded-md bg-secondary/50 p-2">Confidence: <strong>{entry.outputs.predictionConfidence}%</strong></div>
                    </div>
                    <div className="rounded-md bg-primary/10 border border-primary/30 p-2 text-xs">
                      Decision: <strong>{entry.outputs.decision}</strong> · Multi-factor: <strong>{entry.outputs.multiFactorScore}</strong>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 h-7 px-2"
                        onClick={(event) => {
                          event.stopPropagation();
                          removePredictionItem(entry.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={Boolean(activePrediction)} onOpenChange={(open) => !open && setActivePrediction(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Prediction File Details</DialogTitle>
            </DialogHeader>
            {activePrediction && (
              <div className="grid md:grid-cols-2 gap-3 text-sm max-h-[65vh] overflow-auto pr-1">
                <div className="rounded-md bg-secondary/40 p-3 min-w-0">Sample<br /><strong className="block break-all">{activePrediction.sampleName}</strong></div>
                <div className="rounded-md bg-secondary/40 p-3 min-w-0">Created<br /><strong className="block break-words">{new Date(activePrediction.createdAt).toLocaleString()}</strong></div>
                <div className="rounded-md bg-secondary/40 p-3 md:col-span-2 break-all min-w-0">SMILES<br /><strong className="block break-all">{activePrediction.smiles}</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Efficacy<br /><strong>{activePrediction.outputs.predictedEfficacy}%</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Toxicity<br /><strong>{activePrediction.outputs.predictiveToxicity}%</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Decision<br /><strong>{activePrediction.outputs.decision}</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Multi-factor<br /><strong>{activePrediction.outputs.multiFactorScore}</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Docking score<br /><strong>{activePrediction.outputs.compoundDockingScore} kcal/mol</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Reference docking<br /><strong>{activePrediction.outputs.referenceDockingScore} kcal/mol</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Confidence<br /><strong>{activePrediction.outputs.predictionConfidence}%</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Model uncertainty<br /><strong>{activePrediction.outputs.modelUncertainty}</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Lipinski<br /><strong>{activePrediction.outputs.lipinskiCompliance}</strong></div>
                <div className="rounded-md bg-secondary/40 p-3">Lead-likeness<br /><strong>{activePrediction.outputs.leadLikeness}</strong></div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HistoryPage;
