const fs = require('fs');
const file = 'src/pages/TeamPivot.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const { users } = useAuth();')) {
    content = content.replace("const { user, isExecutive } = useAuth();", "const { user, isExecutive, users } = useAuth();");
}

const rawTeamRegex = /const rawTeamData = useMemo\(\(\) => buildTeamPivot\(filtered, targets\), \[filtered, targets\]\);/;
const rawTeamReplacement = `const rawTeamData = useMemo(() => {
    const data = buildTeamPivot(filtered, targets);
    
    // Add executives from User Management who have 0 assigned cases
    if (!isExecutive()) {
        const existingExecs = new Set(data.map((d: any) => d.exec));
        users.forEach(u => {
            if (u.role === 'EXECUTIVE' && !existingExecs.has(u.name)) {
                data.push({
                    bkt: '-',
                    exec: u.name,
                    collection: 0, count: 0, totalPOS: 0, paid: 0, paidPOS: 0,
                    posPaidOnlyCount: 0, posPaidOnlyPOS: 0, targetPOS: 0, cases: [],
                    pct: 0, target: 0, dailyRequiredPOS: 0
                });
            }
        });
    }
    
    return data;
  }, [filtered, targets, isExecutive, users]);`;

content = content.replace(rawTeamRegex, rawTeamReplacement);
fs.writeFileSync(file, content, 'utf8');
