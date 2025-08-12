import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchBreakdownDialog } from "@/components/modals/MatchBreakdownDialog";
import type { InvestorProfile } from "@/data/investors";

export function InvestorCard({ investor }: { investor: InvestorProfile }) {
  return (
    <Card className="overflow-hidden group hover:shadow-[var(--shadow-elevated)] transition-all">
      <CardHeader className="space-y-0 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {investor.logo ? (
              <img src={investor.logo} alt={`${investor.name} logo`} className="h-8 w-8 rounded-sm" loading="lazy" />
            ) : (
              <div className="h-8 w-8 rounded-sm bg-secondary" />
            )}
            <div>
              <h3 className="font-medium leading-none">{investor.name}</h3>
              <p className="text-xs text-muted-foreground">{investor.type} • {investor.location}</p>
            </div>
          </div>
          {typeof investor.match_score === "number" && (
            <MatchBreakdownDialog
              trigger={<Button variant="secondary" size="sm">Score {investor.match_score}</Button>}
              scores={[
                { label: "Sector", value: 40 },
                { label: "Stage", value: 30 },
                { label: "Geo", value: 20 },
                { label: "Check Size", value: 10 },
              ]}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {investor.focus_areas?.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
          {investor.stages?.slice(0, 2).map((s) => (
            <Badge key={s} variant="outline">{s}</Badge>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">AUM</p>
            <p className="font-medium">${(investor.aum_usd/1_000_000).toFixed(0)}M</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Check</p>
            <p className="font-medium">${(investor.avg_check_usd/1_000_000).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-muted-foreground">Portfolio</p>
            <p className="font-medium">{investor.portfolio_count}</p>
          </div>
        </div>
        <div className="mt-3">
          <Link to={`/investors/${investor.id}`} aria-label={`Open ${investor.name}`}>
            <Button className="w-full" variant="premium">Open Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
