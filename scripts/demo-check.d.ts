export const KNOWN_FAILURE: string;

export function evaluateReport(report: {
  testResults?: Array<{
    assertionResults?: Array<{ title: string; status: string }>;
  }>;
}): { ok: boolean; failed: string[]; passed: number; total: number };

export function checkGitBaseline(): number;

export function checkDemoBaseline(): number;
