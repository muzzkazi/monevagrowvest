import { it } from "vitest";
import { generateRunPdf } from "@/lib/pi/runPdf";
import { readRunPdfKeywords } from "@/lib/pi/pdfMetadata";
import { runEngine } from "@/lib/pi/engine";
import { engineInput, funds } from "@/lib/pi/__tests__/fixtures";
it("dbg", () => {
  const doc = generateRunPdf({ runName: "X", runId: "r1", versionId: "v1", versionNo: 3, clientId: "c1", inputs: { ...engineInput, funds } as never, assumedReturnPct: 11, output: runEngine(engineInput), save: false });
  const raw = new TextDecoder("latin1").decode(new Uint8Array(doc.output("arraybuffer") as ArrayBuffer));
  console.log("KW:", JSON.stringify(readRunPdfKeywords(raw)));
  console.log("SLICE:", JSON.stringify(raw.slice(raw.indexOf("/Keywords") - 200, raw.indexOf("/Keywords") + 400)));
});
