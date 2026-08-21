const XLSX = require('xlsx');

function simulate() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['agreementid', 'City', 'Extra1', 'Extra2', 'Extra3'],
    ['1', 'New York', 'A', 'B', 'C'],
    ['2', 'Los Angeles', 'D', 'E', 'F']
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = XLSX.write(wb, { type: 'buffer' });

  // Now, the parseMainFile logic
  const wb2 = XLSX.read(buffer, { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]], { defval: null });
  
  const parsed = rows.map(row => ({
    ...row,
    agreementid: String(row['agreementid'] || '').trim(),
    city: String(row['City'] || '').trim()
  }));

  console.log("Parsed result:", parsed);
}

simulate();
