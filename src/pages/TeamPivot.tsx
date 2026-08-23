import React, { useMemo } from 'react';
import {
  AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildTeamPivot } from '../lib/pivots';
import { fmtCur, fmtPct, pctColor } from '../lib/formatters';
import { exportTeamPivot } from '../lib/exporter';
import { Download , ArrowUpDown, Filter as FilterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeamPivot() {
  const navigate = useNavigate();
  const { records, targets, isLoading, globalBucket } = useData();
  const navigateToExplorer = (filters: { executive?: string, bucket?: string, paid?: string }) => {
    const params = new URLSearchParams();
    if (globalBucket !== 'ALL') params.set('bucket', globalBucket);
    if (filters.bucket) params.set('bucket', filters.bucket);
    if (filters.executive) params.set('exec', filters.executive);
    if (filters.paid) params.set('paid', filters.paid);
    navigate(`/explorer?${params.toString()}`);
  };
  const { user, isExecutive } = useAuth();

  const filtered = useMemo(() => {
    if (isExecutive() && user) return records.filter(r => r.executive_name === user.name);
    return records;
  }, [records, user, isExecutive]);

  const teamData = useMemo(() => buildTeamPivot(filtered, targets), [filtered, targets]);

  const globalExecCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const exec = String(r.executive_name || r['Executive Name'] || r.EXECUTIVE_NAME || 'UNKNOWN').trim();
      counts[exec] = (counts[exec] || 0) + 1;
    });
    return counts;
  }, [records]);

  // Group by bucket
  const grouped = useMemo(() => {
    const groups: Record<number, any[]> = {};
    teamData.forEach(t => {
      if (!groups[t.bkt]) groups[t.bkt] = [];
      groups[t.bkt].push(t);
    });
    return Object.entries(groups)
      .map(([bkt, items]) => [
        bkt, 
        items.sort((a, b) => (globalExecCounts[b.exec] || 0) - (globalExecCounts[a.exec] || 0))
      ] as [string, any[]])
      .sort(([a], [b]) => Number(a) - Number(b));
  }, [teamData, globalExecCounts]);

  const grandTotal = useMemo(() => ({
    collection: teamData.reduce((s, t) => s + t.collection, 0),
    count: teamData.reduce((s, t) => s + t.count, 0),
    paid: teamData.reduce((s, t) => s + t.paid, 0),
    totalPOS: teamData.reduce((s, t) => s + t.totalPOS, 0),
    paidPOS: teamData.reduce((s, t) => s + t.paidPOS, 0),
    posPaidOnlyCount: teamData.reduce((s, t) => s + t.posPaidOnlyCount, 0),
    posPaidOnlyPOS: teamData.reduce((s, t) => s + t.posPaidOnlyPOS, 0),
    target: teamData.reduce((s, t) => s + t.target, 0),
    dailyRequiredPOS: teamData.reduce((s, t) => s + (t.dailyRequiredPOS || 0), 0),
  }), [teamData]);

  const gPct = grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0;

  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="h-6 w-48 rounded bg-muted"></div>
              <div className="mt-2 h-3 w-32 rounded bg-muted/50"></div>
            </div>
            <div className="h-9 w-24 rounded-md bg-muted"></div>
          </div>
          <div className="mb-6 h-24 rounded-xl bg-card border border-border shadow-sm"></div>
          <div className="h-[500px] rounded-xl bg-card border border-border shadow-sm"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-extrabold uppercase tracking-wide">Team Overall Performance</h1>
          <p className="font-sans text-xs text-muted-foreground">Bucket → Executive · Team Paid Logic</p>
        </div>
        <button onClick={() => exportTeamPivot(teamData)} className="flex h-[34px] items-center gap-2 rounded-md bg-primary px-4 font-sans text-xs font-bold text-primary-foreground hover:opacity-90">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden rounded-xl">
        <div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px] relative bg-card">
        <table className="w-full font-sans text-xs min-w-[1000px]">
          <thead className="sticky top-0 z-30 bg-card shadow-sm border-b-2 border-border">
            <tr className="border-b-2 border-border">
              <th className="px-3 py-2 font-semibold text-center w-10 text-muted-foreground uppercase text-[10px]">S.No.</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Bucket / Executive<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Collection<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Total Count<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Paid Count<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">POS Paid Only Count<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Total POS<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Paid POS<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Needed POS<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Target Date<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Daily Required POS<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">POS Paid Only POS<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">Total %<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(([bkt, items]) => {
              const sub = {
                collection: items.reduce((s: number, i: any) => s + i.collection, 0),
                count: items.reduce((s: number, i: any) => s + i.count, 0),
                paid: items.reduce((s: number, i: any) => s + i.paid, 0),
                totalPOS: items.reduce((s: number, i: any) => s + i.totalPOS, 0),
                paidPOS: items.reduce((s: number, i: any) => s + i.paidPOS, 0),
                posPaidOnlyCount: items.reduce((s: number, i: any) => s + i.posPaidOnlyCount, 0),
                posPaidOnlyPOS: items.reduce((s: number, i: any) => s + i.posPaidOnlyPOS, 0),
                target: items.reduce((s: number, i: any) => s + i.target, 0),
                dailyRequiredPOS: items.reduce((s: number, i: any) => s + (i.dailyRequiredPOS || 0), 0),
              };
              const subPct = sub.totalPOS ? sub.paidPOS / sub.totalPOS : 0;
              return (
                <React.Fragment key={bkt}>
                  <tr className="bg-primary/10 border-b border-border">
                    <td colSpan={9} className="px-3 py-2.5 font-sans text-[11px] font-bold text-primary uppercase tracking-[0.1em]">BUCKET {bkt}</td>
                  </tr>
                  {items.map((item: any, i: number) => (
                    <tr key={item.exec} className="border-b border-border transition-colors hover:bg-muted">
                      <td className="px-3 py-2 text-center font-bold text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-3 py-2 pl-6">{item.exec}</td>
                      <td className="px-3 py-2 text-right text-primary font-bold">{fmtCur(item.collection)}</td>
                      <td className="px-3 py-2 text-right">{item.count}</td>
                      <td className="px-3 py-2 text-right text-success">{item.paid}</td>
                      <td className="px-3 py-2 text-right text-info">{item.posPaidOnlyCount}</td>
                      <td className="px-3 py-2 text-right font-medium">{fmtCur(item.totalPOS)}</td>
                      <td className="px-3 py-2 text-right font-medium">{fmtCur(item.paidPOS)}</td>
                      <td className="px-3 py-2 text-right">{item.target <= 0 ? <span className="text-xs font-bold text-success uppercase">Achieved</span> : <span className="text-destructive font-bold">{fmtCur(item.target)}</span>}</td>
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">{item.targetDate || "-"}</td>
                      <td className="px-3 py-2 text-right font-semibold text-amber-600">{fmtCur(item.dailyRequiredPOS || 0)}</td>
                      <td className="px-3 py-2 text-right text-info">{fmtCur(item.posPaidOnlyPOS)}</td>
                      <td className={`px-3 py-2 text-right font-bold ${pctColor(item.pct)}`}>{fmtPct(item.pct)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-[rgba(255,255,255,0.08)] bg-white/5 font-medium">
                    <td className="px-3 py-2 text-center"></td>
                    <td className="px-3 py-2.5 pl-6 text-muted-foreground uppercase text-xs tracking-wider">Bucket {bkt} Total</td>
                    <td className="px-3 py-2 text-right text-primary">{fmtCur(sub.collection)}</td>
                    <td className="px-3 py-2 text-right">{sub.count}</td>
                    <td className="px-3 py-2 text-right text-success">{sub.paid}</td>
                    <td className="px-3 py-2 text-right text-info">{sub.posPaidOnlyCount}</td>
                    <td className="px-3 py-2 text-right">{fmtCur(sub.totalPOS)}</td>
                    <td className="px-3 py-2 text-right">{fmtCur(sub.paidPOS)}</td>
                    <td className="px-3 py-2 text-right">{sub.target <= 0 ? <span className="text-xs font-bold text-success uppercase">Achieved</span> : <span className="text-destructive font-bold">{fmtCur(sub.target)}</span>}</td>
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">-</td>
                    <td className="px-3 py-2 text-right font-semibold text-amber-600">{fmtCur(sub.dailyRequiredPOS || 0)}</td>
                    <td className="px-3 py-2 text-right text-info">{fmtCur(sub.posPaidOnlyPOS)}</td>
                    <td className={`px-3 py-2 text-right ${pctColor(subPct)}`}>{fmtPct(subPct)}</td>
                  </tr>
                </React.Fragment>
              );
            })}
            
          </tbody>

          <tfoot className="bg-card font-bold sticky bottom-0 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] border-t-2 border-border transition-colors">
            <tr>
              <td className="px-3 py-2 text-center"></td>
              <td className="px-3 py-2.5 font-bold uppercase text-primary cursor-pointer hover:underline" onClick={() => navigateToExplorer({})}>Grand Total</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-success cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{fmtCur(grandTotal.collection)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{grandTotal.count}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-info cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{grandTotal.paid}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{grandTotal.posPaidOnlyCount}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{fmtCur(grandTotal.totalPOS)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{fmtCur(grandTotal.paidPOS)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-warning">{fmtCur(grandTotal.target)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-muted-foreground">-</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-amber-600">{fmtCur(grandTotal.dailyRequiredPOS || 0)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-muted-foreground">{fmtCur(grandTotal.posPaidOnlyPOS)}</td>
              <td className={"px-3 py-2.5 text-right font-data font-bold " + pctColor(grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0)}>
                {fmtPct(grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>
    </AppLayout>
  );
}
