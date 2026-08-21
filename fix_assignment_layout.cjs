const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Sheet imports
const importAdd = `import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';\nimport { ScrollArea } from '../components/ui/scroll-area';\n`;
content = content.replace("import { \n  Building2, Filter", importAdd + "import { \n  Building2, Filter");

// 2. Add state for sidebar
content = content.replace(
  "const [reportDate, setReportDate] = useState<string>(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD",
  "const [reportDate, setReportDate] = useState<string>(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD\n  const [sidebarOpen, setSidebarOpen] = useState(false);"
);

// 3. Fix the "Allocated" column in City Stats
// Original: <td className="px-6 py-4 text-center font-bold text-primary">{stat.allocated}</td>
const newAllocatedHtml = `<td className="px-6 py-4 text-center">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <span className="font-bold text-primary">{stat.allocated}</span>
                            {stat.allocated > 0 && (
                              <div className="flex flex-wrap justify-center gap-1 mt-1">
                                {Object.entries(stat.execs).map(([exec, count]) => (
                                  <span key={exec} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                    {exec}: {count}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>`;
content = content.replace(
  /<td className="px-6 py-4 text-center font-bold text-primary hidden sm:table-cell">\{stat.allocated\}<\/td>/,
  newAllocatedHtml
);
content = content.replace(
  /<td className="px-6 py-4 text-center font-bold text-primary">\{stat.allocated\}<\/td>/,
  newAllocatedHtml
);


fs.writeFileSync(file, content);
