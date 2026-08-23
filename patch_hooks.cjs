const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomerDetail.tsx', 'utf8');

const replacement = `
  const phones = useMemo(() => {
    if (!record) return [];
    const extracted: { number: string, source: string }[] = [];
    Object.entries(record).forEach(([key, val]) => {
      const sVal = String(val).replace(/[^0-9]/g, '');
      if (sVal.length >= 10 && sVal.length <= 12) {
        if (!extracted.some(e => e.number === sVal)) {
          extracted.push({ number: sVal, source: key });
        }
      }
    });
    return extracted;
  }, [record]);

  if (!record) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Customer Not Found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">Go Back</button>
        </div>
      </AppLayout>
    );
  }
`;

code = code.replace(/if \(!record\) {[\s\S]*?\}[\s\S]*?\/\/ Extract phone numbers[\s\S]*?const phones = useMemo\(\(\) => {[\s\S]*?return extracted;\n  \}, \[record\]\);/, replacement);

code = code.replace("catch(e) {}", "catch(e) { /* ignore */ }");

fs.writeFileSync('src/pages/CustomerDetail.tsx', code);
