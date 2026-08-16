import { Loader2 } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import AdminAccessDenied from "@/pages/admin/AdminAccessDenied";

/**
 * Wraps admin-only routes. The real protection is the RLS policies on the
 * client tables — this only controls what the UI renders.
 *
 * allowAdvisor: also let read-only advisor accounts through.
 */
const AdminGuard = ({
  children,
  allowAdvisor = false,
}: {
  children: React.ReactNode;
  allowAdvisor?: boolean;
}) => {
  const { isAdmin, isAdvisor, isTeam, loading, user } = useIsAdmin();
  const allowed = allowAdvisor ? isTeam : isAdmin;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-financial-accent" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <AdminAccessDenied
        email={user?.email}
        signedIn={!!user}
        isAdvisor={!!user && isAdvisor && !isAdmin}
      />
    );
  }

  return <>{children}</>;
};

export default AdminGuard;

