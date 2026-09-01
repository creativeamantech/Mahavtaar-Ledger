const fs = require('fs');

let code = fs.readFileSync('src/lib/pivots.ts', 'utf-8');

code = code.replace(/export interface TeamPivotRow \{/, `export interface BucketCityPivotRow {
  bkt: string | number;
  city: string;
  collection: number;
  count: number;
  totalPOS: number;
  paid: number;
  paidPOS: number;
  posPaidOnlyCount: number;
  posPaidOnlyPOS: number;
  targetPOS: number;
  targetDate?: string;
  target: number;
  pct: number;
  dailyRequiredPOS: number;
  cases: any[];
}

export interface ExecCityPivotRow {
  bkt: string | number;
  city: string;
  collection: number;
  count: number;
  totalPOS: number;
  paid: number;
  paidPOS: number;
  posPaidOnlyCount: number;
  posPaidOnlyPOS: number;
  targetPOS: number;
  targetDate?: string;
  target: number;
  pct: number;
  dailyRequiredPOS: number;
  cases: any[];
}

export interface TeamPivotRow {`);

code = code.replace(/export function buildBucketCityPivot.*\{/, `export function buildBucketCityPivot(records: LoanRecord[], targets: Record<string, number> = {}): BucketCityPivotRow[] {`);
code = code.replace(/const map: Record<string, unknown> = \{\};/, `const map: Record<string, any> = {};`);

fs.writeFileSync('src/lib/pivots.ts', code);
