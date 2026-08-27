const fs = require('fs');

function removeAvailableBuckets(file) {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /const availableBuckets = useMemo\([\s\S]*?\}, \[records\]\);/;
    content = content.replace(regex, '');
    fs.writeFileSync(file, content);
}

removeAvailableBuckets('src/components/layout/DesktopHeader.tsx');
removeAvailableBuckets('src/components/layout/MobileHeader.tsx');
