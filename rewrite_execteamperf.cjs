const fs = require('fs');
const file = 'src/pages/ExecTeamPerf.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/TeamPivot/g, 'ExecTeamPerf');
content = content.replace(/buildTeamPivot/g, 'buildExecCityPivot');
content = content.replace(/exportTeamPivot/g, 'exportExecCityPivot');
content = content.replace(/Team Performance Dashboard/g, 'Team Overall Performance');
content = content.replace(/teamData/g, 'cityData');

// Replace item.exec with item.city
content = content.replace(/item\.exec/g, 'item.city');
// Replace "Executive Name" column header with "City"
content = content.replace(/Executive Name/g, 'City');
// We need to keep filters.executive because the executive views their own data, but we pass city to navigateToExplorer.
// Let's modify the Explorer navigation:
content = content.replace(
  "    if (filters.executive) params.set('exec', filters.executive);",
  "    if (filters.executive) params.set('exec', filters.executive);\n    if (filters.city) params.set('city', filters.city);"
);

// We should update the navigateToExplorer in the map loop. 
// Old: onClick={() => navigateToExplorer({ executive: item.exec, bucket: String(bkt) })}
// New: onClick={() => navigateToExplorer({ city: item.city, bucket: String(bkt) })}
// Wait, currently TeamPivot doesn't pass anything to navigateToExplorer? Let's check what it does.
// Let's just do a replace for executive -> city in table
// Actually, let's just make it simple:

content = content.replace(/Team Performance Overview/g, 'Team Overall Performance - Allocated Cities');
content = content.replace(/View performance metrics grouped by team members/g, 'View performance metrics grouped by your allocated cities');
content = content.replace(/executive_name/g, 'executive_name');

fs.writeFileSync(file, content);
