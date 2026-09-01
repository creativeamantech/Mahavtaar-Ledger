const fs = require('fs');

let code = fs.readFileSync('src/lib/sync/crdtEngine.ts', 'utf-8');

code = code.replace(/mergedData: any;/g, "mergedData: Record<string, unknown>;");
code = code.replace(/localData: any/g, "localData: Record<string, unknown>");
code = code.replace(/remoteData: any/g, "remoteData: Record<string, unknown>");
code = code.replace(/currentLocalRecord: any,/g, "currentLocalRecord: Record<string, unknown>,");
code = code.replace(/customMergedData\?: any,/g, "customMergedData?: Record<string, unknown>,");
code = code.replace(/finalData: any;/g, "finalData: Record<string, unknown>;");
code = code.replace(/\(db as any\)/g, "(db as Record<string, import('dexie').Table<unknown, unknown>>)");

fs.writeFileSync('src/lib/sync/crdtEngine.ts', code);
