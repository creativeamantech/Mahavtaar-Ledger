import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { parseMainFile, parsePaidFile, mergePaidIntoRecords, parseAdditionalFile, mergeAdditionalIntoRecords, parseCorrectedFile, mergeCorrectedIntoRecords } from '../lib/fileParser';
import { db, AuditEntry, UploadSession } from '../lib/db';
import { useAuth } from './AuthContext';

interface DataContextType {
  isLoading: boolean;
  records: any[];
  schema: string[];
  targets: Record<string, number>;
  auditLog: AuditEntry[];
  uploadHistory: UploadSession[];
  loadMainFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ rowCount: number }>;
  loadPaidFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number }>;
  loadAdditionalFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number; stats: any }>;
  loadCorrectedFile: (buffer: ArrayBuffer, fileName: string, userName: string) => Promise<{ matched: number; total: number }>;
  updateRecord: (agreementid: string, field: string, value: any, userName: string) => Promise<void>;
  bulkUpdateRecords: (updates: {agreementid: string, field: string, value: any}[], userName: string) => Promise<void>;
  setTarget: (key: string, pct: number, userName: string) => Promise<void>;
  globalBucket: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  setGlobalBucket: (val: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);

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

  const [schema, setSchema] = useState<string[]>([]);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadSession[]>([]);
  const [globalBucket, setGlobalBucket] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  
  const [undoStack, setUndoStack] = useState<{type: string, audits: AuditEntry[]}[]>([]);
  const [redoStack, setRedoStack] = useState<{type: string, audits: AuditEntry[]}[]>([]);

  useEffect(() => {
    if (records.length > 0) {
      const keys = new Set<string>();
      // To prevent extreme lag on 100k rows, we sample the first 500 rows. In CSV imports, columns are uniform.
      // But let's actually scan all of them because the user requested it. We'll use a fast loop.
      for (let i = 0; i < records.length; i++) {
        const keysArray = Object.keys(records[i]);
        for (let j = 0; j < keysArray.length; j++) {
          keys.add(keysArray[j]);
        }
      }
      setSchema(Array.from(keys).sort());
    } else {
      setSchema([]);
    }
  }, [records]);

  // Load from Dexie on mount
  useEffect(() => {
    async function loadData() {
      // 1. Migrate legacy localStorage targets if present
      try {
        const savedTargetsStr = localStorage.getItem('app_targets');
        if (savedTargetsStr) {
          const savedTargets = JSON.parse(savedTargetsStr);
          for (const [key, pct] of Object.entries(savedTargets)) {
            // Check if it already exists in Dexie so we don't overwrite newer changes
            const existing = await db.state_targets.get(key);
            if (!existing) {
              await db.state_targets.put({ key, pct: Number(pct), updatedAt: new Date().toISOString() });
            }
          }
          // Intentionally NOT deleting from localStorage, just stop reading it as primary
        }
      } catch (err) {
        console.error("Migration error:", err);
      }

      // 2. Load targets from Dexie
      try {
        const dbTargets = await db.state_targets.toArray();
        const targetsMap = dbTargets.reduce((acc, t) => {
          acc[t.key] = t.pct;
          return acc;
        }, {} as Record<string, number>);
        setTargets(targetsMap);
        
        // 3. Load records
        const dbRecords = await db.loan_records.toArray();
        setRecords(dbRecords);
        
        // 4. Load history and audit logs
        const dbUploads = await db.upload_sessions.orderBy('createdAt').reverse().toArray();
        setUploadHistory(dbUploads);
        
        const dbAudit = await db.audit_log.orderBy('createdAt').reverse().toArray();
        setAuditLog(dbAudit);
      } catch (err) {
        console.error("Dexie Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const loadMainFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const parsed = parseMainFile(buffer);
    setRecords(parsed);
    const entry = { id: crypto.randomUUID(), type: 'MAIN_DATA', fileName, recordCount: parsed.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    await db.loan_records.bulkPut(parsed);
    await db.upload_sessions.put(entry);
    
    return { rowCount: parsed.length };
  }, []);

  const loadPaidFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const paidRows = parsePaidFile(buffer);
    let matched = 0;
    let mergedData: any[] = [];
    
    setRecords(prev => {
      mergedData = mergePaidIntoRecords(prev, paidRows);
      matched = paidRows.filter(p => prev.some(r => r.agreementid === p.agreementid)).length;
      return mergedData;
    });
    
    const entry = { id: crypto.randomUUID(), type: 'PAID_FILE', fileName, recordCount: paidRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    // Use bulkPut to update the matched records
    await db.loan_records.bulkPut(mergedData);
    await db.upload_sessions.put(entry);
    
    return { matched, total: paidRows.length }; 
  }, []);

  const loadAdditionalFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const additionalRows = parseAdditionalFile(buffer);
    let matched = 0;
    let finalStats: any = {};
    let mergedData: any[] = [];
    
    setRecords(prev => {
      const { merged, stats } = mergeAdditionalIntoRecords(prev, additionalRows);
      mergedData = merged;
      matched = additionalRows.filter(p => prev.some(r => r.agreementid === p.agreementid)).length;
      finalStats = stats;
      return merged;
    });
    
    const entry = { id: crypto.randomUUID(), type: 'ADDITIONAL_COLLECTION_FILE', fileName, recordCount: additionalRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    await db.loan_records.bulkPut(mergedData);
    await db.upload_sessions.put(entry);
    
    return { matched, total: additionalRows.length, stats: finalStats };
  }, []);

  const loadCorrectedFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const correctedRows = parseCorrectedFile(buffer);
    let matchCount = 0;
    let mergedData: any[] = [];
    
    setRecords(prev => {
      const { merged, matched } = mergeCorrectedIntoRecords(prev, correctedRows);
      mergedData = merged;
      matchCount = matched;
      return merged;
    });
    
    const entry = { id: crypto.randomUUID(), type: 'CORRECTED_DAC_FILE', fileName, recordCount: correctedRows.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    await db.loan_records.bulkPut(mergedData);
    await db.upload_sessions.put(entry);
    
    return { matched: matchCount, total: correctedRows.length };
  }, []);

  const updateRecord = useCallback(async (agreementid: string, field: string, value: any, userName: string) => {
    let oldVal = '';
    
    setRecords(prev => prev.map(r => {
      if (r.agreementid === agreementid) {
        oldVal = String(r[field] ?? '');
        return { ...r, [field]: value, [`${field}_source`]: 'MANUAL' };
      }
      return r;
    }));
    
    const audit = {
      id: crypto.randomUUID(),
      agreementid,
      field,
      oldValue: oldVal,
      newValue: String(value),
      changedBy: userName,
      createdAt: new Date().toISOString(),
      source: 'MANUAL',
    };
    
    setAuditLog(a => [audit, ...a]);
    
    await db.loan_records.update(agreementid, { [field]: value, [`${field}_source`]: 'MANUAL' });
    await db.audit_log.put(audit);
    setUndoStack(prev => [...prev, { type: 'UPDATE', audits: [audit] }]);
    setRedoStack([]);
  }, []);


  const bulkUpdateRecords = useCallback(async (updates: {agreementid: string, field: string, value: any}[], userName: string) => {
    let newAudits: AuditEntry[] = [];
    const updateMap = new Map();
    
    updates.forEach(u => {
      if (!updateMap.has(u.agreementid)) {
        updateMap.set(u.agreementid, {});
      }
      updateMap.get(u.agreementid)[u.field] = u.value;
      updateMap.get(u.agreementid)[`${u.field}_source`] = 'MANUAL';
    });

    let updatedRecords: any[] = [];

    setRecords(prev => {
      const next = prev.map(r => {
        if (updateMap.has(r.agreementid)) {
          const u = updateMap.get(r.agreementid);
          
          Object.keys(u).forEach(key => {
            if (!key.endsWith('_source')) {
              newAudits.push({
                id: crypto.randomUUID(),
                agreementid: r.agreementid,
                field: key,
                oldValue: String(r[key] ?? ''),
                newValue: String(u[key]),
                changedBy: userName,
                createdAt: new Date().toISOString(),
                source: 'MANUAL',
              });
            }
          });
          
          updatedRecords.push({ ...r, ...u });
          return { ...r, ...u };
        }
        return r;
      });
      return next;
    });

    setAuditLog(a => [...newAudits, ...a]);

    await db.loan_records.bulkPut(updatedRecords);
    await db.audit_log.bulkPut(newAudits);
    setUndoStack(prev => [...prev, { type: 'BULK_UPDATE', audits: newAudits }]);
    setRedoStack([]);
  }, []);

  const setTarget = useCallback(async (key: string, pct: number, _userName: string) => {
    setTargets(prev => ({ ...prev, [key]: pct }));
    await db.state_targets.put({ key, pct, updatedAt: new Date().toISOString() });
  }, []);

  
  const undo = useCallback(async () => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, action]);

    let updatedRecords: any[] = [];
    const updateMap = new Map();
    action.audits.forEach(a => {
      if (!updateMap.has(a.agreementid)) updateMap.set(a.agreementid, {});
      updateMap.get(a.agreementid)[a.field] = a.oldValue;
      updateMap.get(a.agreementid)[`${a.field}_source`] = 'UNDO'; // Mark as undone
    });

    setRecords(prev => {
      return prev.map(r => {
        if (updateMap.has(r.agreementid)) {
          const u = updateMap.get(r.agreementid);
          const next = { ...r, ...u };
          updatedRecords.push(next);
          return next;
        }
        return r;
      });
    });

    if (updatedRecords.length > 0) {
      await db.loan_records.bulkPut(updatedRecords);
    }
  }, [undoStack]);

  const redo = useCallback(async () => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);

    let updatedRecords: any[] = [];
    const updateMap = new Map();
    action.audits.forEach(a => {
      if (!updateMap.has(a.agreementid)) updateMap.set(a.agreementid, {});
      updateMap.get(a.agreementid)[a.field] = a.newValue;
      updateMap.get(a.agreementid)[`${a.field}_source`] = 'MANUAL'; // Restore manual source
    });

    setRecords(prev => {
      return prev.map(r => {
        if (updateMap.has(r.agreementid)) {
          const u = updateMap.get(r.agreementid);
          const next = { ...r, ...u };
          updatedRecords.push(next);
          return next;
        }
        return r;
      });
    });

    if (updatedRecords.length > 0) {
      await db.loan_records.bulkPut(updatedRecords);
    }
  }, [redoStack]);

  return (
    <DataContext.Provider value={{ undo, redo, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0,  isLoading, records: exposedRecords, schema, targets, auditLog, uploadHistory, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, bulkUpdateRecords, setTarget, globalBucket, setGlobalBucket }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
};
