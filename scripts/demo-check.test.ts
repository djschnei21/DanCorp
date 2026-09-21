import { describe, expect, it } from "vitest";
import { evaluateReport } from "./demo-check.mjs";

describe("evaluateReport", () => {
  it("accepts the known delay failure and nothing else", () => {
    const summary = evaluateReport({
      testResults: [
        {
          assertionResults: [
            { title: "sorts the board by window", status: "passed" },
            { title: "delayed missions are not on time", status: "failed" },
          ],
        },
      ],
    });
    expect(summary.ok).toBe(true);
  });

  it("rejects a green suite", () => {
    const summary = evaluateReport({
      testResults: [
        {
          assertionResults: [{ title: "delayed missions are not on time", status: "passed" }],
        },
      ],
    });
    expect(summary.ok).toBe(false);
  });

  it("rejects an extra failure", () => {
    const summary = evaluateReport({
      testResults: [
        {
          assertionResults: [
            { title: "sorts the board by window", status: "failed" },
            { title: "delayed missions are not on time", status: "failed" },
          ],
        },
      ],
    });
    expect(summary.ok).toBe(false);
    expect(summary.failed).toEqual(["sorts the board by window", "delayed missions are not on time"]);
  });
});
