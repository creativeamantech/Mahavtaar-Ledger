const fs = require('fs');

let code = fs.readFileSync('src/lib/sync/syncEngine.ts', 'utf-8');
code = code.replace(/type: any, metadata\?: any/g, "type: string, metadata?: Record<string, unknown>");
code = code.replace(/\(db as any\)/g, "(db as Record<string, import('dexie').Table<unknown, unknown>>)");
code = code.replace(/data: any\)/g, "data: Record<string, unknown>)");
code = code.replace(/catch \(err: any\)/g, "catch (err: unknown)");
fs.writeFileSync('src/lib/sync/syncEngine.ts', code);

code = fs.readFileSync('src/lib/sync/journal.ts', 'utf-8');
code = code.replace(/data: any\)/g, "data: Record<string, unknown>)");
code = code.replace(/data: any,/g, "data: Record<string, unknown>,");
code = code.replace(/oldVal: any/g, "oldVal: unknown");
code = code.replace(/newVal: any/g, "newVal: unknown");
fs.writeFileSync('src/lib/sync/journal.ts', code);
