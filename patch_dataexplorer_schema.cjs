const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace records, isLoading with records, isLoading, schema
content = content.replace(
  'const { records, isLoading } = useData();',
  'const { records, schema, isLoading } = useData();'
);

// replace allExtraKeys definition
content = content.replace(
  /const allExtraKeys = useMemo\(\(\) => \{[\s\S]*?\}, \[records\]\);/,
  `const allExtraKeys = useMemo(() => {
    return schema.filter(k => !STANDARD_KEYS.includes(k) && !k.startsWith('_'));
  }, [schema]);`
);

fs.writeFileSync(file, content);
