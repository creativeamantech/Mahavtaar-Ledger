const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf8');

const regex = /\{\/\* User Section \*\/\}([\s\S]*?)<\/aside>/;
const replacement = `{/* Footer */}
      <div className="mt-auto shrink-0 bg-muted/30 p-3 transition-all duration-300 border-t border-border">
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={\`flex w-full items-center gap-2 rounded-lg py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 transition-all duration-200 hover:bg-muted hover:text-foreground \${collapsed ? 'justify-center' : 'justify-start px-3'}\`}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> <span>Collapse</span></>}
        </button>
      </div>
    </aside>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/layout/AppSidebar.tsx', code);
