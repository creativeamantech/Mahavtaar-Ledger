const fs = require('fs');
let content = fs.readFileSync('src/components/layout/MobileHeader.tsx', 'utf8');

// Remove undo/redo hooks and buttons
content = content.replace(/, undo, redo, canUndo, canRedo/, '');
content = content.replace(/Undo2, Redo2, /, '');

const regex = /<div className="w-px h-3 bg-border\/80 mx-0.5"><\/div>[\s\S]*?<Redo2 className="h-4 w-4" \/>\s*<\/button>/;
content = content.replace(regex, '');

fs.writeFileSync('src/components/layout/MobileHeader.tsx', content);
