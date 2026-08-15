import { Link } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

/**
 * Advisor-only route guard SCAFFOLD.
 *
 * Intentionally minimal: it only checks that a logged-in user context exists.
 * Full authentication/authorisation is not implemented here — the real
 * enforcement stays in the database RLS policies on the client tables.
 *
 * requireRole (default false) opts a route into the stricter admin/advisor role
 * check that the existing AdminGuard performs, so this scaffold can be tightened
 * route-by-route later without touching page code.
 */
const AdvisorRouteGuard = ({
  children,
  requireRole = false,
  allowAdvisor = true,
}: {
  children: React.ReactNode;
  requireRole?: boolean;
  allowAdvisor?: boolean;
}) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isTeam, loading: roleLoading } = useIsAdmin();

  const loading = requireRole ? roleLoading : authLoading;
  const sessionPresent = Boolean(user);
  const roleOk = allowAdvisor ? isTeam : isAdmin;
  const allowed = sessionPresent && (!requireRole || roleOk);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-financial-accent" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Advisor sign-in required</h1>
          <p className="text-sm text-muted-foreground">
            {sessionPresent
              ? "This account does not have advisor access yet."
              : "This tool is only available inside a signed-in advisor session."}
          </p>
          {!sessionPresent && (
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdvisorRouteGuard;
