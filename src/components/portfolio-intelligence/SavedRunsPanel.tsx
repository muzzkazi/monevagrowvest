import { useEffect, useState } from "react";
import { FolderOpen, Loader2, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PiRunInputs, PiRunSummary, deleteRun, listRuns, loadRun, saveRun } from "@/lib/pi/runs";

interface ClientOption {
  id: string;
  full_name: string;
}

const SavedRunsPanel = ({
  inputs,
  assumedReturnPct,
  output,
  canEdit,
  currentRunId,
  onRunSaved,
  onRunLoaded,
}: {
  inputs: PiRunInputs;
  assumedReturnPct: number;
  output: Parameters<typeof saveRun>[0]["output"];
  canEdit: boolean;
  currentRunId: string | null;
  onRunSaved: (id: string, name: string, clientId: string | null) => void;
  onRunLoaded: (id: string, name: string, clientId: string | null, inputs: PiRunInputs) => void;
}) => {
  const { toast } = useToast();
  const [runs, setRuns] = useState<PiRunSummary[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState<string>("none");
  const [runName, setRunName] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const refresh = async () => {
    setLoadingList(true);
    try {
      setRuns(await listRuns());
    } catch (e) {
      toast({ title: "Could not load saved runs", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refresh();
    supabase
      .from("clients")
      .select("id, full_name")
      .order("full_name")
      .then(({ data }) => setClients((data as ClientOption[]) ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (asNew: boolean) => {
    setBusy(true);
    try {
      const name = runName.trim() || inputs.profile.clientName || "Untitled run";
      const id = await saveRun({
        id: asNew ? null : currentRunId,
        clientId: clientId === "none" ? null : clientId,
        runName: name,
        inputs,
        assumedReturnPct,
        output,
      });
      onRunSaved(id, name, clientId === "none" ? null : clientId);
      toast({ title: asNew || !currentRunId ? "Run saved" : "Run updated", description: name });
      await refresh();
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleLoad = async (id: string) => {
    setBusy(true);
    try {
      const run = await loadRun(id);
      setRunName(run.runName);
      setClientId(run.clientId ?? "none");
      onRunLoaded(run.id, run.runName, run.clientId, run.inputs);
      toast({
        title: "Run re-opened",
        description: "The engine has been re-run on the saved inputs, so the numbers are reproduced, not restored from a stale copy.",
      });
    } catch (e) {
      toast({ title: "Could not open run", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRun(id);
      await refresh();
      toast({ title: "Run deleted" });
    } catch (e) {
      toast({ title: "Delete failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-financial-accent" /> Saved runs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {canEdit && (
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="pi-run-name">Run label</Label>
              <Input
                id="pi-run-name"
                value={runName}
                placeholder={inputs.profile.clientName || "e.g. Review — Aug 2026"}
                onChange={(e) => setRunName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Link to client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleSave(false)} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {currentRunId ? "Update run" : "Save run"}
            </Button>
            {currentRunId && (
              <Button variant="outline" onClick={() => handleSave(true)} disabled={busy}>
                Save as new
              </Button>
            )}
          </div>
        )}

        {loadingList ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading saved runs…
          </div>
        ) : runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved runs yet. Capture the wizard inputs and save the run to re-open it later with the same deterministic
            outputs.
          </p>
        ) : (
          <div className="space-y-2">
            {runs.map((r) => {
              const client = clients.find((c) => c.id === r.clientId);
              return (
                <div
                  key={r.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                    r.id === currentRunId ? "border-financial-accent" : "border-border"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.runName}</p>
                    <p className="text-xs text-muted-foreground">
                      {client ? `${client.full_name} · ` : "Not linked · "}
                      last saved {new Date(r.updatedAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.snapshotFitScore !== null && (
                      <Badge variant="secondary">Fit {r.snapshotFitScore}/100</Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleLoad(r.id)} disabled={busy}>
                      Open
                    </Button>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(r.id)}
                        aria-label={`Delete ${r.runName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedRunsPanel;
