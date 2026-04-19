import { Navigate } from "react-router-dom";

// Standalone goal planner retired in favor of the unified AI Planning wizard.
const GoalBasedPlanning = () => <Navigate to="/ai-planning?mode=goals" replace />;

export default GoalBasedPlanning;
