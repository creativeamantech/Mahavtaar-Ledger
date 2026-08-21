const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf-8');

if (!code.includes('handleExport')) {
    code = code.replace("import { Filter, Database, Search } from 'lucide-react';", "import { Filter, Database, Search, Download } from 'lucide-react';");

    const exportLogic = `  const handleExport = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['Agreement Number', 'Customer Name', 'State', 'City', 'Executive', 'Bucket', 'POS', 'EMI', 'DAC', 'ECS', 'Paid Status'];
    const csv = [
      headers.join(','),
      ...filteredRecords.map((r: any) => {
        const isPaid = calculateRow(r).mainPaid === 1;
        return [
          \`"\${r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || ''}"\`,
          \`"\${r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || ''}"\`,
          \`"\${r.state || r.State || ''}"\`,
          \`"\${r.city || r.City || ''}"\`,
          \`"\${r.executive_name || r['Executive Name'] || ''}"\`,
          \`"\${r.bom_bkt || ''}"\`,
          Number(r.principal_outstanding) || 0,
          Number(r.emi_amt) || 0,
          Number(r.dac ?? r.DAC) || 0,
          Number(r.ecs ?? r.ECS) || 0,
          isPaid ? 'Paid' : 'Unpaid'
        ].join(',');
      })
    ].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Data_Explorer_Export.csv'; a.click();
  };\n`;

    code = code.replace(
        "const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);",
        exportLogic + "  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);"
    );

    code = code.replace(
        `<span className="text-[11px] text-muted-foreground font-medium">Page {page} of {totalPages}</span>`,
        `<span className="text-[11px] text-muted-foreground font-medium">Page {page} of {totalPages}</span>
            <button onClick={handleExport} className="mx-4 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors">
              <Download className="h-3 w-3" /> Export Filtered Data
            </button>`
    );
    
    // Also handle case where there is only 1 page
    code = code.replace(
        `{totalPages > 1 && (`,
        `{(totalPages > 0) && (` // so the footer always renders if there's data, allowing export
    );

    fs.writeFileSync('src/pages/DataExplorer.tsx', code);
    console.log("Patched DataExplorer export");
}
