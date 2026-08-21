const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

appCode = appCode.replace(
  `import DataExplorer from "./pages/DataExplorer";`,
  `import DataExplorer from "./pages/DataExplorer";\nimport Assignment from "./pages/Assignment";`
);

appCode = appCode.replace(
  `<Route path="/settings" element={<ProtectedRoute view={VIEWS.SETTINGS}><SettingsPage /></ProtectedRoute>} />`,
  `<Route path="/settings" element={<ProtectedRoute view={VIEWS.SETTINGS}><SettingsPage /></ProtectedRoute>} />\n      <Route path="/assignment" element={<ProtectedRoute view={VIEWS.ASSIGNMENT}><Assignment /></ProtectedRoute>} />`
);

fs.writeFileSync('src/App.tsx', appCode);
console.log("Updated App.tsx with Assignment route");
