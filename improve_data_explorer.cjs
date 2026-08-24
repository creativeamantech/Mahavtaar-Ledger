const fs = require('fs');

const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add bulk update imports and Checkbox
if (!content.includes('import { Checkbox } from')) {
    content = content.replace("import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';", "import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';\nimport { Checkbox } from '../components/ui/checkbox';");
}
if (!content.includes("import { Save, CheckCircle2, ChevronRight, LayoutTemplate } from 'lucide-react';")) {
    content = content.replace("import { Filter, Database, Search, Download, Columns, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';", "import { Filter, Database, Search, Download, Columns, Plus, X, ArrowUp, ArrowDown, Save, CheckCircle2, ChevronRight, LayoutTemplate } from 'lucide-react';");
}

// 2. Add selectedCases and savedViews states
const stateInjectionPoint = "const [columnFilterSearches, setColumnFilterSearches] = useState<Record<string, string>>({});";
const addedStates = `
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [bulkAssignExec, setBulkAssignExec] = useState<string>('');
  const [savedViews, setSavedViews] = useState<any[]>(() => {
    const saved = localStorage.getItem('dataExplorerSavedViews');
    return saved ? JSON.parse(saved) : [];
  });
`;
content = content.replace(stateInjectionPoint, stateInjectionPoint + '\n' + addedStates);

// 3. Extract bulkUpdateRecords from useData
content = content.replace("const { records: baseRecords, schema, globalBucket } = useData();", "const { records: baseRecords, schema, globalBucket, bulkUpdateRecords } = useData();");
content = content.replace("const { user } = useAuth();", "const { user } = useAuth();\n  const { user: authUser } = useAuth();");

// 4. Update the thead to have a checkbox column
content = content.replace(
    `<th className="sticky left-0 top-0 z-30 bg-muted border-r border-border px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>`,
    `<th className="sticky left-0 top-0 z-30 bg-muted border-r border-border px-2 py-2 w-10">
        <Checkbox 
          checked={paginatedRecords.length > 0 && paginatedRecords.every((r:any) => selectedCases.has(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID))}
          onCheckedChange={(c) => {
            if (c) {
                const all = new Set(selectedCases);
                paginatedRecords.forEach((r:any) => all.add(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID));
                setSelectedCases(all);
            } else {
                const remaining = new Set(selectedCases);
                paginatedRecords.forEach((r:any) => remaining.delete(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID));
                setSelectedCases(remaining);
            }
          }}
        />
     </th>
     <th className="sticky left-10 top-0 z-30 bg-muted border-r border-border px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>`
);

// 5. Update tbody to have checkbox
content = content.replace(
    `<td className="sticky left-0 z-10 bg-card border-r border-border px-2 py-1.5 text-primary font-bold cursor-pointer hover:underline" onClick={() => handleRowClick(r)}>{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'}</td>`,
    `<td className="sticky left-0 z-10 bg-card border-r border-border px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={selectedCases.has(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID)}
          onCheckedChange={(c) => {
             const n = new Set(selectedCases);
             const id = r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID;
             if (c) n.add(id); else n.delete(id);
             setSelectedCases(n);
          }}
        />
     </td>
     <td className="sticky left-10 z-10 bg-card border-r border-border px-2 py-1.5 text-primary font-bold cursor-pointer hover:underline" onClick={() => handleRowClick(r)}>{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'}</td>`
);

// 6. ColSpan fix for empty state
content = content.replace(
    `<td colSpan={11 + (visibleExtraColumns || []).length}`,
    `<td colSpan={12 + (visibleExtraColumns || []).length}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done Checkboxes');
