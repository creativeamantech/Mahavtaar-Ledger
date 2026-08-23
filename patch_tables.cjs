const fs = require('fs');

const files = ['src/pages/CityPivot.tsx', 'src/pages/ExecTeamPerf.tsx', 'src/pages/TeamPivot.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // 1. Add table headers
  content = content.replace(
      '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Needed POS</th>',
      '<th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Needed POS</th>\n              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Target Date</th>\n              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Daily Required POS</th>'
  );

  // 2. Add subtotal aggregations
  if (content.includes('target: items.reduce((s: number, i: any) => s + i.target, 0)')) {
    content = content.replace(
      'target: items.reduce((s: number, i: any) => s + i.target, 0),',
      'target: items.reduce((s: number, i: any) => s + i.target, 0),\n                dailyRequiredPOS: items.reduce((s: number, i: any) => s + (i.dailyRequiredPOS || 0), 0),'
    );
  }

  // 3. Add table cells
  content = content.replace(
      '<td className="px-3 py-2 text-right">{item.target <= 0 ? <span className="text-[10px] font-bold text-success uppercase">Achieved</span> : <span className="text-destructive font-bold">{fmtCur(item.target)}</span>}</td>',
      '<td className="px-3 py-2 text-right">{item.target <= 0 ? <span className="text-[10px] font-bold text-success uppercase">Achieved</span> : <span className="text-destructive font-bold">{fmtCur(item.target)}</span>}</td>\n                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">{item.targetDate || "-"}</td>\n                      <td className="px-3 py-2 text-right font-semibold text-amber-600">{fmtCur(item.dailyRequiredPOS || 0)}</td>'
  );

  // 4. Also add grand totals
  if (content.includes('target: cityData.reduce((s, t) => s + t.target, 0),')) {
      content = content.replace(
          'target: cityData.reduce((s, t) => s + t.target, 0),',
          'target: cityData.reduce((s, t) => s + t.target, 0),\n    dailyRequiredPOS: cityData.reduce((s, t) => s + (t.dailyRequiredPOS || 0), 0),'
      );
  }
  
  if (content.includes('target: teamData.reduce((s, t) => s + t.target, 0),')) {
      content = content.replace(
          'target: teamData.reduce((s, t) => s + t.target, 0),',
          'target: teamData.reduce((s, t) => s + t.target, 0),\n    dailyRequiredPOS: teamData.reduce((s, t) => s + (t.dailyRequiredPOS || 0), 0),'
      );
  }
  
  if (content.includes('target: execData.reduce((s, t) => s + t.target, 0),')) {
      content = content.replace(
          'target: execData.reduce((s, t) => s + t.target, 0),',
          'target: execData.reduce((s, t) => s + t.target, 0),\n    dailyRequiredPOS: execData.reduce((s, t) => s + (t.dailyRequiredPOS || 0), 0),'
      );
  }

  fs.writeFileSync(file, content);
}

