const fs = require('fs');
let content = fs.readFileSync('src/components/layout/DesktopHeader.tsx', 'utf8');

// Remove Undo2 and Redo2 imports
content = content.replace(/Undo2, Redo2, /, '');
content = content.replace(/Undo2,\s*Redo2,\s*/, '');

// Fix useData hook
content = content.replace(/undo, redo, canUndo, canRedo, /, '');

// Remove the vertical divider and undo/redo buttons
const regex = /<div className="w-px h-4 bg-border\/80 mx-1"><\/div>[\s\S]*?<Redo2 className="h-4 w-4" \/>\s*<\/button>/;
content = content.replace(regex, '');

// Clean up the search bar and layout
// We want to move search bar into the flex-1 section instead of the bucket selectors.

fs.writeFileSync('src/components/layout/DesktopHeader.tsx', content);
