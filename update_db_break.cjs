const fs = require('fs');
const file = 'src/lib/db.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('currentBreakStart?: string;')) {
    content = content.replace('breakDuration?: number;', 'breakDuration?: number;\n  currentBreakStart?: string;');
    fs.writeFileSync(file, content, 'utf8');
}
