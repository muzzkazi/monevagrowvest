import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/shared/PageLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/admin/auditLog";
import { ArrowLeft, Lock, ScrollText, ShieldCheck, Trash2, UserPlus, Eye, Pencil } from "lucide-react";

type RoleRow = { id: string; user_id: string; role: string; created_at: string };
type Invite = { id: string; email: string; role: string; note: string | null; accepted_at: string | null; created_at: string };

const ROLE_INFO: Record<string, { label: string; blurb: string; icon: typeof Eye }> = {
  admin: { label: "Admin", blurb: "Full access — add and edit clients, portfolios, goals and manage team roles.", icon: Pencil },
  advisor: { label: "Advisor (read-only)", blurb: "Can view the client book, portfolios, goals and history, but cannot change anything.", icon: Eye },
};

const AdminRolesInner = () => {
  const { user } = useIsAdmin();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", role: "advisor", note: "" });

  const load = async () => {
    setLoading(true);
    const [{ data: rs, error }, { data: iv }] = await Promise.all([
      supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at"),
      supabase.from("team_invites").select("id, email, role, note, accepted_at, created_at").order("created_at", { ascending: false }),
    ]);
    if (error) toast.error("Could not load team roles");
    setRoles((rs as RoleRow[]) ?? []);
    setInvites((iv as Invite[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const invite = async () => {
    const email = form.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Enter a valid email address");
    setSaving(true);
    const { error } = await supabase.from("team_invites").insert({
      email,
      role: form.role,
      note: form.note.trim() || null,
      invited_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "That email is already invited" : error.message);
      return;
    }
    await logAdminAction("invite_created", `Advisor invite created for ${email}`, { role: form.role }, email);
    toast.success("Invite saved — the role is granted as soon as they sign up");
    setForm({ email: "", role: "advisor", note: "" });
    load();
  };

  const removeInvite = async (i: Invite) => {
    const { error } = await supabase.from("team_invites").delete().eq("id", i.id);
    if (error) return toast.error(error.message);
    await logAdminAction("invite_revoked", `Invite removed for ${i.email}`, { role: i.role }, i.email);
    toast.success("Invite removed");
    load();
  };

  const revoke = async (r: RoleRow) => {
    if (r.user_id === user?.id && r.role === "admin") {
      return toast.error("You cannot revoke your own admin access");
    }
    const { error } = await supabase.from("user_roles").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Access revoked");
    load();
  };

  const shortId = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5">
          <Link to="/admin/clients"><ArrowLeft className="h-4 w-4" /> Client book</Link>
        </Button>

        <Badge variant="secondary" className="gap-1.5 mb-3"><Lock className="h-3 w-3" /> Private · Admin only</Badge>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Team & permissions</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Invite colleagues by email and choose how much they can do. Access is enforced in the database, not just in the
          interface.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {Object.entries(ROLE_INFO).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <Card key={key} className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-md bg-financial-accent/10 text-financial-accent"><Icon className="h-4 w-4" /></span>
                  <span className="font-semibold text-foreground">{info.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{info.blurb}</p>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 mt-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-financial-gold" /> Invite a team member
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="colleague@example.com" />
            </div>
            <div>
              <Label>Permission level</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="advisor">Advisor (read-only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Label>Note (optional)</Label>
              <Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Who they are and why they need access" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={invite} disabled={saving} className="gap-2">
              <UserPlus className="h-4 w-4" /> {saving ? "Saving…" : "Send invite"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            The invited person signs up at <span className="font-medium text-foreground">/auth</span> with this exact email
            and receives read-only advisor access automatically on their first sign-in. Admin access is locked to the
            owner account and cannot be granted to any other email.
          </p>
        </Card>

        <h2 className="font-semibold text-foreground mt-10 mb-3">Pending & accepted invites</h2>
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : invites.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No invites yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{i.email}</div>
                      {i.note && <div className="text-xs text-muted-foreground">{i.note}</div>}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{i.role}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {i.accepted_at ? `Accepted ${new Date(i.accepted_at).toLocaleDateString("en-IN")}` : "Pending sign-up"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => removeInvite(i)} aria-label={`Remove invite for ${i.email}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <h2 className="font-semibold text-foreground mt-10 mb-3">Active access</h2>
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No roles granted yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">
                      <span className="font-medium text-foreground">{shortId(r.user_id)}</span>
                      {r.user_id === user?.id && <span className="text-xs text-muted-foreground"> · you</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.role === "admin" ? "default" : "outline"} className="capitalize gap-1">
                        {r.role === "admin" && <ShieldCheck className="h-3 w-3" />} {r.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => revoke(r)}>Revoke</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </section>
  );
};

const AdminRoles = () => (
  <PageLayout>
    <AdminGuard>
      <AdminRolesInner />
    </AdminGuard>
  </PageLayout>
);

export default AdminRoles;
