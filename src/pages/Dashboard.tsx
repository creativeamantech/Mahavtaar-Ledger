import { Fragment } from 'react';
import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useMediaQuery } from '../hooks/use-media-query';
import { calculateRow } from '../lib/calculations';
import { fmtCur } from '../lib/formatters';
import { DollarSign, AlertCircle, Database, BarChart3, TrendingUp, Filter, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Line } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  
  const handleCellClick = (city: string, band: string) => {
    setSelectedCells(prev => {
      const next = new Set(prev);
      const id = `${city}:::${band}`;
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const { records, isLoading, globalBucket } = useData();

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    if (globalBucket === 'ALL') return records;
    return records.filter((r: any) => String(r.bom_bkt).trim().toUpperCase() === globalBucket);
  }, [records, globalBucket]);

  const stats = useMemo(() => {
    let totalCollection = 0;
    
    const byBucket: Record<string, any> = {};
    const byCity: Record<string, any> = {};
    
    let smallCasesEMI = 0;
    let smallCasesPOS = 0;
    let totalSmallCases = 0;
    let smallCasesBoth = 0;
    
    filteredRecords.forEach((row: any) => {
        const c = calculateRow(row);
        const bucket = String(row.bom_bkt || 'Unknown').trim();
        const city = String(row.city || row.City || 'Unknown').trim().toUpperCase();
        const dac = Number(row.dac ?? row.DAC) || 0;
        const pos = Number(row.principal_outstanding) || 0;
        const emi = Number(row.emi_amt) || 0;
        const isPaid = c.mainPaid === 1;

        if (isPaid) totalCollection += dac;
        
        if (emi < 500) smallCasesEMI++;
        if (pos < 1000) smallCasesPOS++;
        if (emi < 500 || pos < 1000) {
            totalSmallCases++;
            if (emi < 500 && pos < 1000) smallCasesBoth++;
        }
        
        if (!byBucket[bucket]) byBucket[bucket] = { collection: 0, cases: 0, pos: 0, paid: 0, unpaid: 0 };
        byBucket[bucket].cases++;
        byBucket[bucket].pos += pos;
        if (isPaid) {
            byBucket[bucket].collection += dac;
            byBucket[bucket].paid++;
        } else {
            byBucket[bucket].unpaid++;
        }
        
        if (!byCity[city]) {
            byCity[city] = { 
                cases: 0, pos: 0, paid: 0, unpaid: 0, 
                buckets: {} as Record<string, any>, 
                bands: {} as Record<string, { cases: number, pos: number }> 
            };
        }
        byCity[city].cases++;
        byCity[city].pos += pos;
        if (isPaid) byCity[city].paid++; else byCity[city].unpaid++;
        
        if (!byCity[city].buckets[bucket]) byCity[city].buckets[bucket] = { paid: 0, unpaid: 0 };
        if (isPaid) byCity[city].buckets[bucket].paid++;
        else byCity[city].buckets[bucket].unpaid++;
        
        let band = '< 1k';
        if (pos >= 1000 && pos < 10000) {
            const lower = Math.floor(pos / 1000);
            band = `${lower}k-${lower + 1}k`;
        } else if (pos >= 10000) {
            const lower = Math.floor(pos / 5000) * 5;
            band = `${lower}k-${lower + 5}k`;
        }
        if (!byCity[city].bands[band]) byCity[city].bands[band] = { cases: 0, pos: 0 };
        byCity[city].bands[band].cases++;
        byCity[city].bands[band].pos += pos;
    });

    const bucketData = Object.keys(byBucket).map(k => ({ bucket: k, ...byBucket[k] })).sort((a,b) => a.bucket.localeCompare(b.bucket));
    const cityData = Object.keys(byCity).map(k => ({ city: k, ...byCity[k] })).sort((a,b) => b.cases !== a.cases ? b.cases - a.cases : b.pos - a.pos);

    const allBands = new Set<string>();
    filteredRecords.forEach((row: any) => {
        const pos = Number(row.principal_outstanding) || 0;
        if (pos < 1000) allBands.add('< 1k');
        else if (pos < 10000) {
            const lower = Math.floor(pos / 1000);
            allBands.add(`${lower}k-${lower + 1}k`);
        } else {
            const lower = Math.floor(pos / 5000) * 5;
            allBands.add(`${lower}k-${lower + 5}k`);
        }
    });
    
    const sortedBands = Array.from(allBands).sort((a, b) => {
        if (a === '< 1k') return 1;
        if (b === '< 1k') return -1;
        const valA = parseInt(a.split('k')[0]);
        const valB = parseInt(b.split('k')[0]);
        return valB - valA;
    });

    return { totalCollection, bucketData, cityData, smallCasesEMI, smallCasesPOS, totalSmallCases, smallCasesBoth, sortedBands };
  }, [filteredRecords]);

  const selectionStats = useMemo(() => {
    let cases = 0;
    let pos = 0;
    selectedCells.forEach(id => {
      const [c, b] = id.split(':::');
      const cityRec = stats.cityData.find(x => x.city === c);
      if (cityRec && cityRec.bands[b]) {
        cases += cityRec.bands[b].cases;
        pos += cityRec.bands[b].pos;
      }
    });
    return { cases, pos };
  }, [selectedCells, stats.cityData]);



  const getBandRange = (band: string) => {
    if (band === '< 1k') return { min: 0, max: 999.99 };
    const parts = band.split('-');
    if (parts.length === 2) {
      const min = parseInt(parts[0].replace('k', '')) * 1000;
      const max = parseInt(parts[1].replace('k', '')) * 1000 - 0.01;
      return { min, max };
    }
    return null;
  };

  const navigateToExplorer = (filters: { city?: string, band?: string, bucket?: string, paid?: string }) => {
    const params = new URLSearchParams();
    if (globalBucket !== 'ALL') params.set('bucket', globalBucket);
    if (filters.bucket) params.set('bucket', filters.bucket);
    if (filters.city) params.set('city', filters.city);
    if (filters.paid) params.set('paid', filters.paid);
    if (filters.band) {
      const range = getBandRange(filters.band);
      if (range) {
        params.set('minPos', String(range.min));
        params.set('maxPos', String(range.max));
      }
    }
    navigate(`/explorer?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center text-muted-foreground animate-pulse">
          Loading dashboard metrics...
        </div>
  
      {selectedCells.size > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-foreground text-background px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center bg-background/20 text-background rounded-full w-8 h-8 font-bold text-sm">
                {selectedCells.size}
              </span>
              <span>Cells Selected</span>
            </div>
            <div className="w-px h-6 bg-background/20"></div>
            <div className="flex flex-col">
              <span className="text-xs text-background/70 uppercase tracking-wider">Total Cases</span>
              <span className="font-bold text-lg leading-none">{selectionStats.cases.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-background/70 uppercase tracking-wider">Total POS</span>
              <span className="font-bold text-lg leading-none">{fmtCur(selectionStats.pos)}</span>
            </div>
            <div className="w-px h-6 bg-background/20 ml-2"></div>
            <button 
              onClick={() => setSelectedCells(new Set())}
              className="text-sm px-3 py-1.5 rounded-lg hover:bg-background/20 transition-colors ml-2"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </AppLayout>

    );
  }

  if (filteredRecords.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground space-y-4">
          <Database className="h-12 w-12 opacity-20" />
          <p>No data available to display dashboard metrics. Please upload a file.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wide flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Advanced Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Deep dive into collection, buckets, and geographical metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <DollarSign className="h-4 w-4" /> Total Collection (DAC)
          </div>
          <div className="text-3xl font-bold text-success">{fmtCur(stats.totalCollection)}</div>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <AlertCircle className="h-4 w-4" /> Total Small Cases
          </div>
          <div className="text-3xl font-bold text-warning">{stats.totalSmallCases.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Accounts with EMI &lt; ₹500 <strong>or</strong> POS &lt; ₹1k
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 flex justify-between">
            <span>EMI only: {(stats.smallCasesEMI - stats.smallCasesBoth).toLocaleString()}</span>
            <span>POS only: {(stats.smallCasesPOS - stats.smallCasesBoth).toLocaleString()}</span>
            <span>Both: {stats.smallCasesBoth.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <Database className="h-4 w-4" /> Total Outstanding (POS)
          </div>
          <div className="text-3xl font-bold text-destructive">{fmtCur(stats.bucketData.reduce((acc, b) => acc + b.pos, 0))}</div>
          <div className="text-xs text-muted-foreground mt-1">Total principal across all cases</div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <TrendingUp className="h-4 w-4" /> Total Cases Analyzed
          </div>
          <div className="text-3xl font-bold text-primary">{filteredRecords.length.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Bucket Breakdown */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2">Bucket wise Collections & POS</h3>
          </div>
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.bucketData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="bucket" tick={{fontSize: 12}} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" tickFormatter={(v) => `${v/1000}k`} tick={{fontSize: 12}} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v/1000}k`} tick={{fontSize: 12}} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  formatter={(value: number) => fmtCur(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="pos" name="Total POS" fill="hsl(var(--primary)/0.7)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="collection" name="Collection (DAC)" stroke="hsl(var(--success))" strokeWidth={3} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 font-semibold">Bucket</th>
                  <th className="px-4 py-2 font-semibold text-right">Cases</th>
                  <th className="px-4 py-2 font-semibold text-right hidden sm:table-cell">POS Amount</th>
                  <th className="px-4 py-2 font-semibold text-right">Paid</th>
                  <th className="px-4 py-2 font-semibold text-right hidden sm:table-cell">Unpaid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.bucketData.map(b => (
                  <tr key={b.bucket} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ bucket: b.bucket })}>{b.bucket}</td>
                    <td className="px-4 py-2 text-right cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket })}>{b.cases.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket })}>{fmtCur(b.pos)}</td>
                    <td className="px-4 py-2 text-right text-success font-medium cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket, paid: 'Paid' })}>{b.paid.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => navigateToExplorer({ bucket: b.bucket, paid: 'Unpaid' })}>{b.unpaid.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => navigateToExplorer({})}>
                <tr>
                  <td className="px-4 py-2 text-primary uppercase">Grand Total</td>
                  <td className="px-4 py-2 text-right">{stats.bucketData.reduce((a, b) => a + b.cases, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{fmtCur(stats.bucketData.reduce((a, b) => a + b.pos, 0))}</td>
                  <td className="px-4 py-2 text-right text-success hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ paid: 'Paid' }); }}>{stats.bucketData.reduce((a, b) => a + b.paid, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ paid: 'Unpaid' }); }}>{stats.bucketData.reduce((a, b) => a + b.unpaid, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-3 border-t border-border bg-muted/10 text-right">
             <button onClick={() => {
                 const csv = ['Bucket,Cases,POS Amount,Paid,Unpaid', ...stats.bucketData.map(b => `"${b.bucket}",${b.cases},${b.pos},${b.paid},${b.unpaid}`)].join('\n');
                 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'Bucket_Performance.csv'; a.click();
             }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-card border border-border px-3 py-1.5 rounded hover:bg-muted text-primary transition-colors">
               <Download className="h-3.5 w-3.5" /> Export Data
             </button>
          </div>
        </div>

        </div>
      <div className="mb-10">
        {/* City Top Level */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2">Top Cities & Bandwise Bifurcation</h3>
          </div>
          <div className="overflow-x-auto flex-1 h-[450px]">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold bg-muted/90">City</th>
                  <th className="px-4 py-3 font-semibold text-right bg-muted/90">Cases</th>
                  <th className="px-4 py-3 font-semibold text-right bg-muted/90">Total POS</th>
                  <th className="px-4 py-3 font-semibold text-center bg-muted" colSpan={stats.sortedBands.length}>POS Bands (Cases)</th>
                </tr>
                <tr className="border-t border-border/50 text-[10px]">
                  <th colSpan={3} className="bg-muted/90"></th>
                  {stats.sortedBands.map((band, idx) => (
                      <th key={band} className={`px-2 py-1 text-center font-medium bg-muted ${idx === 0 ? 'border-l border-border/30' : ''} ${idx === stats.sortedBands.length - 1 ? 'border-r border-border/30' : ''}`}>
                          {band}
                      </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.cityData.slice(0, 50).map(c => (
                  <tr key={c.city} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ city: c.city })}>{c.city}</td>
                    <td className="px-4 py-2 text-right cursor-pointer hover:text-primary transition-colors hover:bg-primary/5" onClick={() => navigateToExplorer({ city: c.city })}>{c.cases.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-medium cursor-pointer hover:text-primary transition-colors hover:bg-primary/5" onClick={() => navigateToExplorer({ city: c.city })}>{fmtCur(c.pos)}</td>
                    {stats.sortedBands.map((band, idx) => {
                        const cell = c.bands[band];
                        const val = cell ? cell.cases : 0;
                        const isSelected = selectedCells.has(`${c.city}:::${band}`);
                        return (
                          <td 
                            key={band} 
                            className={`px-2 py-2 text-center text-xs cursor-pointer transition-colors ${idx === 0 ? 'border-l border-border/30' : ''} ${idx === stats.sortedBands.length - 1 ? 'border-r border-border/30' : ''} ${isSelected ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted/10 hover:bg-primary/10 hover:text-primary'}`} 
                            onClick={() => handleCellClick(c.city, band)}
                          >
                              {val > 0 ? val : '-'}
                          </td>
                        )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = globalBucket === 'ALL' ? '/explorer' : `/explorer?bucket=${globalBucket}`}>
                <tr>
                  <td className="px-4 py-2 text-primary uppercase">Grand Total</td>
                  <td className="px-4 py-2 text-right hover:text-primary transition-colors hover:bg-primary/5">{stats.cityData.reduce((a, c) => a + c.cases, 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right hover:text-primary transition-colors hover:bg-primary/5">{fmtCur(stats.cityData.reduce((a, c) => a + c.pos, 0))}</td>
                  {stats.sortedBands.map((band, idx) => (
                      <td key={'ft'+band} className="px-2 py-2 text-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ band }); }}>
                          {stats.cityData.reduce((a, c) => a + (c.bands[band] ? c.bands[band].cases : 0), 0).toLocaleString()}
                      </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-3 border-t border-border bg-muted/10 flex justify-between items-center">
             <span className="text-xs text-muted-foreground">{stats.cityData.length > 50 ? `Showing top 50 of ${stats.cityData.length} cities` : `Showing all ${stats.cityData.length} cities`}</span>
             <button onClick={() => {
                 const csv = ['City,Cases,Total POS,' + stats.sortedBands.join(','), ...stats.cityData.map(c => `"${c.city}",${c.cases},${c.pos},${stats.sortedBands.map(b => c.bands[b] ? c.bands[b].cases : 0).join(',')}`)].join('\n');
                 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'City_Bandwise.csv'; a.click();
             }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-card border border-border px-3 py-1.5 rounded hover:bg-muted text-primary transition-colors">
               <Download className="h-3.5 w-3.5" /> Export Full Data
             </button>
          </div>
          {false && (
            <div className="p-3 text-center text-xs text-muted-foreground border-t border-border bg-muted/10">
              Showing top 50 of {stats.cityData.length} cities
            </div>
          )}
        </div>
      </div>
      
      {/* City by Bucket Paid/Unpaid Drilldown */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-semibold flex items-center gap-2">City-wise Collection Performance by Bucket</h3>
          <p className="text-xs text-muted-foreground mt-1">Number of Paid and Unpaid cases per bucket for each city</p>
        </div>
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs uppercase sticky top-0 z-20 shadow-md">
              <tr className="bg-muted text-muted-foreground">
                <th className="px-4 py-3 font-semibold border-b border-border bg-muted">City</th>
                <th className="px-4 py-3 font-semibold text-right border-b border-border border-r bg-muted">Total City Cases</th>
                {stats.bucketData.map(b => (
                  <th key={b.bucket} colSpan={2} className="px-4 py-2 font-semibold text-center border-b border-border border-r bg-muted/80">
                    Bucket {b.bucket}
                  </th>
                ))}
              </tr>
              <tr className="bg-card text-muted-foreground text-[10px]">
                <th className="px-4 py-2 border-b border-border bg-card"></th>
                <th className="px-4 py-2 border-b border-border border-r bg-card"></th>
                {stats.bucketData.map(b => (
                  <Fragment key={b.bucket}>
                    <th className="px-2 py-2 font-semibold text-center border-b border-border bg-card">Paid</th>
                    <th className="px-2 py-2 font-semibold text-center border-b border-border border-r bg-card">Unpaid</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.cityData.map(c => (
                <tr key={c.city} className="hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ city: c.city })}>{c.city}</td>
                  <td className="px-4 py-2 text-right border-r border-border font-semibold">{c.cases.toLocaleString()}</td>
                  {stats.bucketData.map(b => {
                    const bData = c.buckets[b.bucket] || { paid: 0, unpaid: 0 };
                    return (
                      <Fragment key={b.bucket}>
                        <td className="px-2 py-2 text-center text-success font-medium bg-success/5 cursor-pointer hover:bg-success/20 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: 'Paid' })}>{bData.paid > 0 ? bData.paid : '-'}</td><td className="px-2 py-2 text-center text-muted-foreground border-r border-border/50 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ city: c.city, bucket: b.bucket, paid: 'Unpaid' })}>{bData.unpaid > 0 ? bData.unpaid : '-'}</td>
                      </Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
              <tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => window.location.href = globalBucket === 'ALL' ? '/explorer' : `/explorer?bucket=${globalBucket}`}>
                <tr>
                  <td className="px-4 py-2 text-primary uppercase">Grand Total</td>
                  <td className="px-4 py-2 text-right">{stats.cityData.reduce((a, c) => a + c.cases, 0).toLocaleString()}</td>
                  {stats.bucketData.map(b => (
                      <Fragment key={'ft2'+b.bucket}>
                          <td className="px-2 py-2 text-center text-success cursor-pointer hover:bg-success/20 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ bucket: b.bucket, paid: 'Paid' }); }}>{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.paid || 0), 0).toLocaleString()}</td>
                          <td className="px-2 py-2 text-center border-r border-border/50 text-muted-foreground cursor-pointer hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); navigateToExplorer({ bucket: b.bucket, paid: 'Unpaid' }); }}>{stats.cityData.reduce((a, c) => a + (c.buckets[b.bucket]?.unpaid || 0), 0).toLocaleString()}</td>
                      </Fragment>
                  ))}
                </tr>
              </tfoot>
          </table>
        </div>
        <div className="p-3 border-t border-border bg-muted/10 text-right">
             <button onClick={() => {
                 let headerRow = 'City,Total Cases,' + stats.bucketData.map(b => `Bkt ${b.bucket} Paid,Bkt ${b.bucket} Unpaid`).join(',');
                 const csv = [headerRow, ...stats.cityData.map(c => `"${c.city}",${c.cases},${stats.bucketData.map(b => (c.buckets[b.bucket]?.paid || 0) + ',' + (c.buckets[b.bucket]?.unpaid || 0)).join(',')}`)].join('\n');
                 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'City_Bucket_Drilldown.csv'; a.click();
             }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-card border border-border px-3 py-1.5 rounded hover:bg-muted text-primary transition-colors">
               <Download className="h-3.5 w-3.5" /> Export Data
             </button>
        </div>
      </div>

    </AppLayout>
  );
}