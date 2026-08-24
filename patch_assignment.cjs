const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const existingExecutives = useMemo\(\(\) => \{[\s\S]*?return Array\.from\(execs\)\.sort\(\);\n  \}, \[records\]\);/;

const replacement = `const existingExecutives = useMemo(() => {
    const execs = new Set<string>();
    // First, add all actual user accounts that are executives
    users.filter(u => u.role === 'EXECUTIVE').forEach(u => execs.add(u.name));
    
    // Then add any legacy executives that exist in the records
    records.forEach((r) => {
      const e = String(
        r.executive_name || r["Executive Name"] || r.EXECUTIVE_NAME || "",
      ).trim();
      if (e) execs.add(e);
    });
    return Array.from(execs).sort();
  }, [records, users]);`;

content = content.replace(regex, replacement);

if (content.includes('const existingExecutives = useMemo')) {
  fs.writeFileSync(file, content, 'utf8');
} else {
  console.log("Could not find regex match in Assignment.tsx");
}
