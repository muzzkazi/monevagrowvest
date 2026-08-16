import { Link } from "react-router-dom";
import { ShieldAlert, Eye, LogIn, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Shown when a signed-out visitor or a non-owner (advisor / no role) account
 * opens any /admin/* route. Admin access is locked to the owner account.
 */
const AdminAccessDenied = ({
  email,
  isAdvisor = false,
  signedIn = false,
}: {
  email?: string | null;
  isAdvisor?: boolean;
  signedIn?: boolean;
}) => (
  <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <Card className="max-w-lg w-full p-8 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-serif font-bold text-foreground">Access denied</h1>

      {!signedIn ? (
        <p className="mt-3 text-sm text-muted-foreground">
          This is a private advisor console. Sign in with the owner account to continue.
        </p>
      ) : isAdvisor ? (
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> has read-only advisor access.
          Editing clients, portfolios and team roles is restricted to the owner account.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> does not have access to the
          advisor console. Admin access is locked to the owner account and cannot be granted to other
          email addresses.
        </p>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        This attempt is recorded in the admin audit trail.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {!signedIn && (
          <Button asChild className="gap-2">
            <Link to="/auth">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          </Button>
        )}
        {isAdvisor && (
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/clients">
              <Eye className="h-4 w-4" /> Open read-only client book
            </Link>
          </Button>
        )}
        <Button asChild variant="ghost" className="gap-2">
          <Link to="/">
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </Button>
      </div>
    </Card>
  </main>
);

export default AdminAccessDenied;
