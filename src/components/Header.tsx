import { NavLink, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/investors", label: "Investors" },
  { to: "/startups", label: "Startups" },
  { to: "/agents", label: "AI Agents" },
];

export function Header() {
  const getCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive ? "bg-secondary text-foreground" : "hover:bg-secondary"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="LVX AI Platform Home">
          <img src="/lovable-uploads/c7fadedf-003a-4228-8db6-3777b167e446.png" alt="LVX logo" className="h-6 w-auto" loading="lazy" />
          <span className="font-semibold tracking-tight">LVX AI Platform</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <NavLink key={n.to} to={n.to} end className={getCls}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="premium" size="sm">New Match</Button>
          <Button variant="hero" size="sm">Run Agents</Button>
        </div>
      </div>
    </header>
  );
}
