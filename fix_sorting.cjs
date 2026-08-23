const fs = require('fs');
const files = ['src/pages/CityPivot.tsx', 'src/pages/ExecTeamPerf.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace grouped logic
  const globalCountsStr = `
  const globalCityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const city = (r.city || r.City || 'UNKNOWN').trim().toUpperCase();
      counts[city] = (counts[city] || 0) + 1;
    });
    return counts;
  }, [records]);

  // Group by bucket
  const grouped = useMemo(() => {
    const groups: Record<number, any[]> = {};
    cityData.forEach(t => {
      if (!groups[t.bkt]) groups[t.bkt] = [];
      groups[t.bkt].push(t);
    });
    return Object.entries(groups)
      .map(([bkt, items]) => [
        bkt, 
        items.sort((a, b) => (globalCityCounts[b.city] || 0) - (globalCityCounts[a.city] || 0))
      ] as [string, any[]])
      .sort(([a], [b]) => Number(a) - Number(b));
  }, [cityData, globalCityCounts]);
`;

  // Depending on what was there before
  const searchRegex1 = /\/\/ Group by bucket[\s\S]*?\}, \[cityData\]\);/;
  if (searchRegex1.test(content)) {
    content = content.replace(searchRegex1, globalCountsStr.trim());
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  } else {
    console.log('Regex failed for', file);
  }
}
