const fs = require('fs');
const file = 'src/components/layout/AppLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="flex min-h-screen bg-background">/g,
  '<div className="min-h-screen bg-background w-full overflow-x-hidden">'
);

content = content.replace(
  /className={\`flex flex-1 flex-col min-w-0 transition-all duration-300 ease-out md:ml-\[72px\] \$\{collapsed \? 'lg:ml-\[72px\]' : 'lg:ml-\[260px\]'\}\`}/g,
  "className={\`flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-out md:pl-[72px] \${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'}\`}"
);

// Wait, using padding-left instead of margin-left might be safer if it's a block, or margin is fine. 
// Actually, with padding-left, if the wrapper is box-sizing: border-box, it will definitely not overflow!
// Let's use padding-left and remove the md:ml-* stuff.

fs.writeFileSync(file, content);
