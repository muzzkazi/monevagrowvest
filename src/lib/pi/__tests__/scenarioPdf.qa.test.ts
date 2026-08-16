import { describe, it } from "vitest";
import { writeFileSync } from "fs";
import { runEngine } from "../engine";
import { runStressTest } from "../stress";
import { generateScenarioPdf } from "../scenarioPdf";
import { engineInput, FIXED_NOW } from "./fixtures";

describe("scenario pdf qa", () => {
  it("writes a sample pdf", () => {
    const allocation = runEngine(engineInput).allocation;
    const stress = runStressTest({
      allocation,
      portfolioValue: 2600000,
      monthlySip: 43000,
      nearestEssentialGoalYears: 8,
      now: FIXED_NOW,
    });
    const doc = generateScenarioPdf(
      stress,
      { clientName: "Test Client", runName: "QA run", runId: "run-1", versionId: "v-1" },
      { save: false },
    );
    writeFileSync("/tmp/qa/scenarios.pdf", Buffer.from(doc.output("arraybuffer")));
  });
});
