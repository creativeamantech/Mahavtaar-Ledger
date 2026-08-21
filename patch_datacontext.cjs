const fs = require('fs');
const file = 'src/contexts/DataContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add schema to interface
content = content.replace(
  '  records: any[];',
  '  records: any[];\n  schema: string[];'
);

// Add schema state
content = content.replace(
  '  const [records, setRecords] = useState<any[]>([]);',
  '  const [records, setRecords] = useState<any[]>([]);\n  const [schema, setSchema] = useState<string[]>([]);'
);

// Add schema effect
content = content.replace(
  '  // Load from Dexie on mount',
  `  useEffect(() => {
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

  // Load from Dexie on mount`
);

// Expose schema in provider
content = content.replace(
  '<DataContext.Provider value={{ isLoading, records, targets, auditLog, uploadHistory, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, bulkUpdateRecords, setTarget, globalBucket, setGlobalBucket }}>',
  '<DataContext.Provider value={{ isLoading, records, schema, targets, auditLog, uploadHistory, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, bulkUpdateRecords, setTarget, globalBucket, setGlobalBucket }}>'
);

fs.writeFileSync(file, content);
