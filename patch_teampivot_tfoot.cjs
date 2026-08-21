const fs = require('fs');
let code = fs.readFileSync('src/pages/TeamPivot.tsx', 'utf-8');

const tfoot = `
          <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = '/explorer'}>
            <tr>
              <td className="px-3 py-2.5 font-bold uppercase text-primary">Grand Total</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-success">{fmtCur(grandTotal.collection)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold">{grandTotal.count}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-info">{grandTotal.paid}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold">{grandTotal.posPaidOnlyCount}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold">{fmtCur(grandTotal.totalPOS)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-success">{fmtCur(grandTotal.paidPOS)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-warning">{fmtCur(grandTotal.target)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-muted-foreground">{fmtCur(grandTotal.posPaidOnlyPOS)}</td>
              <td className={"px-3 py-2.5 text-right font-data font-bold " + pctColor(grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0)}>
                {fmtPct(grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0)}
              </td>
            </tr>
          </tfoot>
`;

code = code.replace(
    "          </tbody>\n        </table>",
    "          </tbody>\n" + tfoot + "        </table>"
);
fs.writeFileSync('src/pages/TeamPivot.tsx', code);
console.log("Patched TeamPivot tfoot");
