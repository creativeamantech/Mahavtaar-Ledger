import React, { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildBucketCityPivot } from '../lib/pivots';
import { fmtCur, fmtPct, pctColor } from '../lib/formatters';
import { exportBucketCityPivot } from '../lib/exporter';
import { Download, Search, ArrowUp, ArrowDown, X, Plus, TrendingUp, Target, Wallet, BarChart3, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { HeatBar, getHeatmapCellClass } from '../components/ui/HeatBar';
import { BucketFilter } from '../components/BucketFilter';

// Design tokens
const C = {
  ink:        'text-[#0f1117]  dark:text-[#f0f2f8]',
  muted:      'text-[#6b7280]  dark:text-[#9ca3af]',
  card:       'bg-white        dark:bg-[#111318]',
  surface:    'bg-[#f8f9fc]    dark:bg-[#0d0f14]',
  border:     'border-[#e5e8f0] dark:border-[#1e2330]',
  row:        'hover:bg-[#f3f6ff] dark:hover:bg-[#15192a] transition-colors duration-100',
  rowAlt:     'bg-[#fafbfd] dark:bg-[#0f1219]',
  bucketHead: 'bg-[#0f1117] dark:bg-[#070910]',
  subTotal:   'bg-[#f0f4ff] dark:bg-[#0d1220]',
  footerBg:   'bg-[#0f1117] dark:bg-[#070910]',
  emerald:    'text-[#059669] dark:text-[#34d399]',
  rose:       'text-[#e11d48] dark:text-[#fb7185]',
  amber:      'text-[#d97706] dark:text-[#fbbf24]',
  blue:       'text-[#2563eb] dark:text-[#60a5fa]',
  indigo:     'text-[#4f46e5] dark:text-[#818cf8]',
};

// Header Sort Cell
function Th({
  label,
  sortKey,
  currentSort,
  onSort,
  right = false,
  className = '',
  stickyLeft = false,
  stickyLeftOffset = 0,
}: {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: 'asc' | 'desc' }[];
  onSort: (key: string) => void;
  right?: boolean;
  className?: string;
  stickyLeft?: boolean;
  stickyLeftOffset?: number;
}) {
  const active = currentSort.find(s => s.key === sortKey);
  const stickyStyle: React.CSSProperties = stickyLeft
    ? { position: 'sticky', left: stickyLeftOffset, zIndex: 35 }
    : {};

  return (
    <th
      style={stickyStyle}
      onClick={() => onSort(sortKey)}
      className={`
        px-3 py-3 select-none cursor-pointer text-[11px] font-bold uppercase tracking-wider
        border-b ${C.border} transition-colors whitespace-nowrap bg-[#f8f9fc] dark:bg-[#0d0f14]
        ${right ? 'text-right' : 'text-left'}
        ${active ? 'text-primary bg-primary/5' : C.muted + ' hover:text-foreground'}
        ${className}
      `}
    >
      <div className={`inline-flex items-center gap-1 ${right ? 'justify-end' : 'justify-start'}`}>
        <span>{label}</span>
        {active && (
          active.direction === 'asc'
            ? <ArrowUp className="h-3 w-3 text-primary shrink-0" />
            : <ArrowDown className="h-3 w-3 text-primary shrink-0" />
        )}
      </div>
    </th>
  );
}

