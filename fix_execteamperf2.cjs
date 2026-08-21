const fs = require('fs');
const file = 'src/pages/ExecTeamPerf.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('Bucket / Executive', 'Bucket / City');
content = content.replace('Bucket → Executive · Team Paid Logic', 'Bucket → City · Team Paid Logic');

fs.writeFileSync(file, content);
