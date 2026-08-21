const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

// I will just redefine handleApply properly or move the useEffect.
code = code.replace(/useEffect\(\(\) => \{\s*const timer = setTimeout\(\(\) => \{\s*const mn = Number\(tempMin\) \|\| 0;\s*const mx = Number\(tempMax\) \|\| 0;\s*const finalMin = Math\.min\(mn, mx\);\s*const finalMax = Math\.max\(mn, mx\);\s*if \(finalMin !== minPos \|\| finalMax !== maxPos\) \{\s*handleApply\(\);\s*\}\s*\}, 1000\);\s*return \(\) => clearTimeout\(timer\);\s*\}, \[tempMin, tempMax, minPos, maxPos\]\);\s*/, "");

const hookStr = `
  useEffect(() => {
    const timer = setTimeout(() => {
      const mn = Number(tempMin) || 0;
      const mx = Number(tempMax) || 0;
      const finalMin = Math.min(mn, mx);
      const finalMax = Math.max(mn, mx);
      if (finalMin !== minPos || finalMax !== maxPos) {
        handleApply();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [tempMin, tempMax, minPos, maxPos]);
`;

code = code.replace(
    /  const handleSort = \(key: string\) => \{/,
    hookStr + "\n  const handleSort = (key: string) => {"
);

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Fixed handleApply reference");
