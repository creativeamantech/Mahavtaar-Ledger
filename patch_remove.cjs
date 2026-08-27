const fs = require('fs');
let content = fs.readFileSync('src/pages/ExecDashboard.tsx', 'utf8');

const startStr = '{/* City by Bucket Paid/Unpaid Drilldown */}';
const endStr = '{/* Performance-Based Paid Cases */}';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    // We want to delete from just before startStr to just before the closing tag section.
    // Let's find `</>` before endStr.
    const closeIdx = content.lastIndexOf('</>', endIdx);
    
    if (closeIdx !== -1 && closeIdx > startIdx) {
        const beforeStart = content.lastIndexOf('\n', startIdx);
        const beforeClose = content.lastIndexOf('\n', closeIdx);
        
        content = content.substring(0, beforeStart + 1) + content.substring(beforeClose + 1);
        fs.writeFileSync('src/pages/ExecDashboard.tsx', content);
        console.log("Successfully removed block.");
    } else {
        console.log("Could not find closeIdx properly.");
    }
} else {
    console.log("Could not find start or end index.");
}
