const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

const tfoot = `
                    <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = \`/explorer?minPos=\${minPos}&maxPos=\${maxPos}\`}>
                        <tr>
                            <td colSpan={3} className="px-4 py-3 text-right">Grand Total (Click to view all)</td>
                            <td className="px-4 py-3 text-right text-warning">{fmtCur(stats.totalPos)}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{fmtCur(bandData.reduce((sum, r) => sum + r._emiVal, 0))}</td>
                        </tr>
                    </tfoot>
`;

code = code.replace(
    "                    </tbody>\n                </table>",
    "                    </tbody>\n" + tfoot + "                </table>"
);
fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Patched BandExplorer tfoot");
