const fs = require('fs');
const files = ['src/pages/TeamPivot.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace grouped logic
  const globalCountsStr = `
  const globalExecCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const exec = String(r.executive_name || r['Executive Name'] || r.EXECUTIVE_NAME || 'UNKNOWN').trim();
      counts[exec] = (counts[exec] || 0) + 1;
    });
    return counts;
  }, [records]);

  // Group by bucket
  const grouped = useMemo(() => {
    const groups: Record<number, any[]> = {};
    teamData.forEach(t => {
      if (!groups[t.bkt]) groups[t.bkt] = [];
      groups[t.bkt].push(t);
    });
    return Object.entries(groups)
      .map(([bkt, items]) => [
        bkt, 
        items.sort((a, b) => (globalExecCounts[b.exec] || 0) - (globalExecCounts[a.exec] || 0))
      ] as [string, any[]])
      .sort(([a], [b]) => Number(a) - Number(b));
  }, [teamData, globalExecCounts]);
`;

  const searchRegex1 = /\/\/ Group by bucket[\s\S]*?\}, \[teamData\]\);/;
  if (searchRegex1.test(content)) {
    content = content.replace(searchRegex1, globalCountsStr.trim());
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  } else {
    console.log('Regex failed for', file);
  }
}
