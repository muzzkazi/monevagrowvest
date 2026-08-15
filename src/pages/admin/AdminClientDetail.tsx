import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/shared/PageLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Lock, Plus, Save, Trash2, History, FileDown, Eye } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { generateClientReportPdf } from "@/lib/clientReportPdf";

type Client = {
  id: string; full_name: string; email: string | null; phone: string | null;
  date_of_birth: string | null; occupation: string | null; city: string | null;
  risk_profile: string; monthly_income: number | null; monthly_investable: number | null;
  investment_horizon_years: number | null; tax_bracket: string | null;
  existing_investments: string | null; kyc_status: string; status: string; notes: string | null;
};
type Goal = {
  id: string; goal_name: string; target_amount: number | null;
  target_date: string | null; priority: string; notes: string | null;
};
type Fund = {
  id: string; fund_name: string; scheme_code: string | null; category: string | null;
  monthly_sip: number; lumpsum_amount: number; sip_day: number | null;
  start_date: string | null; status: string; rationale: string | null;
};
type LogEntry = { id: string; action: string; details: string | null; created_at: string };

const RISK = ["conservative", "moderate", "aggressive"];
const CATEGORIES = ["Large Cap", "Mid Cap", "Small Cap", "Flexi Cap", "Index", "ELSS", "Hybrid", "Debt", "International"];
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const AdminClientDetailInner = ({ clientId }: { clientId: string }) => {
  const { canEdit } = useIsAdmin();
  const [client, setClient] = useState<Client | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [goalForm, setGoalForm] = useState({ goal_name: "", target_amount: "", target_date: "", priority: "medium", notes: "" });
  const [goalOpen, setGoalOpen] = useState(false);
  const [fundForm, setFundForm] = useState({ fund_name: "", category: "", monthly_sip: "", lumpsum_amount: "", sip_day: "", start_date: "", rationale: "" });
  const [fundOpen, setFundOpen] = useState(false);

  const logAction = useCallback(async (action: string, details?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("client_activity_log").insert({
      client_id: clientId, action, details: details ?? null, actor_id: user?.id ?? null,
    });
  }, [clientId]);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, g, f, l] = await Promise.all([
      supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
      supabase.from("client_goals").select("*").eq("client_id", clientId).order("created_at"),
      supabase.from("client_funds").select("*").eq("client_id", clientId).order("created_at"),
      supabase.from("client_activity_log").select("id, action, details, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(50),
    ]);
    setClient((c.data as Client) ?? null);
    setGoals((g.data as Goal[]) ?? []);
    setFunds((f.data as Fund[]) ?? []);
    setLog((l.data as LogEntry[]) ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async () => {
    if (!client) return;
    setSavingProfile(true);
    const { id, ...rest } = client;
    const { error } = await supabase.from("clients").update(rest).eq("id", id);
    setSavingProfile(false);
    if (error) return toast.error(error.message);
    await logAction("Profile updated", "Client details or risk profile revised");
    toast.success("Profile saved");
    load();
  };

  const addGoal = async () => {
    if (!goalForm.goal_name.trim()) return toast.error("Goal name is required");
    const { error } = await supabase.from("client_goals").insert({
      client_id: clientId,
      goal_name: goalForm.goal_name.trim(),
      target_amount: goalForm.target_amount ? Number(goalForm.target_amount) : null,
      target_date: goalForm.target_date || null,
      priority: goalForm.priority,
      notes: goalForm.notes.trim() || null,
    });
    if (error) return toast.error(error.message);
    await logAction("Goal added", goalForm.goal_name.trim());
    setGoalOpen(false);
    setGoalForm({ goal_name: "", target_amount: "", target_date: "", priority: "medium", notes: "" });
    load();
  };

  const removeGoal = async (g: Goal) => {
    const { error } = await supabase.from("client_goals").delete().eq("id", g.id);
    if (error) return toast.error(error.message);
    await logAction("Goal removed", g.goal_name);
    load();
  };

  const addFund = async () => {
    if (!fundForm.fund_name.trim()) return toast.error("Fund name is required");
    const { error } = await supabase.from("client_funds").insert({
      client_id: clientId,
      fund_name: fundForm.fund_name.trim(),
      category: fundForm.category || null,
      monthly_sip: fundForm.monthly_sip ? Number(fundForm.monthly_sip) : 0,
      lumpsum_amount: fundForm.lumpsum_amount ? Number(fundForm.lumpsum_amount) : 0,
      sip_day: fundForm.sip_day ? Number(fundForm.sip_day) : null,
      start_date: fundForm.start_date || null,
      rationale: fundForm.rationale.trim() || null,
    });
    if (error) return toast.error(error.message);
    await logAction("Fund added", `${fundForm.fund_name.trim()} · ${inr(Number(fundForm.monthly_sip || 0))}/month`);
    setFundOpen(false);
    setFundForm({ fund_name: "", category: "", monthly_sip: "", lumpsum_amount: "", sip_day: "", start_date: "", rationale: "" });
    load();
  };

  const updateFund = async (f: Fund, patch: Partial<Fund>, label: string) => {
    const { error } = await supabase.from("client_funds").update(patch).eq("id", f.id);
    if (error) return toast.error(error.message);
    await logAction("Fund updated", `${f.fund_name} · ${label}`);
    load();
  };

  const removeFund = async (f: Fund) => {
    const { error } = await supabase.from("client_funds").delete().eq("id", f.id);
    if (error) return toast.error(error.message);
    await logAction("Fund removed", f.fund_name);
    load();
  };

  const downloadReport = () => {
    if (!client) return;
    try {
      generateClientReportPdf({ client, goals, funds, log });
      toast.success("Report downloaded");
    } catch (e) {
      toast.error("Could not generate the report");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 max-w-5xl py-12 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 max-w-5xl py-16 text-center">
        <p className="text-muted-foreground">Client not found.</p>
        <Button asChild variant="ghost" className="mt-4"><Link to="/admin/clients">Back to client book</Link></Button>
      </div>
    );
  }

  const totalSip = funds.filter((f) => f.status === "active").reduce((a, f) => a + Number(f.monthly_sip), 0);

  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5">
          <Link to="/admin/clients"><ArrowLeft className="h-4 w-4" /> Client book</Link>
        </Button>

        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Badge variant="secondary" className="gap-1.5"><Lock className="h-3 w-3" /> Private</Badge>
          <Badge variant="outline" className="capitalize">{client.risk_profile} risk</Badge>
          {!canEdit && <Badge variant="outline" className="gap-1.5"><Eye className="h-3 w-3" /> Read-only access</Badge>}
          <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={downloadReport}>
            <FileDown className="h-4 w-4" /> Download PDF report
          </Button>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">{client.full_name}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Monthly SIP under advice: <span className="font-semibold text-foreground">{inr(totalSip)}</span>
          {client.monthly_investable ? ` of ${inr(Number(client.monthly_investable))} investable` : ""}
        </p>

        <Tabs defaultValue="portfolio" className="mt-8">
          <TabsList>
            <TabsTrigger value="portfolio">SIP Portfolio</TabsTrigger>
            <TabsTrigger value="profile">Profile & Risk</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Portfolio */}
          <TabsContent value="portfolio" className="mt-6 space-y-4">
            <div className="flex justify-end">
              {canEdit && <Dialog open={fundOpen} onOpenChange={setFundOpen}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add fund</Button></DialogTrigger>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Add fund to portfolio</DialogTitle></DialogHeader>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><Label>Fund name *</Label><Input value={fundForm.fund_name} onChange={(e) => setFundForm({ ...fundForm, fund_name: e.target.value })} /></div>
                    <div>
                      <Label>Category</Label>
                      <Select value={fundForm.category} onValueChange={(v) => setFundForm({ ...fundForm, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Monthly SIP (₹)</Label><Input type="number" value={fundForm.monthly_sip} onChange={(e) => setFundForm({ ...fundForm, monthly_sip: e.target.value })} /></div>
                    <div><Label>Lumpsum (₹)</Label><Input type="number" value={fundForm.lumpsum_amount} onChange={(e) => setFundForm({ ...fundForm, lumpsum_amount: e.target.value })} /></div>
                    <div><Label>SIP day of month</Label><Input type="number" min={1} max={28} value={fundForm.sip_day} onChange={(e) => setFundForm({ ...fundForm, sip_day: e.target.value })} /></div>
                    <div className="sm:col-span-2"><Label>Start date</Label><Input type="date" value={fundForm.start_date} onChange={(e) => setFundForm({ ...fundForm, start_date: e.target.value })} /></div>
                    <div className="sm:col-span-2"><Label>Why this fund</Label><Textarea rows={3} value={fundForm.rationale} onChange={(e) => setFundForm({ ...fundForm, rationale: e.target.value })} /></div>
                  </div>
                  <DialogFooter><Button onClick={addFund}>Add fund</Button></DialogFooter>
                </DialogContent>
              </Dialog>}
            </div>

            <Card className="overflow-hidden">
              {funds.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No funds yet. Add the first scheme of this client's plan.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-40">Monthly SIP (₹)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funds.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{f.fund_name}</div>
                          {f.rationale && <div className="text-xs text-muted-foreground max-w-xs">{f.rationale}</div>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{f.category || "—"}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={Number(f.monthly_sip)}
                            className="h-9"
                            disabled={!canEdit}
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (v !== Number(f.monthly_sip)) updateFund(f, { monthly_sip: v }, `SIP changed to ${inr(v)}/month`);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={f.status}
                            onValueChange={(v) => updateFund(f, { status: v }, `status set to ${v}`)}
                          >
                            <SelectTrigger className="h-9 w-28" disabled={!canEdit}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="exited">Exited</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => removeFund(f)} aria-label={`Remove ${f.fund_name}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
            <p className="text-xs text-muted-foreground">
              Editing a SIP amount or status is logged automatically in History.
            </p>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="mt-6">
            <Card className="p-6 grid sm:grid-cols-2 gap-4">
              <div><Label>Full name</Label><Input value={client.full_name} onChange={(e) => setClient({ ...client, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={client.email ?? ""} onChange={(e) => setClient({ ...client, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={client.phone ?? ""} onChange={(e) => setClient({ ...client, phone: e.target.value })} /></div>
              <div><Label>Date of birth</Label><Input type="date" value={client.date_of_birth ?? ""} onChange={(e) => setClient({ ...client, date_of_birth: e.target.value })} /></div>
              <div><Label>Occupation</Label><Input value={client.occupation ?? ""} onChange={(e) => setClient({ ...client, occupation: e.target.value })} /></div>
              <div><Label>City</Label><Input value={client.city ?? ""} onChange={(e) => setClient({ ...client, city: e.target.value })} /></div>
              <div>
                <Label>Risk profile</Label>
                <Select value={client.risk_profile} onValueChange={(v) => setClient({ ...client, risk_profile: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{RISK.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Horizon (years)</Label><Input type="number" value={client.investment_horizon_years ?? ""} onChange={(e) => setClient({ ...client, investment_horizon_years: e.target.value ? Number(e.target.value) : null })} /></div>
              <div><Label>Monthly income (₹)</Label><Input type="number" value={client.monthly_income ?? ""} onChange={(e) => setClient({ ...client, monthly_income: e.target.value ? Number(e.target.value) : null })} /></div>
              <div><Label>Monthly investable (₹)</Label><Input type="number" value={client.monthly_investable ?? ""} onChange={(e) => setClient({ ...client, monthly_investable: e.target.value ? Number(e.target.value) : null })} /></div>
              <div><Label>Tax bracket</Label><Input value={client.tax_bracket ?? ""} onChange={(e) => setClient({ ...client, tax_bracket: e.target.value })} placeholder="e.g. 30%" /></div>
              <div>
                <Label>KYC status</Label>
                <Select value={client.kyc_status} onValueChange={(v) => setClient({ ...client, kyc_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label>Existing investments elsewhere</Label><Textarea rows={3} value={client.existing_investments ?? ""} onChange={(e) => setClient({ ...client, existing_investments: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Notes</Label><Textarea rows={4} value={client.notes ?? ""} onChange={(e) => setClient({ ...client, notes: e.target.value })} /></div>
              <div className="sm:col-span-2 flex justify-end">
                {canEdit && <Button onClick={saveProfile} disabled={savingProfile} className="gap-2">
                  <Save className="h-4 w-4" /> {savingProfile ? "Saving…" : "Save changes"}
                </Button>}
              </div>
            </Card>
          </TabsContent>

          {/* Goals */}
          <TabsContent value="goals" className="mt-6 space-y-4">
            <div className="flex justify-end">
              {canEdit && <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add goal</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>New goal</DialogTitle></DialogHeader>
                  <div className="grid gap-4">
                    <div><Label>Goal name *</Label><Input value={goalForm.goal_name} onChange={(e) => setGoalForm({ ...goalForm, goal_name: e.target.value })} placeholder="Child education, retirement…" /></div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label>Target amount (₹)</Label><Input type="number" value={goalForm.target_amount} onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })} /></div>
                      <div><Label>Target date</Label><Input type="date" value={goalForm.target_date} onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })} /></div>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={goalForm.priority} onValueChange={(v) => setGoalForm({ ...goalForm, priority: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Notes</Label><Textarea rows={3} value={goalForm.notes} onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })} /></div>
                  </div>
                  <DialogFooter><Button onClick={addGoal}>Add goal</Button></DialogFooter>
                </DialogContent>
              </Dialog>}
            </div>
            {goals.length === 0 ? (
              <Card className="p-10 text-center text-sm text-muted-foreground">No goals recorded yet.</Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {goals.map((g) => (
                  <Card key={g.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground">{g.goal_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {g.target_amount ? inr(Number(g.target_amount)) : "No target"} {g.target_date ? `by ${g.target_date}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="capitalize">{g.priority}</Badge>
                        {canEdit && (
                          <Button variant="ghost" size="icon" onClick={() => removeGoal(g)} aria-label={`Remove ${g.goal_name}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {g.notes && <p className="text-sm text-muted-foreground mt-3">{g.notes}</p>}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="mt-6">
            <Card className="p-6">
              {log.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No activity yet.</p>
              ) : (
                <ol className="space-y-4">
                  {log.map((e) => (
                    <li key={e.id} className="flex gap-3">
                      <div className="mt-0.5 p-1.5 rounded-md bg-financial-accent/10 text-financial-accent h-fit">
                        <History className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{e.action}</div>
                        {e.details && <div className="text-sm text-muted-foreground">{e.details}</div>}
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(e.created_at).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

const AdminClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <PageLayout>
      <AdminGuard allowAdvisor>{id ? <AdminClientDetailInner clientId={id} /> : null}</AdminGuard>
    </PageLayout>
  );
};

export default AdminClientDetail;
