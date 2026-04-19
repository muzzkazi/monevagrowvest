import { Navigate, useLocation } from "react-router-dom";

// Standalone SIP planner retired in favor of the unified AI Planning wizard.
// Preserves any existing query params (e.g., ELSS deep-link from Tax Planning).
const SIPBasedPlanning = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  params.set("mode", "sip");
  return <Navigate to={`/ai-planning?${params.toString()}`} replace />;
};

export default SIPBasedPlanning;
