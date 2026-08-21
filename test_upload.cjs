const XLSX = require('xlsx');

// Create a dummy workbook with 200 columns
const dummyData = { agreementid: "L1" };
for (let i = 1; i <= 200; i++) {
  dummyData["Col_" + i] = "Val" + i;
}

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet([dummyData]);
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
const buffer = XLSX.write(wb, { type: 'buffer' });

// Now read it
const wb2 = XLSX.read(buffer, { type: 'buffer' });
const rows = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]], { defval: null });

const parsed = rows.map(row => ({
    ...row,
    agreementid: String(row['agreementid'] || '').trim(),
    bom_bkt: parseInt(row['bom_bkt']) || 1,
}));

console.log("Parsed row keys count:", Object.keys(parsed[0]).length);
console.log("Sample of keys:", Object.keys(parsed[0]).slice(0, 10));
