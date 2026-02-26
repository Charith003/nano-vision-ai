import { motion } from "framer-motion";
import { History, Database } from "lucide-react";

const HistoryPage = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
        <p className="text-muted-foreground mb-8">View past predictions and analysis results.</p>
      </motion.div>

      <div className="glass rounded-xl flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground mb-2">No analysis history yet</p>
          <p className="text-xs text-muted-foreground/60">
            Connect a backend to persist predictions and enable history tracking.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default HistoryPage;
