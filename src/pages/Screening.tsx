import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import { runMockAnalysis, type AnalysisResult } from "@/lib/mockAnalysis";

const Screening = () => {
  const [samples, setSamples] = useState<(AnalysisResult & { id: string })[]>([]);

  const addSample = () => {
    const result = runMockAnalysis();
    setSamples((s) => [...s, { ...result, id: `S-${String(s.length + 1).padStart(3, "0")}` }]);
  };

  const decisionColor = (d: string) =>
    d === "Promising Candidate" ? "text-accent" : d === "Needs Optimization" ? "text-chart-4" : "text-destructive";

  const decisionBg = (d: string) =>
    d === "Promising Candidate" ? "bg-accent/10 border-accent/30" : d === "Needs Optimization" ? "bg-chart-4/10 border-chart-4/30" : "bg-destructive/10 border-destructive/30";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Drug Screening Dashboard</h1>
            <p className="text-muted-foreground">Rank and evaluate nanoparticle candidates for drug formulation.</p>
          </div>
          <Button onClick={addSample} className="gradient-primary text-primary-foreground gap-2">
            <RefreshCw className="w-4 h-4" /> Generate Sample
          </Button>
        </motion.div>

        {samples.length === 0 ? (
          <div className="glass rounded-xl flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Generate nanoparticle samples to start screening</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sample cards */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {samples.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl p-5 hover:box-glow transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono font-bold text-lg">{s.id}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${decisionBg(s.screeningDecision)} ${decisionColor(s.screeningDecision)}`}>
                      {s.screeningDecision}
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={s.radarData}>
                      <PolarGrid stroke="hsl(220 15% 14%)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(215 15% 50%)", fontSize: 10 }} />
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                      <Radar dataKey="value" stroke="hsl(190 90% 50%)" fill="hsl(190 90% 50%)" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="rounded-md bg-secondary/50 p-2 text-center">
                      <span className="text-[10px] text-muted-foreground block">Stability</span>
                      <span className="text-sm font-mono font-bold">{s.stabilityScore}</span>
                    </div>
                    <div className="rounded-md bg-secondary/50 p-2 text-center">
                      <span className="text-[10px] text-muted-foreground block">Uniformity</span>
                      <span className="text-sm font-mono font-bold">{s.uniformityScore}</span>
                    </div>
                    <div className="rounded-md bg-secondary/50 p-2 text-center">
                      <span className="text-[10px] text-muted-foreground block">Interact.</span>
                      <span className="text-sm font-mono font-bold">{s.interactionStrength}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Comparison chart */}
            {samples.length > 1 && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Stability Comparison</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={samples.map((s) => ({ id: s.id, stability: s.stabilityScore, uniformity: s.uniformityScore }))}>
                    <XAxis dataKey="id" stroke="hsl(215 15% 50%)" fontSize={11} tickLine={false} />
                    <YAxis stroke="hsl(215 15% 50%)" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(220 18% 7%)", border: "1px solid hsl(220 15% 14%)", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="stability" fill="hsl(190 90% 50%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="uniformity" fill="hsl(170 80% 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Screening;
