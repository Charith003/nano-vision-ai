import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  unit?: string;
  trend?: "up" | "down" | "neutral";
}

const StatCard = ({ label, value, icon: Icon, unit }: StatCardProps) => (
  <div className="glass rounded-xl p-4 group hover:box-glow transition-all duration-300">
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <Icon className="w-4 h-4 text-primary/60" />
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold font-mono text-foreground">{value}</span>
      {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
    </div>
  </div>
);

export default StatCard;
