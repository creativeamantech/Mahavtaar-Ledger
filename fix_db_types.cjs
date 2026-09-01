const fs = require('fs');

let code = fs.readFileSync('src/lib/db.ts', 'utf-8');

code = code.replace(/\[key: string\]: any;/g, "[key: string]: unknown;");
code = code.replace(/data: any;/g, "data: Record<string, unknown>;");
code = code.replace(/diff\?: any;/g, "diff?: Record<string, unknown>;");
code = code.replace(/localData: any;/g, "localData: Record<string, unknown>;");
code = code.replace(/remoteData: any;/g, "remoteData: Record<string, unknown>;");
code = code.replace(/localVal: any;/g, "localVal: unknown;");
code = code.replace(/remoteVal: any;/g, "remoteVal: unknown;");
code = code.replace(/resolvedData\?: any;/g, "resolvedData?: Record<string, unknown>;");
code = code.replace(/value: any;/g, "value: unknown;");
code = code.replace(/catch \(err: any\)/g, "catch (err: unknown)");

fs.writeFileSync('src/lib/db.ts', code);
