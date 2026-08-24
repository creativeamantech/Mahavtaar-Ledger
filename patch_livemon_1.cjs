const fs = require('fs');
const file = 'src/pages/LiveMonitoring.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useAuth')) {
    content = content.replace("import { useData } from '../contexts/DataContext';", "import { useData } from '../contexts/DataContext';\nimport { useAuth } from '../contexts/AuthContext';");
    content = content.replace("const { records } = useData();", "const { records } = useData();\n  const { users } = useAuth();");
}

const regex = /const agentPerformance = useMemo\(\(\) => \{[\s\S]*?return Object\.values\(agentsMap\)\.sort\(\(a, b\) => b\.feedbackCount - a\.feedbackCount\);\n  \}, \[filteredFeedbacks\]\);/;

const replacement = `const agentPerformance = useMemo(() => {
    const agentsMap: Record<string, any> = {};
    
    // Initialize map with all users who have the EXECUTIVE role
    users.filter(u => u.role === 'EXECUTIVE').forEach(u => {
        agentsMap[u.name] = { name: u.name, feedbackCount: 0, ptpCount: 0, collectedAmount: 0 };
    });

    filteredFeedbacks.forEach(f => {
      if (!agentsMap[f.agentName]) {
        agentsMap[f.agentName] = { name: f.agentName, feedbackCount: 0, ptpCount: 0, collectedAmount: 0 };
      }
      agentsMap[f.agentName].feedbackCount++;
      if (f.status === 'PTP') agentsMap[f.agentName].ptpCount++;
      if (f.status === 'Paid') agentsMap[f.agentName].collectedAmount += (Number(f.amountPaid) || 0);
    });
    return Object.values(agentsMap).sort((a, b) => b.feedbackCount - a.feedbackCount);
  }, [filteredFeedbacks, users]);`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
