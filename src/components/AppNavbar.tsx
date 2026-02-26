import { Link, useLocation } from "react-router-dom";
import { Microscope, Upload, BarChart3, FlaskConical, History } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Microscope },
  { path: "/analyze", label: "Analyze", icon: Upload },
  { path: "/screening", label: "Screening", icon: FlaskConical },
  { path: "/history", label: "History", icon: History },
];

const AppNavbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Microscope className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Nano<span className="text-primary">Scope</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary box-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
