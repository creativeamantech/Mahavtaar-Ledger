import React, { useMemo } from 'react';
import {
  AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildBucketCityPivot } from '../lib/pivots';
import { fmtCur, fmtPct, pctColor } from '../lib/formatters';
import { exportBucketCityPivot } from '../lib/exporter';
import { Download , ArrowUpDown, Filter as FilterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';

export default function CityPivot() {
  const navigate = useNavigate();
  const navigateToExplorer = (filters: { city?: string, bucket?: string, paid?: string }) => {
    const params = new URLSearchParams();
    if (globalBucket !== 'ALL') params.set('bucket', globalBucket);
    if (filters.bucket) params.set('bucket', filters.bucket);
    if (filters.city) params.set('city', filters.city);
    if (filters.paid) params.set('paid', filters.paid);
    navigate(`/explorer?${params.toString()}`);
  };
  const { records, targets, isLoading, globalBucket } = useData();
  const { user, isExecutive } = useAuth();

  const filtered = useMemo(() => {
    if (isExecutive() && user) return records.filter(r => r.executive_name === user.name);
    return records;
  }, [records, user, isExecutive]);

  const cityData = useMemo(() => buildBucketCityPivot(filtered, targets), [filtered, targets]);

  const globalCityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const city = (r.city || r.City || 'UNKNOWN').trim().toUpperCase();
      counts[city] = (counts[city] || 0) + 1;
    });
    return counts;
  }, [records]);

  // Group by bucket
  const grouped = useMemo(() => {
    const groups: Record<number, any[]> = {};
    cityData.forEach(t => {
      if (!groups[t.bkt]) groups[t.bkt] = [];
      groups[t.bkt].push(t);
    });
    return Object.entries(groups)
      .map(([bkt, items]) => [
        bkt, 
        items.sort((a, b) => (globalCityCounts[b.city] || 0) - (globalCityCounts[a.city] || 0))
      ] as [string, any[]])
      .sort(([a], [b]) => Number(a) - Number(b));
  }, [cityData, globalCityCounts]);

  const grandTotal = useMemo(() => ({
    collection: cityData.reduce((s, t) => s + t.collection, 0),
    count: cityData.reduce((s, t) => s + t.count, 0),
    paid: cityData.reduce((s, t) => s + t.paid, 0),
    totalPOS: cityData.reduce((s, t) => s + t.totalPOS, 0),
    paidPOS: cityData.reduce((s, t) => s + t.paidPOS, 0),
    posPaidOnlyCount: cityData.reduce((s, t) => s + t.posPaidOnlyCount, 0),
    posPaidOnlyPOS: cityData.reduce((s, t) => s + t.posPaidOnlyPOS, 0),
    target: cityData.reduce((s, t) => s + t.target, 0),
    dailyRequiredPOS: cityData.reduce((s, t) => s + (t.dailyRequiredPOS || 0), 0),
  }), [cityData]);

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
          <h1 className="font-sans text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">City Overall Performance</h1>
          <p className="font-sans text-xs text-muted-foreground mt-1">Bucket → City · Main Paid Logic</p>
        </div>
        <button onClick={() => exportBucketCityPivot(cityData)} className="flex h-[34px] items-center gap-2 rounded-md bg-primary px-4 font-sans text-xs font-bold text-primary-foreground hover:opacity-90">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden rounded-xl">
        <div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px] relative bg-card">
        <table className="w-full font-sans text-xs min-w-[1000px]">
          <thead className="sticky top-0 z-30 bg-card shadow-sm border-b-2 border-border">
            <tr className="border-b-2 border-border">
              <th className="px-3 py-2 font-semibold text-center w-10 text-muted-foreground uppercase text-[10px]">S.No.</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Bucket / City<span className="inline-flex items-center ml-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity"><ArrowUpDown className="h-3 w-3" /><FilterIcon className="h-3 w-3 ml-1" /></span></th>
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
                    <td colSpan={10} className="px-3 py-2.5 font-sans text-[11px] font-bold text-primary uppercase tracking-[0.1em]">BUCKET {bkt}</td>
                  </tr>
                  {items.map((item: any, i: number) => (
                    <tr key={item.city} className="border-b border-border transition-colors hover:bg-muted">
                      <td className="px-3 py-2 text-center font-bold text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-3 py-2 pl-6 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{item.city}</td>
                      <td className="px-3 py-2 text-right text-primary font-bold cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{fmtCur(item.collection)}</td>
                      <td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{item.count}</td>
                      <td className="px-3 py-2 text-right text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: 'Paid' })}>{item.paid}</td>
                      <td className="px-3 py-2 text-right text-info cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: 'Paid' })}>{item.posPaidOnlyCount}</td>
                      <td className="px-3 py-2 text-right font-medium cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{fmtCur(item.totalPOS)}</td>
                      <td className="px-3 py-2 text-right font-medium cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: 'Paid' })}>{fmtCur(item.paidPOS)}</td>
                      <td className="px-3 py-2 text-right">{item.target <= 0 ? <span className="text-[10px] font-bold text-success uppercase">Achieved</span> : <span className="text-destructive font-bold">{fmtCur(item.target)}</span>}</td>
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">{item.targetDate || "-"}</td>
                      <td className="px-3 py-2 text-right font-semibold text-amber-600">{fmtCur(item.dailyRequiredPOS || 0)}</td>
                      <td className="px-3 py-2 text-right text-info">{fmtCur(item.posPaidOnlyPOS)}</td>
                      <td className={`px-3 py-2 text-right font-bold ${pctColor(item.pct)}`}>{fmtPct(item.pct)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-[rgba(255,255,255,0.08)] bg-black/5 dark:bg-white/5 font-medium">
                    <td className="px-3 py-2 text-center"></td>
                    <td className="px-3 py-2.5 pl-6 text-muted-foreground uppercase text-[10px] tracking-wider">Bucket {bkt} Total</td>
                    <td className="px-3 py-2 text-right text-primary cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt })}>{fmtCur(sub.collection)}</td>
                    <td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt })}>{sub.count}</td>
                    <td className="px-3 py-2 text-right text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt, paid: 'Paid' })}>{sub.paid}</td>
                    <td className="px-3 py-2 text-right text-info cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt, paid: 'Paid' })}>{sub.posPaidOnlyCount}</td>
                    <td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt })}>{fmtCur(sub.totalPOS)}</td>
                    <td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt, paid: 'Paid' })}>{fmtCur(sub.paidPOS)}</td>
                    <td className="px-3 py-2 text-right">{sub.target <= 0 ? <span className="text-[10px] font-bold text-success uppercase">Achieved</span> : <span className="text-destructive font-bold">{fmtCur(sub.target)}</span>}</td>
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