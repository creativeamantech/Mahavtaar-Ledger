const fs = require('fs');

const replaceInFile = (file, replacements) => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf-8');
  let changed = false;
  for (const rep of replacements) {
    if (code.match(rep.regex)) {
      code = code.replace(rep.regex, rep.replacement);
      changed = true;
    }
  }
  // also fix import
  if (changed) {
    code = code.replace(/import \{.*?useData.*?\} from '.*?contexts\/DataContext';/, 
      (match) => {
        if (!match.includes('useDataState')) {
          return match.replace('useData', 'useDataState, useDataDispatch');
        }
        return match;
      }
    );
  }
  if (changed) fs.writeFileSync(file, code);
};

const componentsWithOnlyState = [
  'src/components/layout/DesktopHeader.tsx',
  'src/components/layout/MobileHeader.tsx',
  'src/components/layout/GlobalCommandBar.tsx',
  'src/components/agent/AgentLiveDashboard.tsx',
  'src/components/agent/AgentNotifications.tsx',
  'src/components/settings/UserFormSheet.tsx'
];

for (const file of componentsWithOnlyState) {
  replaceInFile(file, [{
    regex: /const \{(.*?)\} = useData\(\);/g,
    replacement: 'const {$1} = useDataState();'
  }]);
}

// Special cases
// src/components/BucketFilter.tsx
replaceInFile('src/components/BucketFilter.tsx', [
  {
    regex: /const \{ records, filteredRecords, globalBucket, setGlobalBucket \} = useData\(\);/,
    replacement: `const { records, filteredRecords, globalBucket } = useDataState();
  const { setGlobalBucket } = useDataDispatch();`
  },
  {
    regex: /const \{ records, globalBucket, setGlobalBucket \} = useData\(\);/,
    replacement: `const { records, globalBucket } = useDataState();
  const { setGlobalBucket } = useDataDispatch();`
  }
]);

// src/components/AdvancedTargetsTab.tsx
replaceInFile('src/components/AdvancedTargetsTab.tsx', [
  {
    regex: /const \{ records, targets, setTarget \} = useData\(\);/,
    replacement: `const { records, targets } = useDataState();
  const { setTarget } = useDataDispatch();`
  }
]);

