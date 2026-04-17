export type TestStatus = 'pass' | 'fail' | 'skip' | 'error';

export interface TestCaseResult {
  name: string;
  status: TestStatus;
  durationMs: number;
  error?: string;
  details?: any;
}

export interface TestSuiteResult {
  suite: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  tests: TestCaseResult[];
}

export interface TestRunLog {
  runId: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'completed' | 'interrupted';
  suites: TestSuiteResult[];
  summary?: {
    totalSuites: number;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
    durationMs: number;
  };
}
