sed -i '/<\/AppLayout>/i \
      {/* Performance-Based Paid Cases */}\
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-8">\
        <div className="p-4 border-b border-border bg-muted/20">\
          <h3 className="font-semibold flex items-center gap-2">Performance-Based Paid Cases</h3>\
          <p className="text-xs text-muted-foreground mt-1">Detailed performance tracking against collection targets</p>\
        </div>\
        <div className="overflow-x-auto max-h-[600px] relative">\
          <table className="w-full font-sans text-xs min-w-[1000px]">\
            <thead className="sticky top-0 z-30 bg-muted border-b border-border shadow-sm">\
              <tr>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-center w-12 bg-muted/90 text-xs uppercase text-[10px]">Rank</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-left uppercase tracking-wider text-[11px] bg-muted/90">City</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">Collection</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">Total Cases</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">Paid Count</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">POS Paid Only Count</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">Total POS</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">Paid POS</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">Needed / DRR</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">Target Date</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">DRR</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">POS Paid Only POS</th>\
                <th className="text-muted-foreground font-semibold px-3 py-3 text-right uppercase tracking-wider text-[11px] bg-muted/90">Total %</th>\
              </tr>\
            </thead>\
            <tbody>\
              {teamPerfGrouped.map(([bkt, items]) => {\
                const sub = {\
                  collection: items.reduce((s: number, i: any) => s + i.collection, 0),\
                  count: items.reduce((s: number, i: any) => s + i.count, 0),\
                  paid: items.reduce((s: number, i: any) => s + i.paid, 0),\
                  totalPOS: items.reduce((s: number, i: any) => s + i.totalPOS, 0),\
                  paidPOS: items.reduce((s: number, i: any) => s + i.paidPOS, 0),\
                  posPaidOnlyCount: items.reduce((s: number, i: any) => s + i.posPaidOnlyCount, 0),\
                  posPaidOnlyPOS: items.reduce((s: number, i: any) => s + i.posPaidOnlyPOS, 0),\
                  target: items.reduce((s: number, i: any) => s + i.target, 0),\
                  dailyRequiredPOS: items.reduce((s: number, i: any) => s + (i.dailyRequiredPOS || 0), 0),\
                };\
                const subPct = sub.totalPOS ? sub.paidPOS / sub.totalPOS : 0;\
                return (\
                  <Fragment key={bkt}>\
                    <tr className="bg-primary/10 border-b border-border">\
                      <td colSpan={13} className="px-3 py-2.5 font-sans text-[11px] font-bold text-primary uppercase tracking-[0.1em]">BUCKET {bkt}</td>\
                    </tr>\
                    {items.map((item: any) => (\
                      <tr key={item.city} className="border-b border-border transition-colors hover:bg-muted/30">\
                        <td className="px-3 py-2 text-center font-bold text-muted-foreground text-xs">{item.globalRank}</td>\
                        <td className="px-3 py-2 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ city: item.city })}>{item.city}</td>\
                        <td className="px-3 py-2 text-right text-primary font-tabular-nums font-semibold">{fmtCur(item.collection)}</td>\
                        <td className="px-3 py-2 text-right cursor-pointer hover:text-primary transition-colors hover:bg-primary/5" onClick={() => navigateToExplorer({ city: item.city })}>{item.count}</td>\
                        <td className="px-3 py-2 text-right font-tabular-nums font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city })}>{item.paid}</td>\
                        <td className="px-3 py-2 text-right font-tabular-nums font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city })}>{item.posPaidOnlyCount}</td>\
                        <td className="px-3 py-2 text-right font-tabular-nums">{fmtCur(item.totalPOS)}</td>\
                        <td className="px-3 py-2 text-right font-tabular-nums text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city })}>{fmtCur(item.paidPOS)}</td>\
                        <td className="px-3 py-2 text-right">{item.target <= 0 ? <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Achieved</span> : <span className="text-rose-600 dark:text-rose-400 font-tabular-nums font-bold tracking-tight">{fmtCur(item.target)}</span>}</td>\
                        <td className="px-3 py-2 text-right text-xs text-muted-foreground">{item.targetDate || "-"}</td>\
                        <td className="px-3 py-2 text-right font-tabular-nums font-bold tracking-tight text-amber-600">{fmtCur(item.dailyRequiredPOS || 0)}</td>\
                        <td className="px-3 py-2 text-right font-tabular-nums font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city })}>{fmtCur(item.posPaidOnlyPOS)}</td>\
                        <td className={`px-3 py-2 text-right font-tabular-nums font-bold ${pctColor(item.pct)}`}>{fmtPct(item.pct)}</td>\
                      </tr>\
                    ))}\
                    <tr className="border-b border-border bg-muted/10 font-medium">\
                      <td className="px-3 py-2 text-center"></td>\
                      <td className="px-3 py-2.5 text-muted-foreground uppercase text-xs tracking-wider">Bucket {bkt} Total</td>\
                      <td className="px-3 py-2 text-right text-primary">{fmtCur(sub.collection)}</td>\
                      <td className="px-3 py-2 text-right">{sub.count}</td>\
                      <td className="px-3 py-2 text-right font-tabular-nums font-medium text-emerald-600 dark:text-emerald-400">{sub.paid}</td>\
                      <td className="px-3 py-2 text-right font-tabular-nums font-medium text-blue-600 dark:text-blue-400">{sub.posPaidOnlyCount}</td>\
                      <td className="px-3 py-2 text-right">{fmtCur(sub.totalPOS)}</td>\
                      <td className="px-3 py-2 text-right">{fmtCur(sub.paidPOS)}</td>\
                      <td className="px-3 py-2 text-right">{sub.target <= 0 ? <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Achieved</span> : <span className="text-rose-600 dark:text-rose-400 font-tabular-nums font-bold tracking-tight">{fmtCur(sub.target)}</span>}</td>\
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">-</td>\
                      <td className="px-3 py-2 text-right font-tabular-nums font-bold tracking-tight text-amber-600">{fmtCur(sub.dailyRequiredPOS || 0)}</td>\
                      <td className="px-3 py-2 text-right font-tabular-nums font-medium text-blue-600 dark:text-blue-400">{fmtCur(sub.posPaidOnlyPOS)}</td>\
                      <td className={`px-3 py-2 text-right ${pctColor(subPct)}`}>{fmtPct(subPct)}</td>\
                    </tr>\
                  </Fragment>\
                );\
              })}\
            </tbody>\
            <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => navigateToExplorer({})}>\
              <tr>\
                <td className="px-3 py-2 text-center"></td>\
                <td className="px-3 py-2.5 font-bold uppercase text-primary">Grand Total</td>\
                <td className="px-3 py-2.5 text-right text-primary font-tabular-nums">{fmtCur(teamPerfGrandTotal.collection)}</td>\
                <td className="px-3 py-2.5 text-right font-tabular-nums">{teamPerfGrandTotal.count}</td>\
                <td className="px-3 py-2.5 text-right font-tabular-nums text-emerald-600 dark:text-emerald-400">{teamPerfGrandTotal.paid}</td>\
                <td className="px-3 py-2.5 text-right font-tabular-nums text-blue-600 dark:text-blue-400">{teamPerfGrandTotal.posPaidOnlyCount}</td>\
                <td className="px-3 py-2.5 text-right font-tabular-nums">{fmtCur(teamPerfGrandTotal.totalPOS)}</td>\
                <td className="px-3 py-2.5 text-right font-tabular-nums text-emerald-600 dark:text-emerald-400">{fmtCur(teamPerfGrandTotal.paidPOS)}</td>\
                <td className="px-3 py-2.5 text-right">\
                  <div className="flex flex-col items-end gap-1">\
                    <span className="text-rose-600 dark:text-rose-400 font-tabular-nums font-bold tracking-tight">{fmtCur(teamPerfGrandTotal.target)}</span>\
                  </div>\
                </td>\
                <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">-</td>\
                <td className="px-3 py-2.5 text-right">\
                  <div className="flex flex-col items-end gap-1">\
                    <span className="text-[10px] font-tabular-nums font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 px-1.5 py-0.5 rounded-sm shadow-sm">DRR: {fmtCur(teamPerfGrandTotal.dailyRequiredPOS || 0)}/d</span>\
                  </div>\
                </td>\
                <td className="px-3 py-2.5 text-right font-tabular-nums text-blue-600 dark:text-blue-400">{fmtCur(teamPerfGrandTotal.posPaidOnlyPOS)}</td>\
                <td className={"px-3 py-2.5 text-right font-tabular-nums " + pctColor(teamPerfGrandTotal.totalPOS ? teamPerfGrandTotal.paidPOS / teamPerfGrandTotal.totalPOS : 0)}>\
                  {fmtPct(teamPerfGrandTotal.totalPOS ? teamPerfGrandTotal.paidPOS / teamPerfGrandTotal.totalPOS : 0)}\
                </td>\
              </tr>\
            </tfoot>\
          </table>\
        </div>\
      </div>\
' src/pages/ExecDashboard.tsx
