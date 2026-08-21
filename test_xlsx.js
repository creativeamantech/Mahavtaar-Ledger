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

const fs = require('fs');
fs.writeFileSync('test.xlsx', buffer);
