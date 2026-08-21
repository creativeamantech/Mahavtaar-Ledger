const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace duplicate globalBucket line
content = content.replace(
  /const \[globalBucket, setLocalBucket\] = useState<string>\('ALL'\);[^\n]*\n/,
  ""
);

fs.writeFileSync(file, content);
