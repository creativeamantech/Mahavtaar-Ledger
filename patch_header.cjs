const fs = require('fs');

function patchHeader(file, isMobile) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Update imports
  if (!content.includes('Undo2')) {
    content = content.replace("import { Search", "import { Undo2, Redo2, ChevronLeft, ChevronRight, Search");
  }

  // extract undo/redo from useData
  if (content.includes("const { records, globalBucket, setGlobalBucket } = useData();")) {
    content = content.replace(
      "const { records, globalBucket, setGlobalBucket } = useData();",
      "const { records, globalBucket, setGlobalBucket, undo, redo, canUndo, canRedo } = useData();"
    );
  } else if (content.includes("const { globalBucket, setGlobalBucket } = useData();")) {
    content = content.replace(
      "const { globalBucket, setGlobalBucket } = useData();",
      "const { globalBucket, setGlobalBucket, undo, redo, canUndo, canRedo } = useData();"
    );
  } else if (content.includes("const { records } = useData();")) {
     content = content.replace(
      "const { records } = useData();",
      "const { records, undo, redo, canUndo, canRedo } = useData();"
    );
  } else {
    // If there's no useData call, add it
    const hookInsertion = isMobile ? "export function MobileHeader() {" : "export function DesktopHeader(";
    const idx = content.indexOf(hookInsertion);
    if (idx !== -1) {
      const braceIdx = content.indexOf('{', idx) + 1;
      content = content.substring(0, braceIdx) + "\n  const { undo, redo, canUndo, canRedo } = useData();" + content.substring(braceIdx);
    }
  }

  // Add the buttons next to ThemeToggle
  const buttonsCode = `
        {/* Navigation & Undo/Redo */}
        <div className="flex items-center gap-1 mr-2 border-r border-border pr-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Go Back">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Go Forward">
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <div className="w-px h-4 bg-border mx-1"></div>
          
          <button onClick={undo} disabled={!canUndo} className={\`p-2 rounded-md transition-colors \${canUndo ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground/30'}\`} title="Undo Action">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={!canRedo} className={\`p-2 rounded-md transition-colors \${canRedo ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground/30'}\`} title="Redo Action">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
  `;

  // DesktopHeader: Right before <ThemeToggle />
  if (!isMobile) {
    content = content.replace("<ThemeToggle />", buttonsCode + "\n        <ThemeToggle />");
  } else {
    // MobileHeader: Also before ThemeToggle or at the end of flex container
    content = content.replace("<ThemeToggle />", buttonsCode + "\n        <ThemeToggle />");
  }

  fs.writeFileSync(file, content);
}

patchHeader('src/components/layout/DesktopHeader.tsx', false);
patchHeader('src/components/layout/MobileHeader.tsx', true);
console.log('Headers patched');
