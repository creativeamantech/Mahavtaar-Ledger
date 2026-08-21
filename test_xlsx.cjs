const XLSX = require('xlsx');
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet([{
    agreementid: "123",
    bom_bkt: "1",
    ExtraColumn1: "Foo",
    ExtraColumn2: "Bar"
}]);
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
const buffer = XLSX.write(wb, { type: 'buffer' });

// Mock fileParser
const wb2 = XLSX.read(buffer, { type: 'buffer' });
const rows = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]], { defval: null });
const parsed = rows.map(row => ({
    ...row,
    agreementid: String(row['agreementid'] || '').trim(),
    bom_bkt: parseInt(row['bom_bkt']) || 1,
}));

console.log(parsed);
