import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, LoaderCircle, Save, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addHistoryEntry, getHistoryEntryById, updateHistoryEntry } from "@/lib/historyDb";
import { createOptimizedImageData, downloadOptimizedImage, optimizeForLowerRisk } from "@/lib/optimizer";
import type { AnalysisResult } from "@/lib/mockAnalysis";

const isStorageQuotaError = (error: unknown) =>
  error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");

const compressDataUrlForStorage = (imageData: string, maxSide = 1200, quality = 0.72) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const longestSide = Math.max(image.width, image.height) || 1;
      const scale = Math.min(1, maxSide / longestSide);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to initialize canvas context for optimization image compression."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    image.onerror = () => reject(new Error("Unable to compress optimized image data."));
    image.src = imageData;
  });

const HistoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [draftResult, setDraftResult] = useState<AnalysisResult | null>(null);
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const entry = useMemo(() => (id ? getHistoryEntryById(id) : null), [id, version]);

  useEffect(() => {
    if (!entry) return;
    setDraftResult(entry.optimizedResult ?? null);
    setDraftImage(entry.optimizedImageData ?? null);
    setDraftName(entry.optimizedName ?? `${entry.imageName.replace(/\.[^/.]+$/, "")}-optimized`);
  }, [entry]);

  if (!entry) {
    return (
      <div className="min-h-screen pt-24 pb-16 container mx-auto px-6">
        <p className="text-muted-foreground">Record not found.</p>
      </div>
    );
  }

  const runOptimize = async () => {
    setOptimizing(true);
    setSaveMessage(null);
    setProgress(0);

    const timer = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + 8));
    }, 120);

    try {
      const optimizedResult = optimizeForLowerRisk(entry.result);
      const optimizedImageData = await createOptimizedImageData(entry.imageData).catch(() => entry.imageData);
      setDraftResult(optimizedResult);
      setDraftImage(optimizedImageData);
      setDraftName((prev) => prev || entry.optimizedName || `${entry.imageName.replace(/\.[^/.]+$/, "")}-optimized`);
    } finally {
      window.clearInterval(timer);
      setProgress(100);
      setOptimizing(false);
    }
  };

  const saveOptimized = () => {
    const resultToSave = draftResult ?? entry.optimizedResult;
    const imageToSave = draftImage ?? entry.optimizedImageData ?? entry.imageData;
    const nameToSave = draftName || entry.optimizedName || `${entry.imageName.replace(/\.[^/.]+$/, "")}-optimized`;
    const snapshotImageName = nameToSave.includes(".") ? nameToSave : `${nameToSave}.png`;
    setSaveMessage(null);

    if (!resultToSave) {
      setSaveMessage("Run optimization first before saving.");
      return;
    }

    const persistWithImage = (optimizedImage: string) => {
      const saved = updateHistoryEntry(entry.id, (current) => ({
        ...current,
        optimizedResult: resultToSave,
        optimizedImageData: optimizedImage,
        optimizedName: nameToSave,
      }));

      if (!saved) {
        throw new Error("Unable to save optimized data.");
      }

      const snapshot = addHistoryEntry({
        imageName: snapshotImageName,
        imageData: optimizedImage,
        result: resultToSave,
        optimizedResult: resultToSave,
        optimizedImageData: optimizedImage,
        optimizedName: nameToSave,
      });

      const verified = getHistoryEntryById(entry.id);
      if (!verified?.optimizedResult) {
        throw new Error("Save did not persist correctly. Please try again.");
      }

      setSaveMessage(`Optimized data saved successfully. Snapshot ID: ${snapshot.id}`);
      setDraftResult(resultToSave);
      setDraftImage(optimizedImage);
      setDraftName(nameToSave);
      setVersion((v) => v + 1);
    };

    try {
      persistWithImage(imageToSave);
    } catch (error) {
      if (!isStorageQuotaError(error)) {
        setSaveMessage(error instanceof Error ? error.message : "Unable to save optimized data.");
        return;
      }

      compressDataUrlForStorage(imageToSave)
        .then((compressed) => {
          persistWithImage(compressed);
        })
        .catch((compressionError) => {
          console.error("Failed to compress optimized image for storage", compressionError);
          setSaveMessage("Unable to save optimized data. Storage may be full or blocked in this browser.");
        });
    }
  };

  const shownResult = draftResult ?? entry.optimizedResult;
  const shownImage = draftImage ?? entry.optimizedImageData;

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

            <Button className="gradient-primary text-primary-foreground gap-2" onClick={runOptimize} disabled={optimizing}>
              {optimizing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />} Run Risk Optimization
            </Button>

            {optimizing && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Optimizing sample pipeline...</p>
                <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-4">
              <h3 className="font-semibold mb-3">Original Results</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary/40 rounded-lg p-3">Decision: <strong>{entry.result.screeningDecision}</strong></div>
                <div className="bg-secondary/40 rounded-lg p-3">Risk Score: <strong>{entry.result.screeningMetrics.riskScore.toFixed(1)}</strong></div>
                <div className="bg-secondary/40 rounded-lg p-3">Final Score: <strong>{entry.result.screeningMetrics.finalScreeningScore.toFixed(1)}</strong></div>
                <div className="bg-secondary/40 rounded-lg p-3">Stability Risk: <strong>{entry.result.screeningMetrics.stabilityRisk.toFixed(1)}</strong></div>
              </div>
            </div>

            {shownResult && (
              <div className="glass rounded-xl p-4 border border-primary/30 space-y-4">
                <h3 className="font-semibold text-primary">Optimized Results (Reduced Risk)</h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-secondary/40 rounded-lg p-3">Decision: <strong>{shownResult.screeningDecision}</strong></div>
                  <div className="bg-secondary/40 rounded-lg p-3">Risk Score: <strong>{shownResult.screeningMetrics.riskScore.toFixed(1)}</strong></div>
                  <div className="bg-secondary/40 rounded-lg p-3">Final Score: <strong>{shownResult.screeningMetrics.finalScreeningScore.toFixed(1)}</strong></div>
                  <div className="bg-secondary/40 rounded-lg p-3">Stability Risk: <strong>{shownResult.screeningMetrics.stabilityRisk.toFixed(1)}</strong></div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Optimized sample name</label>
                  <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="optimized sample name" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={saveOptimized} className="gap-2" disabled={!shownResult}>
                    <Save className="w-4 h-4" /> Save Optimized Data
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => downloadOptimizedImage(shownImage ?? entry.imageData, draftName || entry.optimizedName || entry.imageName)}
                  >
                    <Download className="w-4 h-4" /> Download Optimized Image
                  </Button>
                </div>

                {saveMessage && <p className="text-xs text-primary">{saveMessage}</p>}

                {shownImage && (
                  <img
                    src={shownImage}
                    alt="Optimized sample"
                    className="w-full h-48 object-contain rounded-lg border border-border/40 bg-black/20"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailPage;
