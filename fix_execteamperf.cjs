const fs = require('fs');
const file = 'src/pages/ExecTeamPerf.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/buildExecTeamPerf/g, 'buildExecCityPivot');
content = content.replace(/exportExecTeamPerf/g, 'exportExecCityPivot');
content = content.replace(/filters: { executive\?: string, bucket\?: string, paid\?: string }/g, 'filters: { executive?: string, city?: string, bucket?: string, paid?: string }');

fs.writeFileSync(file, content);
