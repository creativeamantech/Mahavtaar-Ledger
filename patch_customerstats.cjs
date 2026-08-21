const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add exactCustomerFingerprint state
if (!content.includes('exactCustomerFingerprint')) {
  content = content.replace(
    "const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');",
    "const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');\n  const [exactCustomerFingerprint, setExactCustomerFingerprint] = useState<string | null>(null);"
  );
}

// 2. Add addressKey and contactKey memo
if (!content.includes('const { addressKey, contactKey }')) {
  content = content.replace(
    "const availableExecutives =",
    `const { addressKey, contactKey } = useMemo(() => {
    return {
      addressKey: schema.find(k => k.toLowerCase().includes('address') || k.toLowerCase() === 'add1' || k.toLowerCase().includes('add_1') || k.toLowerCase().includes('res_add')) || null,
      contactKey: schema.find(k => k.toLowerCase().includes('mobile') || k.toLowerCase().includes('phone') || k.toLowerCase().includes('contact')) || null
    };
  }, [schema]);\n\n  const availableExecutives =`
  );
}

// 3. Update the filter logic to check exactCustomerFingerprint
const filterStart = `const filteredRecords = useMemo(() => {
    return baseRecords.filter((r: any) => {`;
const newFilterCheck = `const filteredRecords = useMemo(() => {
    return baseRecords.filter((r: any) => {
      if (exactCustomerFingerprint) {
        const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
        const name = String(rawName).trim().toUpperCase();
        const address = addressKey ? String(r[addressKey] || '').trim().toUpperCase() : '';
        const contact = contactKey ? String(r[contactKey] || '').trim().toUpperCase() : '';
        if (\`\${name}||\${contact}||\${address}\` !== exactCustomerFingerprint) return false;
      }`;
      
if (content.includes(filterStart) && !content.includes('if (exactCustomerFingerprint) {')) {
  content = content.replace(filterStart, newFilterCheck);
}

// 4. Update the stats generation to use fingerprints
const oldStats = `const nameStats = useMemo(() => {
    const stats: Record<string, { count: number, totalPos: number }> = {};
    baseRecords.forEach((r: any) => {
      const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
      const name = String(rawName).trim().toUpperCase();
      if (name && name !== '-') {
        if (!stats[name]) stats[name] = { count: 0, totalPos: 0 };
        stats[name].count += 1;
        stats[name].totalPos += Number(r.principal_outstanding) || 0;
      }
    });
    return stats;
  }, [baseRecords]);`;

const newStats = `const customerStats = useMemo(() => {
    const stats: Record<string, { count: number, totalPos: number }> = {};
    baseRecords.forEach((r: any) => {
      const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
      const name = String(rawName).trim().toUpperCase();
      const address = addressKey ? String(r[addressKey] || '').trim().toUpperCase() : '';
      const contact = contactKey ? String(r[contactKey] || '').trim().toUpperCase() : '';
      const fingerprint = \`\${name}||\${contact}||\${address}\`;
      
      if (name && name !== '-') {
        if (!stats[fingerprint]) stats[fingerprint] = { count: 0, totalPos: 0 };
        stats[fingerprint].count += 1;
        stats[fingerprint].totalPos += Number(r.principal_outstanding) || 0;
      }
    });
    return stats;
  }, [baseRecords, addressKey, contactKey]);`;

if (content.includes(oldStats)) {
  content = content.replace(oldStats, newStats);
}

// 5. Update the clear filter button to also clear exactCustomerFingerprint
const oldClear = `setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All'); setSearchQuery(''); setCustomFilterValues({}); setActiveCustomFilters([]);`;
const newClear = `setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All'); setSearchQuery(''); setCustomFilterValues({}); setActiveCustomFilters([]); setExactCustomerFingerprint(null);`;

if (content.includes(oldClear)) {
  // Use regex to replace all instances
  content = content.split(oldClear).join(newClear);
}

// 6. Update the td block to use the fingerprint
const oldTdBlock = `<td className="px-2 py-1.5 cursor-pointer group" onClick={() => {
                        const cName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-';
                        if (cName !== '-') {
                          setSearchQuery(cName);
                          // Clear other filters so the user sees all matches
                          setSelectedState('All');
                          setSelectedCity('All');
                          setSelectedExecutive('All');
                          setSelectedPaidStatus('All');
                          setCustomFilterValues({});
                          setActiveCustomFilters([]);
                        }
                      }}>
                        <div className="flex flex-col">
                          <span className="text-primary group-hover:underline font-semibold">
                            {r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-'}
                          </span>
                          {(() => {
                            const cName = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '').trim().toUpperCase();
                            const stats = nameStats[cName];
                            if (stats && stats.count > 1) {
                              return (
                                <span className="text-[9px] font-bold text-muted-foreground mt-0.5 bg-muted/50 px-1 py-0.5 rounded w-fit group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  {stats.count} CASES • {fmtCur(stats.totalPos)}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>`;

const newTdBlock = `<td className="px-2 py-1.5 cursor-pointer group" onClick={() => {
                        const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
                        const name = String(rawName).trim().toUpperCase();
                        if (name !== '-' && name !== '') {
                          const address = addressKey ? String(r[addressKey] || '').trim().toUpperCase() : '';
                          const contact = contactKey ? String(r[contactKey] || '').trim().toUpperCase() : '';
                          const fingerprint = \`\${name}||\${contact}||\${address}\`;
                          
                          setExactCustomerFingerprint(fingerprint);
                          setSearchQuery(''); // clear fuzzy search
                          // Clear other filters so the user sees all matches
                          setSelectedState('All');
                          setSelectedCity('All');
                          setSelectedExecutive('All');
                          setSelectedPaidStatus('All');
                          setCustomFilterValues({});
                          setActiveCustomFilters([]);
                        }
                      }}>
                        <div className="flex flex-col">
                          <span className="text-primary group-hover:underline font-semibold">
                            {r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-'}
                          </span>
                          {(() => {
                            const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
                            const name = String(rawName).trim().toUpperCase();
                            const address = addressKey ? String(r[addressKey] || '').trim().toUpperCase() : '';
                            const contact = contactKey ? String(r[contactKey] || '').trim().toUpperCase() : '';
                            const fingerprint = \`\${name}||\${contact}||\${address}\`;
                            
                            const stats = customerStats[fingerprint];
                            if (stats && stats.count > 1) {
                              return (
                                <span className="text-[9px] font-bold text-muted-foreground mt-0.5 bg-muted/50 px-1 py-0.5 rounded w-fit group-hover:bg-primary/10 group-hover:text-primary transition-colors" title="Matched via Name + Address/Contact">
                                  {stats.count} CASES • {fmtCur(stats.totalPos)}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>`;

if (content.includes(oldTdBlock)) {
  content = content.replace(oldTdBlock, newTdBlock);
} else {
  console.log("Could not find td block!");
  // Let's print out what we found
}

// Also update the dependency array of filteredRecords
const oldDeps = `}, [baseRecords, selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, searchQuery, minPos, maxPos, activeCustomFilters, customFilterValues]);`;
const newDeps = `}, [baseRecords, selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, searchQuery, minPos, maxPos, activeCustomFilters, customFilterValues, exactCustomerFingerprint, addressKey, contactKey]);`;

if (content.includes(oldDeps)) {
  content = content.replace(oldDeps, newDeps);
}

fs.writeFileSync(file, content);
console.log("Success");
