const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const { users } = useAuth();')) {
    content = content.replace("const { user, isExecutive } = useAuth();", "const { user, isExecutive, users } = useAuth();");
}

const execRegex = /const availableExecutives = useMemo\(\(\) => \['All', \.\.\.Array\.from\(new Set\(baseRecords\.map\(\(r: any\) => String\(r\.executive_name \|\| r\['Executive Name'\] \|\| 'UNKNOWN'\)\.trim\(\)\)\.filter\(Boolean\)\)\)\.sort\(\)\], \[baseRecords\]\);/;
const execReplacement = `const availableExecutives = useMemo(() => {
    const execs = new Set<string>();
    users.filter(u => u.role === 'EXECUTIVE').forEach(u => execs.add(u.name));
    baseRecords.forEach((r: any) => {
        const e = String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim();
        if (e && e !== 'UNKNOWN') execs.add(e);
    });
    return ['All', ...Array.from(execs).sort()];
}, [baseRecords, users]);`;

content = content.replace(execRegex, execReplacement);
fs.writeFileSync(file, content, 'utf8');
