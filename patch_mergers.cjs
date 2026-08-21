const fs = require('fs');
const file = 'src/lib/fileParser.ts';
let content = fs.readFileSync(file, 'utf8');

// For paid merge
content = content.replace(
  '        ...rec,\\n        dac: match.dac,',
  '        ...rec,\\n        ...match,\\n        dac: match.dac,'
);

// For additional merge
content = content.replace(
  '        ...rec,\\n        provisional_dac: provisional_dac,',
  '        ...rec,\\n        ...match,\\n        provisional_dac: provisional_dac,'
);

// For corrected merge
content = content.replace(
  '        ...rec,\\n        dac: match.corrected_dac,',
  '        ...rec,\\n        ...match,\\n        dac: match.corrected_dac,'
);

fs.writeFileSync(file, content);
