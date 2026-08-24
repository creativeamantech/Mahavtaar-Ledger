import React, { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildBucketCityPivot } from '../lib/pivots';
import { fmtCur, fmtPct, pctColor } from '../lib/formatters';
import { exportBucketCityPivot } from '../lib/exporter';
import { Download, Search, ArrowUp, ArrowDown, X, Plus, TrendingUp, Target, Wallet, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

// ─── Design tokens ────────────────────────────────────────────────────────────
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

// ─── Heat bar for % column ────────────────────────────────────────────────────
function HeatBar({ pct }: { pct: number }) {
  const clamped = Math.min(1, Math.max(0, pct));
  const pctNum  = Math.round(clamped * 100);
  const color   =
    clamped >= 0.8  ? '#059669' :
    clamped >= 0.6  ? '#d97706' :
    clamped >= 0.4  ? '#ea580c' : '#e11d48';
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-16 h-1.5 rounded-full bg-[#e5e8f0] dark:bg-[#1e2330] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `\${pctNum}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-bold tabular-nums w-10 text-right" style={{ color }}>
        {pctNum}%
      </span>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border \${C.border} \${C.card} p-5 flex flex-col gap-2 shadow-sm group`}>
      {/* accent stripe */}
      <div className={`absolute left-0 top-0 h-full w-[3px] \${accent}`} />
      <div className="flex items-start justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-widest \${C.muted}`}>{label}</p>
        <div className={`p-1.5 rounded-lg \${accent.replace('bg-', 'bg-opacity-10 bg-')} opacity-70`}>
          <Icon className={`w-3.5 h-3.5 \${accent.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <p className={`text-[22px] font-black tracking-tight tabular-nums \${C.ink}`}>{value}</p>
      {sub && <p className={`text-[11px] tabular-nums \${C.muted}`}>{sub}</p>}
    </div>
  );
}

// ─── Sortable header cell ─────────────────────────────────────────────────────
function Th({
  label, sortKey, right, sortConfig, onSort, sticky,
}: {
  label: string; sortKey: string; right?: boolean;
  sortConfig: { key: string; direction: 'asc' | 'desc' }[];
  onSort: (k: string) => void;
  sticky?: boolean;
}) {
  const active = sortConfig.find(s => s.key === sortKey);
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`
        px-3 py-3 select-none cursor-pointer
        text-[10px] font-bold uppercase tracking-widest whitespace-nowrap
        \${right ? 'text-right' : 'text-left'}
        \${active
          ? 'text-[#4f46e5] dark:text-[#818cf8] bg-[#eef0ff] dark:bg-[#1a1c2e]'
          : 'text-[#9ca3af] hover:text-[#6b7280] dark:hover:text-[#d1d5db]'}
        \${sticky ? 'sticky top-0 z-30' : ''}
        transition-colors duration-150
      `}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active
          ? active.direction === 'asc'
            ? <ArrowUp className="w-3 h-3" />
            : <ArrowDown className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  );
}

// ─── Target cell ──────────────────────────────────────────────────────────────
function TargetCell({ target, drr }: { target: number; drr: number }) {
  if (target <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#059669] dark:text-[#34d399] bg-[#ecfdf5] dark:bg-[#052e16]/40 px-2 py-0.5 rounded-full border border-[#bbf7d0] dark:border-[#14532d]/40">
        ✓ Achieved
      </span>
    );
  }
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={`tabular-nums font-bold \${C.rose}`}>{fmtCur(target)}</span>
      <span className="text-[10px] tabular-nums font-medium text-[#d97706] dark:text-[#fbbf24] bg-[#fefce8] dark:bg-[#1c1506]/60 border border-[#fde68a] dark:border-[#78350f]/40 px-1.5 py-0.5 rounded-full">
        ₹{fmtCur(drr)}/d
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CityPivot() {
  const navigate = useNavigate();
  const { records, targets, isLoading, globalBucket } = useData();
  const { user, isExecutive } = useAuth();

  const [filterText, setFilterText]   = useState('');
  const [sortSearch, setSortSearch]   = useState('');
  const [sortConfig, setSortConfig]   = useState<{ key: string; direction: 'asc' | 'desc' }[]>([]);
  const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({});

  const navigateToExplorer = (filters: { city?: string; bucket?: string; paid?: string }) => {
    const params = new URLSearchParams();
    if (globalBucket !== 'ALL') params.set('bucket', globalBucket);
    if (filters.bucket) params.set('bucket', filters.bucket);
    if (filters.city)   params.set('city',   filters.city);
    if (filters.paid)   params.set('paid',   filters.paid);
    navigate(`/explorer?\${params.toString()}`);
  };

  const filtered = useMemo(() => {
    if (isExecutive() && user) return records.filter(r => r.executive_name === user.name);
    return records;
  }, [records, user, isExecutive]);

  const rawCityData = useMemo(() => buildBucketCityPivot(filtered, targets), [filtered, targets]);

  const cityData = useMemo(() => {
    let data = [...rawCityData];
    if (filterText) data = data.filter(d => d.city.toLowerCase().includes(filterText.toLowerCase()));
    if (sortConfig.length > 0) {
      data.sort((a: any, b: any) => {
        for (const sort of sortConfig) {
          let valA = sort.key === 'pct' ? (a.totalPOS ? a.paidPOS / a.totalPOS : 0) : a[sort.key];
          let valB = sort.key === 'pct' ? (b.totalPOS ? b.paidPOS / b.totalPOS : 0) : b[sort.key];
          const nA = Number(valA), nB = Number(valB);
          let comp = 0;
          if (!isNaN(nA) && !isNaN(nB) && valA !== '' && valB !== '')
            comp = sort.direction === 'asc' ? nA - nB : nB - nA;
          else {
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

  const grouped = useMemo(() => {
    const groups: Record<number, any[]> = {};
    cityData.forEach(t => {
      if (!groups[t.bkt]) groups[t.bkt] = [];
      groups[t.bkt].push(t);
    });
    const allNames = Object.keys(globalCityCounts).sort((a, b) => globalCityCounts[b] - globalCityCounts[a]);
    return Object.entries(groups)
      .map(([bkt, items]) => {
        const sorted = sortConfig.length > 0 ? items : [...items].sort((a, b) => b.count - a.count);
        const bucketSorted = [...items].sort((a, b) => b.count - a.count);
        const getBktRank = (name: string) => bucketSorted.findIndex(i => i.city === name) + 1;
        return [bkt, sorted.map(item => ({ ...item, globalRank: getBktRank(item.city) }))] as [string, any[]];
      })
      .sort(([a], [b]) => Number(a) - Number(b));
  }, [cityData, globalCityCounts, sortConfig]);

  const grandTotal = useMemo(() => ({
    collection:      cityData.reduce((s, t) => s + t.collection, 0),
    count:           cityData.reduce((s, t) => s + t.count, 0),
    paid:            cityData.reduce((s, t) => s + t.paid, 0),
    totalPOS:        cityData.reduce((s, t) => s + t.totalPOS, 0),
    paidPOS:         cityData.reduce((s, t) => s + t.paidPOS, 0),
    posPaidOnlyCount:cityData.reduce((s, t) => s + t.posPaidOnlyCount, 0),
    posPaidOnlyPOS:  cityData.reduce((s, t) => s + t.posPaidOnlyPOS, 0),
    target:          cityData.reduce((s, t) => s + t.target, 0),
    dailyRequiredPOS:cityData.reduce((s, t) => s + (t.dailyRequiredPOS || 0), 0),
  }), [cityData]);

  const gPct = grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0;

  const SORT_OPTS = [
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
  ];

  const toggleSort = (key: string) =>
    setSortConfig(prev => {
      const exists = prev.find(s => s.key === key);
      if (exists) return prev.filter(s => s.key !== key);
      return [...prev, { key, direction: 'desc' }];
    });

  const flipDir = (key: string) =>
    setSortConfig(prev => prev.map(s => s.key === key ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' } : s));

  const toggleCollapse = (bkt: string) =>
    setCollapsed(prev => ({ ...prev, [bkt]: !prev[bkt] }));

  const thProps = { sortConfig, onSort: toggleSort };

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 rounded-xl bg-[#e5e8f0] dark:bg-[#1e2330]" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-[#e5e8f0] dark:bg-[#1e2330]" />
            ))}
          </div>
          <div className="h-[500px] rounded-2xl bg-[#e5e8f0] dark:bg-[#1e2330]" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4f46e5] dark:text-[#818cf8] mb-1">
            Enterprise Data Report · Bucket → City
          </p>
          <h1 className="text-[28px] font-black tracking-tight text-[#0f1117] dark:text-white leading-none">
            City Performance
          </h1>
          <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1">
            {cityData.length} cities across {grouped.length} buckets
          </p>
        </div>
        <button
          onClick={() => exportBucketCityPivot(cityData)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold rounded-xl bg-[#0f1117] dark:bg-white text-white dark:text-[#0f1117] shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total POS"  value={fmtCur(grandTotal.totalPOS)}  icon={BarChart3}   accent="bg-[#4f46e5]" />
        <KpiCard label="Paid POS"   value={fmtCur(grandTotal.paidPOS)}   icon={Wallet}      accent="bg-[#059669]"
          sub={`\${grouped.length} buckets collected`} />
        <KpiCard label="Needed POS" value={fmtCur(grandTotal.target)}    icon={Target}      accent="bg-[#e11d48]"
          sub={`₹\${fmtCur(grandTotal.dailyRequiredPOS)}/day required`} />
        <KpiCard label="Collection %" value={fmtPct(gPct)}               icon={TrendingUp}  accent="bg-[#d97706]"
          sub={`\${fmtCur(grandTotal.paid)} of \${fmtCur(grandTotal.count)} paid`} />
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Filter city…"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className={`pl-9 pr-3 py-2 h-9 text-[13px] rounded-xl border \${C.border} \${C.card} outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] transition-all w-48 shadow-sm`}
          />
        </div>

        {/* Sort popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className={`inline-flex h-9 items-center gap-1.5 px-3 rounded-xl border border-dashed \${C.border} \${C.card} text-[12px] font-bold text-[#6b7280] uppercase tracking-wider hover:bg-[#f3f6ff] dark:hover:bg-[#15192a] transition-colors`}>
              <Plus className="w-3.5 h-3.5" /> Add Sort
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 rounded-xl shadow-xl" align="start">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Sort columns</p>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search…"
                value={sortSearch}
                onChange={e => setSortSearch(e.target.value)}
                className={`w-full pl-6 pr-2 py-1.5 text-xs rounded-lg border \${C.border} outline-none focus:border-[#4f46e5] transition-colors bg-transparent`}
              />
            </div>
            <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
              {SORT_OPTS.filter(o => o.label.toLowerCase().includes(sortSearch.toLowerCase())).map(opt => (
                <div
                  key={opt.key}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f3f6ff] dark:hover:bg-[#15192a] cursor-pointer transition-colors"
                  onClick={() => toggleSort(opt.key)}
                >
                  <Checkbox className="pointer-events-none" checked={!!sortConfig.find(s => s.key === opt.key)} />
                  <span className="text-[12px] flex-1">{opt.label}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active sort chips */}
        {sortConfig.map(sort => {
          const lbl = SORT_OPTS.find(o => o.key === sort.key)?.label ?? sort.key;
          return (
            <div key={sort.key} className="inline-flex h-9 items-center gap-1 bg-[#eef0ff] dark:bg-[#1a1c2e] border border-[#c7d2fe] dark:border-[#312e81]/50 px-3 rounded-xl text-[12px] font-semibold text-[#4f46e5] dark:text-[#818cf8]">
              {lbl}
              <button onClick={() => flipDir(sort.key)} className="ml-0.5 hover:opacity-70 transition-opacity">
                {sort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              </button>
              <button onClick={() => setSortConfig(prev => prev.filter(s => s.key !== sort.key))} className="hover:text-[#e11d48] transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className={`rounded-2xl border \${C.border} overflow-hidden shadow-sm`}>
        <div className="overflow-auto max-h-[calc(100vh-320px)] min-h-[400px]">
          <table className="w-full text-[12px] min-w-[1100px] border-separate border-spacing-0">

            {/* Sticky header */}
            <thead>
              <tr className={`sticky top-0 z-30 bg-[#f8f9fc] dark:bg-[#0d0f14] border-b \${C.border}`}>
                <Th label="#"                  sortKey="city"             {...thProps} />
                <Th label="Bucket / City"      sortKey="city"             {...thProps} />
                <Th label="Collection"         sortKey="collection"       {...thProps} right />
                <Th label="Total Count"        sortKey="count"            {...thProps} right />
                <Th label="Paid Count"         sortKey="paid"             {...thProps} right />
                <Th label="POS Paid Only"      sortKey="posPaidOnlyCount" {...thProps} right />
                <Th label="Total POS"          sortKey="totalPOS"         {...thProps} right />
                <Th label="Paid POS"           sortKey="paidPOS"          {...thProps} right />
                <Th label="Needed / DRR"       sortKey="target"           {...thProps} right />
                <Th label="POS Paid Only POS"  sortKey="posPaidOnlyPOS"  {...thProps} right />
                <Th label="Total %"            sortKey="pct"              {...thProps} right />
              </tr>
            </thead>

            <tbody>
              {grouped.map(([bkt, items]) => {
                const isCollapsed = !!collapsed[bkt];
                const sub = {
                  collection:       items.reduce((s: number, i: any) => s + i.collection, 0),
                  count:            items.reduce((s: number, i: any) => s + i.count, 0),
                  paid:             items.reduce((s: number, i: any) => s + i.paid, 0),
                  totalPOS:         items.reduce((s: number, i: any) => s + i.totalPOS, 0),
                  paidPOS:          items.reduce((s: number, i: any) => s + i.paidPOS, 0),
                  posPaidOnlyCount: items.reduce((s: number, i: any) => s + i.posPaidOnlyCount, 0),
                  posPaidOnlyPOS:   items.reduce((s: number, i: any) => s + i.posPaidOnlyPOS, 0),
                  target:           items.reduce((s: number, i: any) => s + i.target, 0),
                  dailyRequiredPOS: items.reduce((s: number, i: any) => s + (i.dailyRequiredPOS || 0), 0),
                };
                const subPct = sub.totalPOS ? sub.paidPOS / sub.totalPOS : 0;

                return (
                  <React.Fragment key={bkt}>
                    {/* Bucket header row */}
                    <tr
                      className="cursor-pointer select-none group"
                      onClick={() => toggleCollapse(bkt)}
                    >
                      <td colSpan={11} className="bg-[#0f1117] dark:bg-[#070910] px-4 py-2.5 border-b border-[#1e2330]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCollapsed
                              ? <ChevronRight className="w-3.5 h-3.5 text-[#6b7280]" />
                              : <ChevronDown  className="w-3.5 h-3.5 text-[#6b7280]" />}
                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
                              Bucket {bkt}
                            </span>
                            <span className="text-[10px] font-medium text-[#6b7280] ml-1">
                              {items.length} cities
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-[#9ca3af]">
                            <span>Collection: <b className="text-white">{fmtCur(sub.collection)}</b></span>
                            <span>Paid: <b className="text-[#34d399]">{fmtCur(sub.paidPOS)}</b></span>
                            <span className="flex items-center gap-1.5">
                              %:
                              <HeatBar pct={subPct} />
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* City rows */}
                    {!isCollapsed && items.map((item: any, i: number) => (
                      <tr
                        key={item.city}
                        className={`border-b \${C.border} \${i % 2 === 1 ? 'bg-[#fafbfd] dark:bg-[#0f1219]' : 'bg-white dark:bg-[#111318]'} hover:bg-[#f3f6ff] dark:hover:bg-[#15192a] transition-colors duration-100 cursor-pointer`}
                      >
                        {/* Rank */}
                        <td className="px-3 py-2.5 text-center w-8">
                          <span className="text-[10px] font-bold text-[#9ca3af] tabular-nums">{item.globalRank}</span>
                        </td>

                        {/* City */}
                        <td
                          className="px-3 py-2.5 pl-7 font-semibold text-[#0f1117] dark:text-white hover:text-[#4f46e5] dark:hover:text-[#818cf8] hover:underline underline-offset-2 transition-colors"
                          onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}
                        >
                          {item.city}
                        </td>

                        {/* Collection */}
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[#4f46e5] dark:text-[#818cf8]"
                          onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>
                          {fmtCur(item.collection)}
                        </td>

                        {/* Total Count */}
                        <td className="px-3 py-2.5 text-right tabular-nums text-[#374151] dark:text-[#d1d5db]"
                          onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>
                          {item.count}
                        </td>

                        {/* Paid Count */}
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[#059669] dark:text-[#34d399]"
                          onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: 'Paid' })}>
                          {item.paid}
                        </td>

                        {/* POS Paid Only Count */}
                        <td className="px-3 py-2.5 text-right tabular-nums text-[#2563eb] dark:text-[#60a5fa]"
                          onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: 'Paid' })}>
                          {item.posPaidOnlyCount}
                        </td>

                        {/* Total POS */}
                        <td className="px-3 py-2.5 text-right tabular-nums text-[#374151] dark:text-[#d1d5db]"
                          onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>
                          {fmtCur(item.totalPOS)}
                        </td>

                        {/* Paid POS */}
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[#059669] dark:text-[#34d399]"
                          onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: 'Paid' })}>
                          {fmtCur(item.paidPOS)}
                        </td>

                        {/* Needed / DRR */}
                        <td className="px-3 py-2.5 text-right">
                          <TargetCell target={item.target} drr={item.dailyRequiredPOS || 0} />
                        </td>

                        {/* POS Paid Only POS */}
                        <td className="px-3 py-2.5 text-right tabular-nums text-[#2563eb] dark:text-[#60a5fa]">
                          {fmtCur(item.posPaidOnlyPOS)}
                        </td>

                        {/* % with heat bar */}
                        <td className="px-3 py-2.5 text-right">
                          <HeatBar pct={item.pct} />
                        </td>
                      </tr>
                    ))}

                    {/* Bucket subtotal */}
                    {!isCollapsed && (
                      <tr className={`border-b-2 \${C.border} bg-[#f0f4ff] dark:bg-[#0d1220]`}>
                        <td className="px-3 py-2" />
                        <td className="px-3 py-2 pl-7 text-[10px] font-black uppercase tracking-widest text-[#4f46e5] dark:text-[#818cf8]"
                          onClick={() => navigateToExplorer({ bucket: bkt })}>
                          Bucket {bkt} Total
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-[#4f46e5] dark:text-[#818cf8]"
                          onClick={() => navigateToExplorer({ bucket: bkt })}>
                          {fmtCur(sub.collection)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-[#374151] dark:text-[#d1d5db]"
                          onClick={() => navigateToExplorer({ bucket: bkt })}>
                          {sub.count}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-[#059669] dark:text-[#34d399]"
                          onClick={() => navigateToExplorer({ bucket: bkt, paid: 'Paid' })}>
                          {sub.paid}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-[#2563eb] dark:text-[#60a5fa]"
                          onClick={() => navigateToExplorer({ bucket: bkt, paid: 'Paid' })}>
                          {sub.posPaidOnlyCount}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold"
                          onClick={() => navigateToExplorer({ bucket: bkt })}>
                          {fmtCur(sub.totalPOS)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-[#059669] dark:text-[#34d399]"
                          onClick={() => navigateToExplorer({ bucket: bkt, paid: 'Paid' })}>
                          {fmtCur(sub.paidPOS)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <TargetCell target={sub.target} drr={sub.dailyRequiredPOS} />
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-[#2563eb] dark:text-[#60a5fa]">
                          {fmtCur(sub.posPaidOnlyPOS)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <HeatBar pct={subPct} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Grand total footer */}
            <tfoot className="sticky bottom-0 z-20">
              <tr className="bg-[#0f1117] dark:bg-[#070910] border-t-2 border-[#4f46e5]/50">
                <td className="px-3 py-3" />
                <td
                  className="px-3 py-3 pl-4 text-[11px] font-black uppercase tracking-widest text-white cursor-pointer hover:text-[#818cf8] transition-colors"
                  onClick={() => navigateToExplorer({})}
                >
                  Grand Total
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-bold text-[#818cf8]"
                  onClick={() => navigateToExplorer({})}>
                  {fmtCur(grandTotal.collection)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-bold text-white"
                  onClick={() => navigateToExplorer({})}>
                  {grandTotal.count}
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-bold text-[#34d399]"
                  onClick={() => navigateToExplorer({ paid: 'Paid' })}>
                  {grandTotal.paid}
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-bold text-[#60a5fa]"
                  onClick={() => navigateToExplorer({ paid: 'Paid' })}>
                  {grandTotal.posPaidOnlyCount}
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-bold text-white"
                  onClick={() => navigateToExplorer({})}>
                  {fmtCur(grandTotal.totalPOS)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-bold text-[#34d399]"
                  onClick={() => navigateToExplorer({ paid: 'Paid' })}>
                  {fmtCur(grandTotal.paidPOS)}
                </td>
                <td className="px-3 py-3 text-right">
                  <TargetCell target={grandTotal.target} drr={grandTotal.dailyRequiredPOS} />
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-bold text-[#9ca3af]">
                  {fmtCur(grandTotal.posPaidOnlyPOS)}
                </td>
                <td className="px-3 py-3 text-right">
                  <HeatBar pct={gPct} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
