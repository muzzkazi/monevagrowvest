import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/shared/PageLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Layers, Lock, Plus, Wand2 } from "lucide-react";

type ClientRow = { id: string; full_name: string; risk_profile: string; status: string };
type FundRow = {
  id: string;
  client_id: string;
  fund_name: string;
  category: string | null;
  monthly_sip: number;
  status: string;
};

const CATEGORIES = ["Large Cap", "Mid Cap", "Small Cap", "Flexi Cap", "Index", "ELSS", "Hybrid", "Debt", "International"];
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type Mode = "increase_pct" | "increase_amt" | "set_amt";

const AdminBulkSipInner = () => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [funds, setFunds] = useState<FundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [clientFilter, setClientFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [mode, setMode] = useState<Mode>("increase_pct");
  const [value, setValue] = useState("10");
  const [roundTo, setRoundTo] = useState("500");

  // Add-one-fund-to-many-clients
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ fund_name: "", category: "", monthly_sip: "", rationale: "" });
  const [addClients, setAddClients] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: cs }, { data: fs, error }] = await Promise.all([
      supabase.from("clients").select("id, full_name, risk_profile, status").order("full_name"),
      supabase.from("client_funds").select("id, client_id, fund_name, category, monthly_sip, status").order("fund_name"),
    ]);
    if (error) toast.error("Could not load portfolios");
    setClients((cs as ClientRow[]) ?? []);
    setFunds(((fs ?? []) as FundRow[]).map((f) => ({ ...f, monthly_sip: Number(f.monthly_sip) })));
    setSelected({});
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.full_name ?? "Unknown client";

  const visible = useMemo(
    () =>
      funds.filter(
        (f) =>
          (clientFilter === "all" || f.client_id === clientFilter) &&
          (categoryFilter === "all" || f.category === categoryFilter) &&
          (statusFilter === "all" || f.status === statusFilter)
      ),
    [funds, clientFilter, categoryFilter, statusFilter]
  );

  const selectedFunds = visible.filter((f) => selected[f.id]);
  const allVisibleSelected = visible.length > 0 && visible.every((f) => selected[f.id]);

  const round = (n: number) => {
    const step = Number(roundTo);
    if (!step || step <= 1) return Math.round(n);
    return Math.round(n / step) * step;
  };

  const preview = (current: number) => {
    const v = Number(value) || 0;
    if (mode === "increase_pct") return Math.max(0, round(current * (1 + v / 100)));
    if (mode === "increase_amt") return Math.max(0, round(current + v));
    return Math.max(0, round(v));
  };

  const totalNow = selectedFunds.reduce((a, f) => a + f.monthly_sip, 0);
  const totalAfter = selectedFunds.reduce((a, f) => a + preview(f.monthly_sip), 0);

  const applyBulk = async () => {
    if (selectedFunds.length === 0) return toast.error("Select at least one SIP to update");
    if (!value.trim()) return toast.error("Enter an amount or percentage");
    setApplying(true);
    const { data: { user } } = await supabase.auth.getUser();

    const changes = selectedFunds
      .map((f) => ({ fund: f, next: preview(f.monthly_sip) }))
      .filter((c) => c.next !== c.fund.monthly_sip);

    if (changes.length === 0) {
      setApplying(false);
      return toast.info("Nothing to change — new amounts match the current ones");
    }

    const results = await Promise.all(
      changes.map((c) => supabase.from("client_funds").update({ monthly_sip: c.next }).eq("id", c.fund.id))
    );
    const failed = results.filter((r) => r.error).length;

    await supabase.from("client_activity_log").insert(
      changes.map((c) => ({
        client_id: c.fund.client_id,
        action: "SIP revised (bulk)",
        details: `${c.fund.fund_name}: ${inr(c.fund.monthly_sip)} → ${inr(c.next)}/month`,
        actor_id: user?.id ?? null,
      }))
    );

    setApplying(false);
    if (failed) toast.error(`${failed} update(s) failed`);
    else toast.success(`${changes.length} SIP${changes.length > 1 ? "s" : ""} updated`);
    load();
  };

  const applyAddFund = async () => {
    const ids = Object.keys(addClients).filter((k) => addClients[k]);
    if (!addForm.fund_name.trim()) return toast.error("Fund name is required");
    if (ids.length === 0) return toast.error("Select at least one client");
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    const amount = addForm.monthly_sip ? Number(addForm.monthly_sip) : 0;

    const { error } = await supabase.from("client_funds").insert(
      ids.map((client_id) => ({
        client_id,
        fund_name: addForm.fund_name.trim(),
        category: addForm.category || null,
        monthly_sip: amount,
        rationale: addForm.rationale.trim() || null,
      }))
    );
    if (!error) {
      await supabase.from("client_activity_log").insert(
        ids.map((client_id) => ({
          client_id,
          action: "Fund added (bulk)",
          details: `${addForm.fund_name.trim()} · ${inr(amount)}/month`,
          actor_id: user?.id ?? null,
        }))
      );
    }
    setAdding(false);
    if (error) return toast.error(error.message);
    toast.success(`Added to ${ids.length} client${ids.length > 1 ? "s" : ""}`);
    setAddOpen(false);
    setAddForm({ fund_name: "", category: "", monthly_sip: "", rationale: "" });
    setAddClients({});
    load();
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5">
          <Link to="/admin/clients"><ArrowLeft className="h-4 w-4" /> Client book</Link>
        </Button>

        <Badge variant="secondary" className="gap-1.5 mb-3"><Lock className="h-3 w-3" /> Private · Advisor only</Badge>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Bulk SIP changes</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Step up SIP amounts across many clients or funds at once, or add one new scheme to several portfolios. Every
          change is written to each client's history.
        </p>

        <Tabs defaultValue="revise" className="mt-8">
          <TabsList>
            <TabsTrigger value="revise" className="gap-1.5"><Wand2 className="h-4 w-4" /> Revise amounts</TabsTrigger>
            <TabsTrigger value="add" className="gap-1.5"><Layers className="h-4 w-4" /> Add fund to many</TabsTrigger>
          </TabsList>

          {/* ---- Bulk revise ---- */}
          <TabsContent value="revise" className="mt-6 space-y-4">
            <Card className="p-5 grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Client</Label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clients</SelectItem>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="exited">Exited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-5 grid gap-4 sm:grid-cols-4 items-end bg-financial-muted/50">
              <div>
                <Label>Change</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase_pct">Increase by %</SelectItem>
                    <SelectItem value="increase_amt">Increase by ₹</SelectItem>
                    <SelectItem value="set_amt">Set to ₹</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{mode === "increase_pct" ? "Percentage" : "Amount (₹)"}</Label>
                <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <div>
                <Label>Round to nearest (₹)</Label>
                <Select value={roundTo} onValueChange={setRoundTo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">No rounding</SelectItem>
                    <SelectItem value="100">₹100</SelectItem>
                    <SelectItem value="500">₹500</SelectItem>
                    <SelectItem value="1000">₹1,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={applyBulk} disabled={applying || selectedFunds.length === 0} className="gap-2">
                <Wand2 className="h-4 w-4" />
                {applying ? "Applying…" : `Apply to ${selectedFunds.length || 0} selected`}
              </Button>
              {selectedFunds.length > 0 && (
                <p className="sm:col-span-4 text-xs text-muted-foreground">
                  Monthly total for selection: <span className="font-medium text-foreground">{inr(totalNow)}</span> →{" "}
                  <span className="font-semibold text-financial-gold">{inr(totalAfter)}</span>
                </p>
              )}
            </Card>

            <Card className="overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : visible.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No SIPs match these filters.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allVisibleSelected}
                          aria-label="Select all visible SIPs"
                          onCheckedChange={(c) => {
                            const next = { ...selected };
                            visible.forEach((f) => { next[f.id] = !!c; });
                            setSelected(next);
                          }}
                        />
                      </TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Fund</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Current SIP</TableHead>
                      <TableHead className="text-right">After change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((f) => {
                      const isSel = !!selected[f.id];
                      const next = preview(f.monthly_sip);
                      return (
                        <TableRow key={f.id} data-state={isSel ? "selected" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={isSel}
                              aria-label={`Select ${f.fund_name} for ${clientName(f.client_id)}`}
                              onCheckedChange={(c) => setSelected({ ...selected, [f.id]: !!c })}
                            />
                          </TableCell>
                          <TableCell className="text-sm">{clientName(f.client_id)}</TableCell>
                          <TableCell className="font-medium text-foreground">{f.fund_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{f.category || "—"}</TableCell>
                          <TableCell className="text-right">{inr(f.monthly_sip)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {isSel ? (
                              <span className={next > f.monthly_sip ? "text-financial-gold" : "text-foreground"}>{inr(next)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* ---- Add fund to many ---- */}
          <TabsContent value="add" className="mt-6">
            <Card className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Label>Fund name *</Label><Input value={addForm.fund_name} onChange={(e) => setAddForm({ ...addForm, fund_name: e.target.value })} placeholder="e.g. Parag Parikh Flexi Cap" /></div>
                <div>
                  <Label>Category</Label>
                  <Select value={addForm.category} onValueChange={(v) => setAddForm({ ...addForm, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Monthly SIP per client (₹)</Label><Input type="number" value={addForm.monthly_sip} onChange={(e) => setAddForm({ ...addForm, monthly_sip: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Why this fund</Label><Textarea rows={3} value={addForm.rationale} onChange={(e) => setAddForm({ ...addForm, rationale: e.target.value })} /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Clients</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const all = clients.every((c) => addClients[c.id]);
                      const next: Record<string, boolean> = {};
                      clients.forEach((c) => { next[c.id] = !all; });
                      setAddClients(next);
                    }}
                  >
                    Toggle all
                  </Button>
                </div>
                {clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No clients yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto rounded-md border border-border p-3">
                    {clients.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={!!addClients[c.id]}
                          onCheckedChange={(v) => setAddClients({ ...addClients, [c.id]: !!v })}
                        />
                        <span className="text-foreground">{c.full_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">· {c.risk_profile}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={applyAddFund} disabled={adding} className="gap-2">
                  <Plus className="h-4 w-4" /> {adding ? "Adding…" : "Add to selected clients"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

const AdminBulkSip = () => (
  <PageLayout>
    <AdminGuard>
      <AdminBulkSipInner />
    </AdminGuard>
  </PageLayout>
);

export default AdminBulkSip;
