const fs = require('fs');
let code = fs.readFileSync('/tmp/DataContext.tsx', 'utf-8');

const interfaceStart = code.indexOf('interface DataContextType {');
const interfaceEnd = code.indexOf('const DataContext = createContext');

const interfaceOriginal = code.slice(interfaceStart, interfaceEnd);

const interfaceReplacement = `interface DataStateContextType {
  isLoading: boolean;
  records: any[];
  filteredRecords: any[];
  schema: string[];
  targets: Record<string, number>;
  auditLog: AuditEntry[];
  uploadHistory: UploadSession[];
  globalBucket: string;
  canUndo: boolean;
  canRedo: boolean;
}

interface DataDispatchContextType {
  loadMainFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ rowCount: number }>;
  loadPaidFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number }>;
  loadAdditionalFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number; stats: any }>;
  loadCorrectedFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number }>;
  updateRecord: (agreementid: string, field: string, value: any, userName: string) => Promise<void>;
  bulkUpdateRecords: (updates: {agreementid: string, field: string, value: any}[], userName: string) => Promise<void>;
  setTarget: (key: string, pct: number, userName: string) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  setGlobalBucket: (val: string) => void;
}

interface DataContextType extends DataStateContextType, DataDispatchContextType {}

`;

code = code.replace(interfaceOriginal, interfaceReplacement);

const contextMatch = 'const DataContext = createContext<DataContextType | null>(null);';
const contextReplacement = `const DataStateContext = createContext<DataStateContextType | null>(null);
const DataDispatchContext = createContext<DataDispatchContextType | null>(null);`;
code = code.replace(contextMatch, contextReplacement);

const providerMatch = `<DataContext.Provider value={{ undo, redo, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0, isLoading, records, filteredRecords, schema, targets, auditLog, uploadHistory, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, bulkUpdateRecords, setTarget, globalBucket, setGlobalBucket }}>
      {children}
    </DataContext.Provider>`;
const providerReplacement = `<DataDispatchContext.Provider value={useMemo(() => ({ undo, redo, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, bulkUpdateRecords, setTarget, setGlobalBucket }), [undo, redo, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, bulkUpdateRecords, setTarget, setGlobalBucket])}>
      <DataStateContext.Provider value={{ canUndo: undoStack.length > 0, canRedo: redoStack.length > 0, isLoading, records, filteredRecords, schema, targets, auditLog, uploadHistory, globalBucket }}>
        {children}
      </DataStateContext.Provider>
    </DataDispatchContext.Provider>`;
code = code.replace(providerMatch, providerReplacement);

const hookMatch = `export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
};`;
const hookReplacement = `export const useDataState = () => {
  const ctx = useContext(DataStateContext);
  if (!ctx) throw new Error('useDataState must be inside DataProvider');
  return ctx;
};

export const useDataDispatch = () => {
  const ctx = useContext(DataDispatchContext);
  if (!ctx) throw new Error('useDataDispatch must be inside DataProvider');
  return ctx;
};

export const useData = () => {
  const state = useDataState();
  const dispatch = useDataDispatch();
  return { ...state, ...dispatch };
};`;
code = code.replace(hookMatch, hookReplacement);

fs.writeFileSync('src/contexts/DataContext.tsx', code);
