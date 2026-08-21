const fs = require('fs');
let bottom = fs.readFileSync('src/components/layout/BottomNav.tsx', 'utf-8');
bottom = bottom.replace("  { label: 'City × Team', icon: Grid3X3, path: '/matrix', view: VIEWS.CITY_TEAM_MATRIX },\n", '');
fs.writeFileSync('src/components/layout/BottomNav.tsx', bottom);
console.log('Removed from bottom nav');
