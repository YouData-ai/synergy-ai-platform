import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { useWorkspace } from "@/hooks/useWorkspace";

const Index = () => {
  const { data: ws } = useWorkspace();
  const investors = ws?.investors;
  const startups = ws?.startups;

  return (
    <div>
      <Seo title="LVX — Workspace Overview" description="Live list of investors and startups from your workspace API." />
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Loaded from /api/workspace (shows mock fallback if API is unavailable).</p>

        <section className="mt-8">
          <h2 className="text-lg font-medium">Investors</h2>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            {(investors).map((inv: any) => (
              <li key={inv.id} className="text-sm">
                <span className="font-medium">{inv.name}</span>
                {inv.website && (
                  <a href={inv.website} target="_blank" rel="noreferrer" className="ml-2 underline text-primary">
                    {new URL(inv.website).host}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Startups</h2>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            {(startups).map((s: any) => (
              <li key={s.id} className="text-sm">
                <span className="font-medium">{s.company_name ?? s.name}</span>
                { (s.website) && (
                  <a href={s.website} target="_blank" rel="noreferrer" className="ml-2 underline text-primary">
                    {new URL(s.website).host}
                  </a>
                )}
                { (s.stage || s.stage?.value) && (
                  <span className="ml-2 text-muted-foreground">— Stage: {typeof s.stage === 'string' ? s.stage : s.stage?.value}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Index;
