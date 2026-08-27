const fs = require('fs');
let content = fs.readFileSync('src/components/layout/MobileHeader.tsx', 'utf8');

const regex = /{\/\* Mobile Bucket Filter \*\/}[\s\S]*?{\s*availableBuckets\.length > 0 && \([\s\S]*?<\/div>\s*\)}/;
content = content.replace(regex, '');

// fallback if the comment is missing
const regex2 = /{availableBuckets\.length > 0 && \([\s\S]*?<\/div>\s*\)}/;
content = content.replace(regex2, '');

// Also remove globalBucket from useData()
content = content.replace(/, globalBucket, setGlobalBucket/, '');
content = content.replace(/globalBucket, setGlobalBucket/, '');

fs.writeFileSync('src/components/layout/MobileHeader.tsx', content);
