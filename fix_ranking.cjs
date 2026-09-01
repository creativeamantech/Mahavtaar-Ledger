const fs = require('fs');

let cityCode = fs.readFileSync('src/pages/CityPivot.tsx', 'utf-8');
cityCode = cityCode.replace(
  /const cityTotalsForRank = useMemo\(\(\) => \{[\s\S]*?\}, \[rawCityData\]\);/,
  `const cityTotalsForRank = useMemo(() => {
    const map: Record<string, { totalPOS: number; paidPOS: number; count: number }> = {};
    rawCityData.forEach((d: Record<string, unknown>) => {
      if (!map[d.city]) map[d.city] = { totalPOS: 0, paidPOS: 0, count: 0 };
      map[d.city].totalPOS += (Number(d.totalPOS) || 0);
      map[d.city].paidPOS += (Number(d.paidPOS) || 0);
      map[d.city].count += (Number(d.count) || 0);
    });
    return Object.entries(map)
      .map(([city, s]) => ({ city, count: s.count }))
      .sort((a, b) => b.count - a.count)
      .reduce((acc, cur, idx) => { acc[cur.city] = idx + 1; return acc; }, {} as Record<string, number>);
  }, [rawCityData]);`
);
fs.writeFileSync('src/pages/CityPivot.tsx', cityCode);

let teamCode = fs.readFileSync('src/pages/TeamPivot.tsx', 'utf-8');
teamCode = teamCode.replace(
  /const execTotalsForRank = useMemo\(\(\) => \{[\s\S]*?\}, \[rawTeamData\]\);/,
  `const execTotalsForRank = useMemo(() => {
    const map: Record<string, { totalPOS: number; paidPOS: number; count: number }> = {};
    rawTeamData.forEach((d: Record<string, unknown>) => {
      if (!map[d.exec]) map[d.exec] = { totalPOS: 0, paidPOS: 0, count: 0 };
      map[d.exec].totalPOS += (Number(d.totalPOS) || 0);
      map[d.exec].paidPOS  += (Number(d.paidPOS)  || 0);
      map[d.exec].count += (Number(d.count) || 0);
    });
    return Object.entries(map)
      .map(([exec, s]) => ({ exec, count: s.count }))
      .sort((a, b) => b.count - a.count)
      .reduce((acc, cur, idx) => { acc[cur.exec] = idx + 1; return acc; }, {} as Record<string, number>);
  }, [rawTeamData]);`
);
fs.writeFileSync('src/pages/TeamPivot.tsx', teamCode);
