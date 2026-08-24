const fs = require('fs');
const file = 'src/contexts/DataContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const loadMainFile = useCallback\(async \(\buffer: ArrayBuffer, fileName: string, userName: string\) => \{[\s\S]*?return \{ rowCount: parsed\.length \};\n  \}, \[\]\);/;

const newLoadMainFile = `const loadMainFile = useCallback(async (buffer: ArrayBuffer, fileName: string, userName: string) => {
    const parsed = parseMainFile(buffer);
    
    let finalMerged: any[] = [];
    
    setRecords(prev => {
      const existingMap = new Map();
      prev.forEach(r => existingMap.set(String(r.agreementid), r));

      finalMerged = parsed.map(newRec => {
          const ext = existingMap.get(String(newRec.agreementid));
          if (!ext) return newRec;
          
          const mergedRec = { ...newRec };
          
          // 1. Preserve manual edits (e.g. executive_name)
          Object.keys(ext).forEach(key => {
              if (key.endsWith('_source') && ext[key] === 'MANUAL') {
                  const fieldName = key.replace('_source', '');
                  mergedRec[fieldName] = ext[fieldName];
                  mergedRec[key] = ext[key];
              }
          });

          // 2. Preserve non-main file collections data (PAID_FILE, CORRECTED, etc.)
          if (ext.dac_source && ext.dac_source !== 'FILE') {
              mergedRec.dac = ext.dac;
              mergedRec.dac_source = ext.dac_source;
          }
          if (ext.ecs_source && ext.ecs_source !== 'FILE') {
              mergedRec.ecs = ext.ecs;
              mergedRec.ecs_source = ext.ecs_source;
          }
          if (ext.special_source && ext.special_source !== 'FILE') {
              mergedRec.special = ext.special;
              mergedRec.special_source = ext.special_source;
          }

          // 3. Preserve other app state flags (provisional_dac, conflicts, corrected)
          if (ext.provisional_dac !== undefined) mergedRec.provisional_dac = ext.provisional_dac;
          if (ext.provisional_dac_raw !== undefined) mergedRec.provisional_dac_raw = ext.provisional_dac_raw;
          if (ext.provisional_collection_dates !== undefined) mergedRec.provisional_collection_dates = ext.provisional_collection_dates;
          if (ext.is_conflict !== undefined) mergedRec.is_conflict = ext.is_conflict;
          if (ext.is_corrected !== undefined) mergedRec.is_corrected = ext.is_corrected;

          return mergedRec;
      });
      return finalMerged;
    });

    const entry = { id: crypto.randomUUID(), type: 'MAIN_DATA', fileName, recordCount: parsed.length, uploadedBy: userName, createdAt: new Date().toISOString() };
    setUploadHistory(prev => [entry, ...prev]);
    
    // We clear the old cases that are no longer in the new main file, and put the newly merged ones
    await db.loan_records.clear();
    await db.loan_records.bulkPut(finalMerged);
    await db.upload_sessions.put(entry);
    
    return { rowCount: parsed.length };
  }, []);`;

content = content.replace(regex, newLoadMainFile);
fs.writeFileSync(file, content, 'utf8');
