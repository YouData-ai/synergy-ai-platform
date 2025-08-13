import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WorkspaceEnvelope, Workspace } from "@/lib/api-types";

export function useWorkspace() {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: async (): Promise<Workspace> => {
      const env = await api<WorkspaceEnvelope>("/api/workspace");
      const ws = env.workspaces?.[0];
      if (!ws) throw new Error("No workspace available");
      return ws;
    },
    staleTime: 60_000,
    retry: 1,
  });
}
