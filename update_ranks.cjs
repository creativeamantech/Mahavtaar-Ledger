const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/ExecTeamPerf.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // We want to replace the rank logic inside the grouped useMemo.
  // Old logic:
  // const allNames = Object.keys(...).sort(...);
  // const getRank = (name: string) => allNames.indexOf(name) + 1;
  // return Object.entries(groups)
  //   .map(([bkt, items]) => {
  //      const sorted = items;
  //      const itemsWithRank = sorted.map(item => ({ ...item, globalRank: getRank(item.city) }));

  const isCity = file.includes('CityPivot') || file.includes('ExecTeamPerf');
  const entityField = isCity ? 'city' : 'exec';
  const globalCountVar = isCity ? 'globalCityCounts' : 'globalExecCounts';

  // Find the exact grouped block string
  const startRegex = new RegExp(`const allNames = Object\\.keys\\(${globalCountVar}\\)\\.sort\\(.*\\);\\s*const getRank = .*?;\\s*return Object\\.entries\\(groups\\)\\s*\\.map\\(\\[bkt, items\\] => \\{\\s*const sorted = items;\\s*\\/\\/ Attach rank to items for display\\s*const itemsWithRank = sorted\\.map\\(item => \\(\\{ \\.\\.\\.item, globalRank: getRank\\(item\\.${entityField}\\) \\}\\)\\);`, 'g');
  
  if (content.match(startRegex)) {
    const replacement = `// Ranks are now bucket-specific
    return Object.entries(groups)
      .map(([bkt, items]) => {
         // Sort purely to determine rank within this bucket
         const bucketSortedItems = [...items].sort((a, b) => b.count - a.count);
         const getBucketRank = (name: string) => bucketSortedItems.findIndex(i => i.${entityField} === name) + 1;
         
         const sorted = items;
         
         // Attach bucket-specific rank to items for display
         const itemsWithRank = sorted.map(item => ({ ...item, globalRank: getBucketRank(item.${entityField}) }));`;
         
    content = content.replace(startRegex, replacement);
    console.log(`Replaced rank logic in ${file}`);
  } else {
    // Just in case it's slightly different
    console.log(`Could not find exact regex match in ${file}, trying fallback`);
    // Fallback: replace just the map part
    const fallbackRegex = new RegExp(`const sorted = items;\\s*\\/\\/ Attach rank to items for display\\s*const itemsWithRank = sorted\\.map\\(item => \\(\\{ \\.\\.\\.item, globalRank: getRank\\(item\\.${entityField}\\) \\}\\)\\);`, 'g');
    if (content.match(fallbackRegex)) {
        const fallbackReplacement = `const sorted = items;
         const bucketSortedItems = [...items].sort((a, b) => b.count - a.count);
         const getBucketRank = (name: string) => bucketSortedItems.findIndex(i => i.${entityField} === name) + 1;
         const itemsWithRank = sorted.map(item => ({ ...item, globalRank: getBucketRank(item.${entityField}) }));`;
        content = content.replace(fallbackRegex, fallbackReplacement);
        console.log(`Replaced rank logic in ${file} using fallback`);
    } else {
        console.log(`Could not find fallback match in ${file} either`);
    }
  }

  fs.writeFileSync(file, content, 'utf8');
});
