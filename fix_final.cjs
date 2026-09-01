const fs = require('fs');

let code = fs.readFileSync('src/components/attendance/ShiftAttendanceCard.tsx', 'utf-8');
code = code.replace(/catch \(err: any\)/g, "catch (err: unknown)");
fs.writeFileSync('src/components/attendance/ShiftAttendanceCard.tsx', code);

code = fs.readFileSync('src/lib/repositories/userRepository.ts', 'utf-8');
code = code.replace(/\(existing as any\)/g, "(existing as Record<string, unknown>)");
code = code.replace(/\} as any;/g, "} as import('../../types/domain').User;");
code = code.replace(/\(userToSave as any\)/g, "(userToSave as Record<string, unknown>)");
fs.writeFileSync('src/lib/repositories/userRepository.ts', code);

code = fs.readFileSync('src/lib/__tests__/integrityChecker.test.ts', 'utf-8');
code = code.replace(/as any/g, "as import('../types/domain').LoanRecord");
fs.writeFileSync('src/lib/__tests__/integrityChecker.test.ts', code);
