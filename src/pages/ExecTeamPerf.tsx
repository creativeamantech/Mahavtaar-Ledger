import React, { useState, useMemo } from 'react';
import {
  AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildExecCityPivot } from '../lib/pivots';
import { fmtCur, fmtPct, pctColor } from '../lib/formatters';
import { exportExecCityPivot } from '../lib/exporter';
import { Download, Plus, Search, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Link } from 'react-router-dom';
import { BucketFilter } from '../components/BucketFilter';

export default function ExecTeamPerf() {
  const navigate = useNavigate();
  const { records, targets, isLoading, globalBucket } = useData();
  const navigateToExplorer = (filters: { executive?: string, city?: string, bucket?: string, paid?: string }) => {
    const params = new URLSearchParams();
    if (globalBucket !== 'ALL') params.set('bucket', globalBucket);
    if (filters.bucket) params.set('bucket', filters.bucket);
    if (filters.executive) params.set('exec', filters.executive);
    if (filters.city) params.set('city', filters.city);
    if (filters.paid) params.set('paid', filters.paid);
    navigate(`/explorer?${params.toString()}`);
  };
  const { user, isExecutive } = useAuth();

  const [filterText, setFilterText] = useState('');
  const [sortSearch, setSortSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}[]>([]);


  const filtered = useMemo(() => {
    return records;
  }, [records]);

  const rawCityData = useMemo(() => buildExecCityPivot(filtered, targets), [filtered, targets]);
  
  const cityData = useMemo(() => {
    let data = [...rawCityData];
    
    if (filterText) {
      data = data.filter(d => d.city.toLowerCase().includes(filterText.toLowerCase()));
    }
    
    
    if (sortConfig.length > 0) {
      data.sort((a: any, b: any) => {
        for (const sort of sortConfig) {
          let valA = a[sort.key];
          let valB = b[sort.key];
          
          if (sort.key === 'pct') {
            valA = a.totalPOS ? a.paidPOS / a.totalPOS : 0;
            valB = b.totalPOS ? b.paidPOS / b.totalPOS : 0;
          }

          const numA = Number(valA);
          const numB = Number(valB);
          
          let comp = 0;
          if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
            comp = sort.direction === 'asc' ? numA - numB : numB - numA;
          } else {
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
            comp = sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          if (comp !== 0) return comp;
        }
        return 0;
      });
    }
    
    return data;
  }, [rawCityData, filterText, sortConfig]);

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
    
    // Create ranks
    const allNames = Object.keys(globalCityCounts).sort((a, b) => globalCityCounts[b] - globalCityCounts[a]);
    const getRank = (name: string) => allNames.indexOf(name) + 1;

    return Object.entries(groups)
      .map(([bkt, items]) => {
         const sorted = sortConfig.length > 0 ? items : [...items].sort((a, b) => b.count - a.count);
         const bucketSortedItems = [...items].sort((a, b) => b.count - a.count);
         const getBucketRank = (name: string) => bucketSortedItems.findIndex(i => i.city === name) + 1;
         const itemsWithRank = sorted.map(item => ({ ...item, globalRank: getBucketRank(item.city) }));
         
         return [bkt, itemsWithRank] as [string, any[]];
      })
      .sort(([a], [b]) => Number(a) - Number(b));
  }, [cityData, globalCityCounts, sortConfig]);

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
      <div className="mb-4"><BucketFilter /></div>
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
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Team Performance
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 pl-4">Enterprise Data Report · Bucket → Executive</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-64 shadow-sm"
              />
            </div>
            <button onClick={() => exportExecTeamPerf(rawTeamData)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-sm transition-all">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total POS', value: fmtCur(grandTotal.totalPOS), color: 'text-slate-900 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
            { label: 'Paid POS', value: fmtCur(grandTotal.paidPOS), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
            { label: 'Needed POS', value: fmtCur(grandTotal.target), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-950/20' },
            { label: 'Overall %', value: fmtPct(grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
          ].map((kpi, i) => (
            <div key={i} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${kpi.bg} flex flex-col justify-center`}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</div>
              <div className={`text-2xl font-bold font-tabular-nums ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter City..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="pl-8 pr-3 py-1.5 h-8 text-xs bg-card border border-border rounded-md outline-none focus:border-primary w-48"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex h-8 items-center gap-1.5 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
              <Plus className="h-3.5 w-3.5" /> Add Sort
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By Column</h4>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search columns..." 
                className="w-full pl-6 pr-2 py-1 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                value={sortSearch}
                onChange={e => setSortSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto no-scrollbar pr-2">
              {[
                { key: 'city', label: 'City' },
                { key: 'collection', label: 'Collection' },
                { key: 'count', label: 'Total Count' },
                { key: 'paid', label: 'Paid Count' },
                { key: 'posPaidOnlyCount', label: 'POS Paid Only Count' },
                { key: 'totalPOS', label: 'Total POS' },
                { key: 'paidPOS', label: 'Paid POS' },
                { key: 'target', label: 'Needed POS' },
                { key: 'dailyRequiredPOS', label: 'Daily Required POS' },
                { key: 'posPaidOnlyPOS', label: 'POS Paid Only POS' },
                { key: 'pct', label: 'Total %' }
              ].filter(opt => opt.label.toLowerCase().includes(sortSearch.toLowerCase())).map(opt => (
                <div key={opt.key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded transition-colors cursor-pointer" onClick={() => {
                  setSortConfig(prev => {
                    const exists = prev.find(s => s.key === opt.key);
                    if (exists) return prev.filter(s => s.key !== opt.key);
                    return [...prev, { key: opt.key, direction: 'asc' }];
                  });
                }}>
                  <Checkbox className="pointer-events-none" checked={!!sortConfig.find(s => s.key === opt.key)} />
                  <span className="text-xs truncate flex-1">{opt.label}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
    {sortConfig.map(sort => {
    const labels: Record<string, string> = { city: 'City', collection: 'Collection', count: 'Total Count', paidCount: 'Paid Count', totalPOS: 'Total POS', paidPOS: 'Paid POS', pct: 'Paid %', team: 'Team', exec: 'Executive', target: 'Target', ach: 'Achieved', _posVal: 'Principal (POS)', _emiVal: 'EMI', aggr: 'Agreement Number', name: 'Customer Name' };
    return (
      <div key={sort.key} className="flex h-8 items-center gap-1.5 bg-muted/50 border border-border px-2 rounded-md text-xs font-bold uppercase tracking-wider text-foreground">
          Sort: {labels[sort.key] || sort.key}
          <button onClick={() => setSortConfig(prev => prev.map(s => s.key === sort.key ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' } : s))} className="ml-1 text-muted-foreground hover:text-foreground">
            {sort.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setSortConfig(prev => prev.filter(s => s.key !== sort.key))} className="ml-1 text-muted-foreground hover:text-rose-600 dark:text-rose-400">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
    );
  })}
  
      </div>
      <div className="">

        <div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px] relative bg-card rounded-md border shadow-sm">
        <table className="w-full font-sans text-xs min-w-[1000px]">
          <thead className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 border-b border-border shadow-sm">
            <tr>
              <th  className={`${sortConfig.some(s => s.key === 'exec') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-left uppercase tracking-wider text-[11px] align-middle`}>Bucket / Executive</th>
              <th  className={`${sortConfig.some(s => s.key === 'collection') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>Collection</th>
              <th  className={`${sortConfig.some(s => s.key === 'count') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>Total Count</th>
              <th  className={`${sortConfig.some(s => s.key === 'paid') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>Paid Count</th>
              <th  className={`${sortConfig.some(s => s.key === 'posPaidOnlyCount') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>POS Paid Only Count</th>
              <th  className={`${sortConfig.some(s => s.key === 'totalPOS') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>Total POS</th>
              <th  className={`${sortConfig.some(s => s.key === 'paidPOS') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>Paid POS</th>
              <th  className={`${sortConfig.some(s => s.key === 'target') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>Needed / DRR</th>

              <th  className={`${sortConfig.some(s => s.key === 'posPaidOnlyPOS') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>POS Paid Only POS</th>
              <th  className={`${sortConfig.some(s => s.key === 'pct') ? 'text-foreground font-bold bg-slate-100 dark:bg-slate-800' : 'text-muted-foreground font-semibold'} px-3 py-3 text-right uppercase tracking-wider text-[11px] align-middle`}>Total %</th>
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
                    <tr key={item.city} className="border-b border-border transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80">
                      <td className="px-3 py-2 text-center font-bold text-muted-foreground text-xs">{item.globalRank}</td>
                      <td className="px-3 py-2 pl-6">{item.city}</td>
                      <td className="px-3 py-2 text-right text-primary font-tabular-nums font-semibold">{fmtCur(item.collection)}</td>
                      <td className="px-3 py-2 text-right">{item.count}</td>
                      <td className="px-3 py-2 text-right font-tabular-nums font-medium text-emerald-600 dark:text-emerald-400">{item.paid}</td>
                      <td className="px-3 py-2 text-right font-tabular-nums font-medium text-blue-600 dark:text-blue-400">{item.posPaidOnlyCount}</td>
                      <td className="px-3 py-2 text-right font-tabular-nums">{fmtCur(item.totalPOS)}</td>
                      <td className="px-3 py-2 text-right font-tabular-nums">{fmtCur(item.paidPOS)}</td>
                      <td className="px-3 py-2 text-right">{item.target <= 0 ? <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Achieved</span> : <span className="text-rose-600 dark:text-rose-400 font-tabular-nums font-bold tracking-tight">{fmtCur(item.target)}</span>}</td>
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">{item.targetDate || "-"}</td>
                      <td className="px-3 py-2 text-right font-tabular-nums font-bold tracking-tight text-amber-600">{fmtCur(item.dailyRequiredPOS || 0)}</td>
                      <td className="px-3 py-2 text-right font-tabular-nums font-medium text-blue-600 dark:text-blue-400">{fmtCur(item.posPaidOnlyPOS)}</td>
                      <td className={`px-3 py-2 text-right font-tabular-nums font-bold ${pctColor(item.pct)}`}>{fmtPct(item.pct)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-[rgba(255,255,255,0.08)] bg-white/5 font-medium">
                    <td className="px-3 py-2 text-center"></td>
                    <td className="px-3 py-2.5 pl-6 text-muted-foreground uppercase text-xs tracking-wider">Bucket {bkt} Total</td>
                    <td className="px-3 py-2 text-right text-primary">{fmtCur(sub.collection)}</td>
                    <td className="px-3 py-2 text-right">{sub.count}</td>
                    <td className="px-3 py-2 text-right font-tabular-nums font-medium text-emerald-600 dark:text-emerald-400">{sub.paid}</td>
                    <td className="px-3 py-2 text-right font-tabular-nums font-medium text-blue-600 dark:text-blue-400">{sub.posPaidOnlyCount}</td>
                    <td className="px-3 py-2 text-right">{fmtCur(sub.totalPOS)}</td>
                    <td className="px-3 py-2 text-right">{fmtCur(sub.paidPOS)}</td>
                    <td className="px-3 py-2 text-right">{sub.target <= 0 ? <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Achieved</span> : <span className="text-rose-600 dark:text-rose-400 font-tabular-nums font-bold tracking-tight">{fmtCur(sub.target)}</span>}</td>
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">-</td>
                    <td className="px-3 py-2 text-right font-tabular-nums font-bold tracking-tight text-amber-600">{fmtCur(sub.dailyRequiredPOS || 0)}</td>
                    <td className="px-3 py-2 text-right font-tabular-nums font-medium text-blue-600 dark:text-blue-400">{fmtCur(sub.posPaidOnlyPOS)}</td>
                    <td className={`px-3 py-2 text-right ${pctColor(subPct)}`}>{fmtPct(subPct)}</td>
                  </tr>
                </React.Fragment>
              );
            })}
            
          </tbody>

          <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold sticky bottom-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t-2 border-slate-400 dark:border-slate-600">
            <tr>
              <td className="px-3 py-2 text-center"></td>
              <td className="px-3 py-2.5 font-bold uppercase text-primary cursor-pointer hover:underline" onClick={() => navigateToExplorer({})}>Grand Total</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{fmtCur(grandTotal.collection)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{grandTotal.count}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{grandTotal.paid}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{grandTotal.posPaidOnlyCount}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{fmtCur(grandTotal.totalPOS)}</td>
              <td className="px-3 py-2.5 text-right font-data font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ paid: 'Paid' })}>{fmtCur(grandTotal.paidPOS)}</td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-rose-600 dark:text-rose-400 font-tabular-nums font-bold tracking-tight">{fmtCur(grandTotal.target)}</span>
                  <span className="text-[10px] font-tabular-nums font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 px-1.5 py-0.5 rounded-sm shadow-sm">DRR: {fmtCur(grandTotal.dailyRequiredPOS || 0)}/d</span>
                </div>
              </td>
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
