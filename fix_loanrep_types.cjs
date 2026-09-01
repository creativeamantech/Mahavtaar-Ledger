const fs = require('fs');

let code = fs.readFileSync('src/lib/repositories/loanRepository.ts', 'utf-8');

code = code.replace(/\(user as any\)/g, "(user as Record<string, unknown>)");
code = code.replace(/catch \(err: any\)/g, "catch (err: unknown)");
code = code.replace(/\(lastAudit as any\)/g, "(lastAudit as Record<string, unknown>)");
code = code.replace(/oldVal: any/g, "oldVal: unknown");
code = code.replace(/newVal: any/g, "newVal: unknown");
code = code.replace(/as any \)/g, "as unknown )");
code = code.replace(/as any\)/g, "as unknown)");

fs.writeFileSync('src/lib/repositories/loanRepository.ts', code);
