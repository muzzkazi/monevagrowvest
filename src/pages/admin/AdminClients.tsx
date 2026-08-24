import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/shared/PageLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Lock, Plus, Search, Users, Wallet, Wand2, ShieldCheck, BrainCircuit } from "lucide-react";

type Client = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  risk_profile: string;
  monthly_investable: number | null;
  status: string;
  created_at: string;
};

const RISK = ["conservative", "moderate", "aggressive"];

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const PAGE_SIZE = 10;

const AdminClientsInner = () => {
  const { canEdit } = useIsAdmin();
  const [clients, setClients] = useState<Client[]>([]);
  const [sipTotals, setSipTotals] = useState<Record<string, number>>({});
  const [fundNames, setFundNames] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [scheme, setScheme] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", risk_profile: "moderate",
    monthly_income: "", monthly_investable: "", investment_horizon_years: "",
    occupation: "", city: "", notes: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: cs, error }, { data: funds }] = await Promise.all([
      supabase.from("clients").select("id, full_name, email, phone, risk_profile, monthly_investable, status, created_at").order("created_at", { ascending: false }),
      supabase.from("client_funds").select("client_id, fund_name, monthly_sip, status"),
    ]);
    if (error) toast.error("Could not load clients");
    setClients((cs as Client[]) ?? []);
    const totals: Record<string, number> = {};
    const names: Record<string, string[]> = {};
    (funds ?? []).forEach((f) => {
      names[f.client_id] = [...(names[f.client_id] ?? []), f.fund_name ?? ""];
      if (f.status !== "active") return;
      totals[f.client_id] = (totals[f.client_id] ?? 0) + Number(f.monthly_sip ?? 0);
    });
    setSipTotals(totals);
    setFundNames(names);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const s = scheme.trim().toLowerCase();
    return clients.filter((c) => {
      if (q && ![c.full_name, c.email, c.phone].some((v) => (v ?? "").toLowerCase().includes(q))) return false;
      if (s && !(fundNames[c.id] ?? []).some((n) => n.toLowerCase().includes(s))) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (riskFilter !== "all" && c.risk_profile !== riskFilter) return false;
      return true;
    });
  }, [clients, query, scheme, statusFilter, riskFilter, fundNames]);

  useEffect(() => { setPage(1); }, [query, scheme, statusFilter, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeFilters = (query ? 1 : 0) + (scheme ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (riskFilter !== "all" ? 1 : 0);

  const totalBook = Object.values(sipTotals).reduce((a, b) => a + b, 0);

  const createClient = async () => {
    if (!form.full_name.trim()) {
      toast.error("Client name is required");
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("clients").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      risk_profile: form.risk_profile,
      monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
      monthly_investable: form.monthly_investable ? Number(form.monthly_investable) : null,
      investment_horizon_years: form.investment_horizon_years ? Number(form.investment_horizon_years) : null,
      occupation: form.occupation.trim() || null,
      city: form.city.trim() || null,
      notes: form.notes.trim() || null,
      created_by: user?.id ?? null,
    }).select("id").maybeSingle();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      await supabase.from("client_activity_log").insert({
        client_id: data.id, action: "Client created",
        details: `${form.full_name.trim()} added to the client book`, actor_id: user?.id ?? null,
      });
    }
    toast.success("Client added");
    setOpen(false);
    setForm({ full_name: "", email: "", phone: "", risk_profile: "moderate", monthly_income: "", monthly_investable: "", investment_horizon_years: "", occupation: "", city: "", notes: "" });
    load();
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="gap-1.5">
            <Lock className="h-3 w-3" /> Private · Advisor only
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Client Book</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Log each client's profile, goals and risk, then design and maintain their monthly SIP portfolio.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/portfolio-intelligence"><BrainCircuit className="h-4 w-4" /> Portfolio Intelligence</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/bulk-sip"><Wand2 className="h-4 w-4" /> Bulk SIP changes</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/roles"><ShieldCheck className="h-4 w-4" /> Team & roles</Link>
          </Button>
          {canEdit && <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add client</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Full name *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Client name" />
                </div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div>
                  <Label>Risk profile</Label>
                  <Select value={form.risk_profile} onValueChange={(v) => setForm({ ...form, risk_profile: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RISK.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Horizon (years)</Label><Input type="number" value={form.investment_horizon_years} onChange={(e) => setForm({ ...form, investment_horizon_years: e.target.value })} /></div>
                <div><Label>Monthly income (₹)</Label><NumberInput value={form.monthly_income} onTextChange={(v0) => { const v = v0.replace(/,/g, ""); setForm({ ...form, monthly_income: v }); }} /></div>
                <div><Label>Monthly investable (₹)</Label><NumberInput value={form.monthly_investable} onTextChange={(v0) => { const v = v0.replace(/,/g, ""); setForm({ ...form, monthly_investable: v }); }} /></div>
                <div><Label>Occupation</Label><Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div className="sm:col-span-2">
                  <Label>Notes</Label>
                  <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything important about this client" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createClient} disabled={saving}>{saving ? "Saving…" : "Save client"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-financial-accent/10 text-financial-accent"><Users className="h-5 w-5" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{clients.length}</div>
              <div className="text-xs text-muted-foreground">Clients on record</div>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-financial-gold/10 text-financial-gold"><Wallet className="h-5 w-5" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{inr(totalBook)}</div>
              <div className="text-xs text-muted-foreground">Total monthly SIP under advice</div>
            </div>
          </Card>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Name, email or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Input placeholder="Scheme / fund name" value={scheme} onChange={(e) => setScheme(e.target.value)} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger><SelectValue placeholder="Risk profile" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk profiles</SelectItem>
              {RISK.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
          <span>{filtered.length} of {clients.length} clients{activeFilters > 0 ? ` · ${activeFilters} filter${activeFilters > 1 ? "s" : ""} applied` : ""}</span>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setScheme(""); setStatusFilter("all"); setRiskFilter("all"); }}>
              Clear filters
            </Button>
          )}
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {clients.length === 0
                ? "No clients yet. Add your first client to start building their plan."
                : "No clients match these filters."}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Monthly SIP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{c.full_name}</div>
                        <div className="text-xs text-muted-foreground">{c.email || c.phone || "—"}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{c.risk_profile}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{inr(sipTotals[c.id] ?? 0)}</TableCell>
                      <TableCell><span className="text-xs capitalize text-muted-foreground">{c.status}</span></TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/admin/clients/${c.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 p-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </section>
  );
};

const AdminClients = () => (
  <PageLayout>
    <AdminGuard allowAdvisor>
      <AdminClientsInner />
    </AdminGuard>
  </PageLayout>
);

export default AdminClients;
