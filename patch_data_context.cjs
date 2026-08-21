const fs = require('fs');
const file = 'src/contexts/DataContext.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { useAuth }')) {
  content = content.replace(
    "import { db, AuditEntry, UploadSession } from '../lib/db';",
    "import { db, AuditEntry, UploadSession } from '../lib/db';\nimport { useAuth } from './AuthContext';"
  );
}

// Modify DataProvider
content = content.replace(
  "export function DataProvider({ children }: { children: ReactNode }) {",
  "export function DataProvider({ children }: { children: ReactNode }) {\n  const { user } = useAuth();"
);

// We need to intercept the exposed records. But we shouldn't rename `records` everywhere.
// Instead, we can create an `exposedRecords` memo and pass that down in the provider value.
const exposedRecordsMemo = `
  const exposedRecords = useMemo(() => {
    if (!user) return records; // Or [] but usually records is fine or empty anyway
    if (user.role === 'EXECUTIVE') {
      const uName = String(user.name).trim().toLowerCase();
      return records.filter(r => {
        const execName = String(r.executive_name || r['Executive Name'] || r.EXECUTIVE_NAME || '').trim().toLowerCase();
        return execName === uName;
      });
    }
    return records;
  }, [records, user]);
`;

content = content.replace(
  "const [records, setRecords] = useState<any[]>([]);",
  `const [records, setRecords] = useState<any[]>([]);\n${exposedRecordsMemo}`
);

// Modify value passed to Provider
content = content.replace(
  "value={{ undo, redo, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0,  isLoading, records, schema",
  "value={{ undo, redo, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0,  isLoading, records: exposedRecords, schema"
);

fs.writeFileSync(file, content);
console.log('DataContext patched');