export default function CityPivot() {
  const navigate = useNavigate();
  const { records, targets, isLoading, globalBucket } = useData();
  const { user, isExecutive } = useAuth();

  const [filterText, setFilterText] = useState('');
  const [sortSearch, setSortSearch]   = useState('');
  const [sortConfig, setSortConfig]   = useState<{ key: string; direction: 'asc' | 'desc' }[]>([]);
  const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({});

  const navigateToExplorer = (filters: { city?: string; bucket?: string; paid?: string }) => {
    const params = new URLSearchParams();
    if (globalBucket !== 'ALL') params.set('bucket', globalBucket);
    if (filters.bucket) params.set('bucket', filters.bucket);
    if (filters.city)   params.set('city', filters.city);
    if (filters.paid)   params.set('paid', filters.paid);
    navigate(`/explorer?${params.toString()}`);
  };

  const filtered = useMemo(() => {
    if (isExecutive() && user) return records.filter(r => r.executive_name === user.name);
    return records;
  }, [records, user, isExecutive]);

  // Build raw pivot
  const rawCityData = useMemo(() => {
    return buildBucketCityPivot(filtered, targets);
  }, [filtered, targets]);

  // Compute global rank
  const cityTotalsForRank = useMemo(() => {
    const map: Record<string, { totalPOS: number; paidPOS: number }> = {};
    rawCityData.forEach((d: any) => {
      if (!map[d.city]) map[d.city] = { totalPOS: 0, paidPOS: 0 };
      map[d.city].totalPOS += (d.totalPOS || 0);
      map[d.city].paidPOS  += (d.paidPOS  || 0);
    });
    return Object.entries(map)
      .map(([city, s]) => ({ city, pct: s.totalPOS > 0 ? s.paidPOS / s.totalPOS : 0, paidPOS: s.paidPOS }))
      .sort((a, b) => b.pct !== a.pct ? b.pct - a.pct : b.paidPOS - a.paidPOS)
      .reduce((acc, cur, idx) => { acc[cur.city] = idx + 1; return acc; }, {} as Record<string, number>);
  }, [rawCityData]);

  // Filtered & sorted data
  const cityData = useMemo(() => {
    let data = rawCityData.map((d: any) => ({
      ...d,
      globalRank: cityTotalsForRank[d.city] ?? 999,
    }));

    if (filterText) {
      data = data.filter((d: any) => d.city.toLowerCase().includes(filterText.toLowerCase()));
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
  }, [rawCityData, filterText, sortConfig, cityTotalsForRank]);

  // Group by bucket
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    cityData.forEach((item: any) => {
      const b = String(item.bkt || '-');
      if (!map[b]) map[b] = [];
      map[b].push(item);
    });
    return Object.entries(map).sort(([a], [b]) => {
      const na = Number(a); const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [cityData]);

  // Grand totals
  const grandTotal = useMemo(() => {
    return rawCityData.reduce(
      (acc: any, cur: any) => ({
        collection:       acc.collection       + (cur.collection       || 0),
        count:            acc.count            + (cur.count            || 0),
        paid:             acc.paid             + (cur.paid             || 0),
        totalPOS:         acc.totalPOS         + (cur.totalPOS         || 0),
        paidPOS:          acc.paidPOS          + (cur.paidPOS          || 0),
        posPaidOnlyCount: acc.posPaidOnlyCount + (cur.posPaidOnlyCount || 0),
        posPaidOnlyPOS:   acc.posPaidOnlyPOS   + (cur.posPaidOnlyPOS   || 0),
        target:           acc.target           + (cur.target           || 0),
        dailyRequiredPOS: acc.dailyRequiredPOS + (cur.dailyRequiredPOS || 0),
      }),
      { collection: 0, count: 0, paid: 0, totalPOS: 0, paidPOS: 0, posPaidOnlyCount: 0, posPaidOnlyPOS: 0, target: 0, dailyRequiredPOS: 0 }
    );
  }, [rawCityData]);

  const grandPct = grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0;

  const toggleSort = (key: string) => {
    setSortConfig(prev => {
      const exists = prev.find(s => s.key === key);
      if (!exists) return [...prev, { key, direction: 'asc' }];
      if (exists.direction === 'asc') return prev.map(s => s.key === key ? { ...s, direction: 'desc' } : s);
      return prev.filter(s => s.key !== key);
    });
  };

  const toggleBucket = (bkt: string) => {
    setCollapsed(prev => ({ ...prev, [bkt]: !prev[bkt] }));
  };

  const thProps = { currentSort: sortConfig, onSort: toggleSort };

  return (
    <AppLayout>
      <div className="mb-4"><BucketFilter /></div>
      <div className="space-y-4">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> City Pivot Matrix
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Geographical collection breakdown with sticky freeze-panes and inline recovery heatmaps
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportBucketCityPivot(cityData, targets)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Excel
            </button>
          </div>
        </div>

        {/* Top Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Outstanding', value: fmtCur(grandTotal.totalPOS), sub: `${grandTotal.count.toLocaleString()} cases`, color: 'text-foreground' },
            { label: 'Total Recovered',   value: fmtCur(grandTotal.paidPOS),  sub: `${grandTotal.paid.toLocaleString()} accounts paid`, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Needed Target',     value: fmtCur(grandTotal.target),   sub: `DRR: ₹${fmtCur(grandTotal.dailyRequiredPOS)}/day`, color: 'text-rose-600 dark:text-rose-400' },
            { label: 'Portfolio Recovery', value: fmtPct(grandPct),            sub: `${grouped.length} active buckets`, color: pctColor(grandPct) },
          ].map((card, i) => (
            <div key={i} className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">{card.label}</span>
              <span className={`text-xl font-black font-mono tracking-tight mt-0.5 block ${card.color}`}>{card.value}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">{card.sub}</span>
            </div>
          ))}
        </div>

        {/* Filter & Multi-Sort Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search City..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="pl-8 pr-3 py-1.5 h-8 text-xs bg-card border border-border rounded-lg outline-none focus:border-primary w-48 shadow-xs"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-8 items-center gap-1.5 px-3 rounded-lg border border-dashed border-border hover:bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card shadow-xs">
                <Plus className="h-3.5 w-3.5" /> Add Sort
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort Column</h4>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter columns..."
                  className="w-full pl-6 pr-2 py-1 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary"
                  value={sortSearch}
                  onChange={e => setSortSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                {[
                  { key: 'city',             label: 'City' },
                  { key: 'collection',       label: 'Collection' },
                  { key: 'count',            label: 'Total Count' },
                  { key: 'paid',             label: 'Paid Count' },
                  { key: 'posPaidOnlyCount', label: 'POS Paid Only Count' },
                  { key: 'totalPOS',         label: 'Total POS' },
                  { key: 'paidPOS',          label: 'Paid POS' },
                  { key: 'target',           label: 'Needed POS' },
                  { key: 'dailyRequiredPOS', label: 'Daily Required POS' },
                  { key: 'posPaidOnlyPOS',   label: 'POS Paid Only POS' },
                  { key: 'pct',              label: 'Total %' },
                ]
                  .filter(opt => opt.label.toLowerCase().includes(sortSearch.toLowerCase()))
                  .map(opt => (
                    <div
                      key={opt.key}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded cursor-pointer text-xs"
                      onClick={() => toggleSort(opt.key)}
                    >
                      <Checkbox className="pointer-events-none" checked={!!sortConfig.find(s => s.key === opt.key)} />
                      <span>{opt.label}</span>
                    </div>
                  ))}
              </div>
            </PopoverContent>
          </Popover>

          {sortConfig.map(sort => {
            const labels: Record<string, string> = {
              city: 'City', collection: 'Collection', count: 'Count', paid: 'Paid',
              totalPOS: 'Total POS', paidPOS: 'Paid POS', pct: 'Total %', target: 'Needed',
              posPaidOnlyCount: 'POS Paid Count', posPaidOnlyPOS: 'POS Paid POS',
              dailyRequiredPOS: 'DRR'
            };
            return (
              <div key={sort.key} className="flex h-8 items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                <span>{labels[sort.key] || sort.key}</span>
                <button
                  onClick={() => toggleSort(sort.key)}
                  className="hover:opacity-75"
                >
                  {sort.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setSortConfig(prev => prev.filter(s => s.key !== sort.key))}
                  className="ml-0.5 hover:text-rose-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* High-Density Data Grid with Freeze Panes */}
        <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-xs">
          <div className="overflow-auto max-h-[calc(100vh-280px)] scrollbar-thin">
            <table className="w-full text-xs border-collapse font-sans min-w-[1000px]">
              {/* Sticky Top Header */}
              <thead className="sticky top-0 z-30 shadow-xs">
                <tr>
                  <Th label="#"                 sortKey="globalRank"       {...thProps} stickyLeft stickyLeftOffset={0} className="w-10 text-center" />
                  <Th label="Bucket / City"     sortKey="city"             {...thProps} stickyLeft stickyLeftOffset={40} className="min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" />
                  <Th label="Collection (DAC)"  sortKey="collection"       {...thProps} right />
                  <Th label="Total Count"       sortKey="count"            {...thProps} right />
                  <Th label="Paid Count"        sortKey="paid"             {...thProps} right />
                  <Th label="POS Paid Only"     sortKey="posPaidOnlyCount" {...thProps} right />
                  <Th label="Total POS"         sortKey="totalPOS"         {...thProps} right />
                  <Th label="Paid POS"          sortKey="paidPOS"          {...thProps} right />
                  <Th label="Needed / DRR"      sortKey="target"           {...thProps} right />
                  <Th label="POS Paid Only POS" sortKey="posPaidOnlyPOS"   {...thProps} right />
                  <Th label="Recovery %"        sortKey="pct"              {...thProps} right className="min-w-[130px]" />
                </tr>
              </thead>

              <tbody>
                {grouped.map(([bkt, items]) => {
                  const isCollapsed = !!collapsed[bkt];
                  const sub = {
                    collection:       items.reduce((s: number, i: any) => s + (i.collection       || 0), 0),
                    count:            items.reduce((s: number, i: any) => s + (i.count            || 0), 0),
                    paid:             items.reduce((s: number, i: any) => s + (i.paid             || 0), 0),
                    totalPOS:         items.reduce((s: number, i: any) => s + (i.totalPOS         || 0), 0),
                    paidPOS:          items.reduce((s: number, i: any) => s + (i.paidPOS          || 0), 0),
                    posPaidOnlyCount: items.reduce((s: number, i: any) => s + (i.posPaidOnlyCount || 0), 0),
                    posPaidOnlyPOS:   items.reduce((s: number, i: any) => s + (i.posPaidOnlyPOS   || 0), 0),
                    target:           items.reduce((s: number, i: any) => s + (i.target           || 0), 0),
                    dailyRequiredPOS: items.reduce((s: number, i: any) => s + (i.dailyRequiredPOS || 0), 0),
                  };
                  const subPct = sub.totalPOS ? sub.paidPOS / sub.totalPOS : 0;

                  return (
                    <React.Fragment key={bkt}>
                      {/* Bucket Section Header */}
                      <tr
                        onClick={() => toggleBucket(bkt)}
                        className="bg-muted/60 border-y border-border/80 cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      >
                        <td
                          colSpan={11}
                          className="px-3 py-2 font-bold text-xs uppercase tracking-wider text-foreground"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              {isCollapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                              <span>BUCKET {bkt}</span>
                              <span className="text-[11px] font-normal text-muted-foreground font-mono">({items.length} cities · {sub.count.toLocaleString()} cases)</span>
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {fmtPct(subPct)} Recovery
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* City Rows */}
                      {!isCollapsed && items.map((item: any) => {
                        const rowPct = item.totalPOS ? item.paidPOS / item.totalPOS : 0;
                        const isAchieved = item.target <= 0;

                        return (
                          <tr
                            key={item.city + '-' + bkt}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                          >
                            {/* Sticky Rank */}
                            <td
                              style={{ position: 'sticky', left: 0, zIndex: 10 }}
                              className="px-3 py-2 text-center text-[11px] font-mono text-muted-foreground bg-card group-hover:bg-muted/30 border-r border-border/30"
                            >
                              {item.globalRank}
                            </td>

                            {/* Sticky City */}
                            <td
                              style={{ position: 'sticky', left: 40, zIndex: 10 }}
                              className="px-3 py-2 font-semibold text-foreground bg-card group-hover:bg-muted/30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] border-r border-border/40"
                            >
                              <span
                                onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}
                                className="cursor-pointer hover:text-primary hover:underline"
                              >
                                {item.city}
                              </span>
                            </td>

                            {/* Metrics */}
                            <td className="px-3 py-2 text-right font-mono font-semibold text-foreground">{fmtCur(item.collection)}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums">{item.count.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">{item.paid.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-blue-600 dark:text-blue-400">{item.posPaidOnlyCount}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums">{fmtCur(item.totalPOS)}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">{fmtCur(item.paidPOS)}</td>

                            {/* Target / DRR */}
                            <td className="px-3 py-2 text-right font-mono tabular-nums">
                              {isAchieved ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  Achieved
                                </span>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className="font-bold text-rose-600 dark:text-rose-400">{fmtCur(item.target)}</span>
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400">DRR: ₹{fmtCur(item.dailyRequiredPOS || 0)}/d</span>
                                </div>
                              )}
                            </td>

                            <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{fmtCur(item.posPaidOnlyPOS)}</td>

                            {/* Recovery % with inline HeatBar */}
                            <td className="px-3 py-2 text-right font-mono tabular-nums">
                              <HeatBar pct={rowPct} showBar={true} showBadge={false} />
                            </td>
                          </tr>
                        );
                      })}

                      {/* Bucket Subtotal Row */}
                      <tr className="bg-muted/40 font-bold border-b border-border/80">
                        <td style={{ position: 'sticky', left: 0, zIndex: 10 }} className="bg-muted/40" />
                        <td
                          style={{ position: 'sticky', left: 40, zIndex: 10 }}
                          className="px-3 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground bg-muted/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]"
                        >
                          Bucket {bkt} Subtotal
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold">{fmtCur(sub.collection)}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">{sub.count.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{sub.paid.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{sub.posPaidOnlyCount}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">{fmtCur(sub.totalPOS)}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{fmtCur(sub.paidPOS)}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-rose-600 dark:text-rose-400">{fmtCur(sub.target)}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-muted-foreground">{fmtCur(sub.posPaidOnlyPOS)}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">
                          <HeatBar pct={subPct} showBar={true} showBadge={true} />
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Sticky Grand Total Footer */}
              <tfoot className="sticky bottom-0 z-30 bg-slate-900 text-white font-bold shadow-[0_-4px_12px_rgba(0,0,0,0.15)] border-t-2 border-primary/40">
                <tr>
                  <td style={{ position: 'sticky', left: 0, zIndex: 35 }} className="bg-slate-900" />
                  <td
                    style={{ position: 'sticky', left: 40, zIndex: 35 }}
                    className="px-3 py-3 font-extrabold uppercase text-xs tracking-wider text-primary bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)] cursor-pointer hover:underline"
                    onClick={() => navigateToExplorer({})}
                  >
                    Grand Total
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-emerald-400">{fmtCur(grandTotal.collection)}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-slate-200">{grandTotal.count.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-emerald-400">{grandTotal.paid.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-blue-400">{grandTotal.posPaidOnlyCount}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-slate-200">{fmtCur(grandTotal.totalPOS)}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-emerald-400">{fmtCur(grandTotal.paidPOS)}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-rose-400">
                    <div className="flex flex-col items-end">
                      <span>{fmtCur(grandTotal.target)}</span>
                      <span className="text-[10px] text-amber-300 font-mono">DRR: ₹{fmtCur(grandTotal.dailyRequiredPOS)}/d</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-slate-400">{fmtCur(grandTotal.posPaidOnlyPOS)}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold">
                    <HeatBar pct={grandPct} showBar={true} showBadge={true} />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
