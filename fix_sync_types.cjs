const fs = require('fs');

let code = fs.readFileSync('src/lib/sync/types.ts', 'utf-8');

code = code.replace(/data: any;/g, "data: Record<string, unknown>;");
code = code.replace(/oldVal: any;/g, "oldVal: unknown;");
code = code.replace(/newVal: any/g, "newVal: unknown");
code = code.replace(/localVal: any;/g, "localVal: unknown;");
code = code.replace(/remoteVal: any;/g, "remoteVal: unknown;");
code = code.replace(/localData: any;/g, "localData: Record<string, unknown>;");
code = code.replace(/remoteData: any;/g, "remoteData: Record<string, unknown>;");
code = code.replace(/resolvedData\?: any;/g, "resolvedData?: Record<string, unknown>;");
code = code.replace(/payload: any;/g, "payload: unknown;");

fs.writeFileSync('src/lib/sync/types.ts', code);
