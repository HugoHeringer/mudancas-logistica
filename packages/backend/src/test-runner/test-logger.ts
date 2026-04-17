import * as fs from 'fs';
import * as path from 'path';
import { TestRunLog, TestSuiteResult } from './types';

const LOG_DIR = path.join(__dirname, '..', '..', 'test-logs');
const LOG_FILE = path.join(LOG_DIR, 'test-run.json');

export class TestLogger {
  private log: TestRunLog;

  constructor() {
    this.log = this.loadExistingLog() || this.createNewLog();
  }

  private createNewLog(): TestRunLog {
    return {
      runId: `run-${Date.now()}`,
      startedAt: new Date().toISOString(),
      status: 'running',
      suites: [],
    };
  }

  private loadExistingLog(): TestRunLog | null {
    try {
      if (fs.existsSync(LOG_FILE)) {
        const raw = fs.readFileSync(LOG_FILE, 'utf-8');
        const log: TestRunLog = JSON.parse(raw);
        if (log.status === 'running' || log.status === 'interrupted') {
          return log;
        }
      }
    } catch {
      // ignore parse errors, start fresh
    }
    return null;
  }

  getLog(): TestRunLog {
    return this.log;
  }

  isSuiteCompleted(suiteName: string): boolean {
    return this.log.suites.some((s) => s.suite === suiteName && s.finishedAt != null);
  }

  getCompletedSuiteNames(): string[] {
    return this.log.suites.filter((s) => s.finishedAt != null).map((s) => s.suite);
  }

  addSuiteResult(result: TestSuiteResult): void {
    // Replace if suite already exists (re-run), otherwise append
    const idx = this.log.suites.findIndex((s) => s.suite === result.suite);
    if (idx >= 0) {
      this.log.suites[idx] = result;
    } else {
      this.log.suites.push(result);
    }
    this.persist();
  }

  markInterrupted(): void {
    this.log.status = 'interrupted';
    this.log.finishedAt = new Date().toISOString();
    this.recalculateSummary();
    this.persist();
  }

  markCompleted(): void {
    this.log.status = 'completed';
    this.log.finishedAt = new Date().toISOString();
    this.recalculateSummary();
    this.persist();
  }

  private recalculateSummary(): void {
    const suites = this.log.suites.filter((s) => s.finishedAt != null);
    this.log.summary = {
      totalSuites: suites.length,
      totalTests: suites.reduce((a, s) => a + s.totalTests, 0),
      passed: suites.reduce((a, s) => a + s.passed, 0),
      failed: suites.reduce((a, s) => a + s.failed, 0),
      skipped: suites.reduce((a, s) => a + s.skipped, 0),
      errors: suites.reduce((a, s) => a + s.errors, 0),
      durationMs: suites.reduce((a, s) => a + s.durationMs, 0),
    };
  }

  private persist(): void {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    fs.writeFileSync(LOG_FILE, JSON.stringify(this.log, null, 2), 'utf-8');
  }

  reset(): void {
    this.log = this.createNewLog();
    this.persist();
  }
}
