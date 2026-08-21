const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                      <td className="px-2 py-1.5 text-right">
                        {isPaid 
                          ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-success/20 text-success uppercase tracking-wider">Paid</span>
                          : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Unpaid</span>
                        }
                      </td>`;

const replaceStr = targetStr + `
                      {(visibleExtraColumns || []).map(col => (
                        <td key={col} className="px-2 py-1.5 text-muted-foreground font-sans text-xs">
                          {r[col] !== undefined && r[col] !== null ? String(r[col]) : '-'}
                        </td>
                      ))}`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(file, content);
