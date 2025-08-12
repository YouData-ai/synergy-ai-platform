import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StartupProfile } from "@/data/startups";

export function StartupCard({ startup }: { startup: StartupProfile }) {
  return (
    <Card className="overflow-hidden group hover:shadow-[var(--shadow-elevated)] transition-all">
      <CardHeader className="space-y-0 p-4">
        <div className="flex items-center gap-3">
          {startup.logo ? (
            <img src={startup.logo} alt={`${startup.name} logo`} className="h-8 w-8 rounded-sm" loading="lazy" />
          ) : (
            <div className="h-8 w-8 rounded-sm bg-secondary" />
          )}
          <div>
            <h3 className="font-medium leading-none">{startup.name}</h3>
            <p className="text-xs text-muted-foreground">{startup.geos.join(", ")}</p>
          </div>
          {typeof startup.match_score === "number" && (
            <div className="ml-auto text-sm text-muted-foreground">Score {startup.match_score}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm mb-2">{startup.one_liner}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {startup.sectors.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">ARR</p>
            <p className="font-medium">${((startup.arr_usd||0)/1_000_000).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-muted-foreground">Growth</p>
            <p className="font-medium">{startup.growth_pct || 0}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Team</p>
            <p className="font-medium">{startup.team_size || 0}</p>
          </div>
        </div>
        <div className="mt-3">
          <Link to={`/startups/${startup.id}`} aria-label={`Open ${startup.name}`}>
            <Button className="w-full" variant="premium">Open Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
