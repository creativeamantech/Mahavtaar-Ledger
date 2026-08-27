const fs = require('fs');
let content = fs.readFileSync('src/components/layout/DesktopHeader.tsx', 'utf8');

const regex = /{availableBuckets\.length > 0 && \([\s\S]*?<\/div>\s*\)}/;
content = content.replace(regex, '');

// Also remove globalBucket from useData()
content = content.replace(/globalBucket, setGlobalBucket/, '');

fs.writeFileSync('src/components/layout/DesktopHeader.tsx', content);
