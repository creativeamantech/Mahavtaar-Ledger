const fs = require('fs');

const path = 'src/pages/Dashboard.tsx';
const code = `
import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { AppLayout } from '../components/layout/AppLayout';
import { useMediaQuery } from '../hooks/use-media-query';
import { calculateRow } from '../lib/calculations';
import { fmtCur } from '../lib/formatters';
import { DollarSign, AlertCircle, Database, BarChart3, TrendingUp, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Line } from 'recharts';

export default function Dashboard() {
  const isMobile = useMediaQuery('(max-width: 767px)');
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
                bands: { '<1k': 0, '1k-10k': 0, '10k-50k': 0, '50k+': 0 } 
            };
        }
        byCity[city].cases++;
        byCity[city].pos += pos;
        if (isPaid) byCity[city].paid++; else byCity[city].unpaid++;
        
        if (!byCity[city].buckets[bucket]) byCity[city].buckets[bucket] = { paid: 0, unpaid: 0 };
        if (isPaid) byCity[city].buckets[bucket].paid++;
        else byCity[city].buckets[bucket].unpaid++;
        
        if (pos < 1000) byCity[city].bands['<1k']++;
        else if (pos < 10000) byCity[city].bands['1k-10k']++;
        else if (pos < 50000) byCity[city].bands['10k-50k']++;
        else byCity[city].bands['50k+']++;
    });

    const bucketData = Object.keys(byBucket).map(k => ({ bucket: k, ...byBucket[k] })).sort((a,b) => a.bucket.localeCompare(b.bucket));
    const cityData = Object.keys(byCity).map(k => ({ city: k, ...byCity[k] })).sort((a,b) => b.cases - a.cases);

    return { totalCollection, bucketData, cityData, smallCasesEMI, smallCasesPOS };
  }, [filteredRecords]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center text-muted-foreground animate-pulse">
          Loading dashboard metrics...
        </div>
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
            <AlertCircle className="h-4 w-4" /> Small Cases (EMI < ₹500)
          </div>
          <div className="text-3xl font-bold text-destructive">{stats.smallCasesEMI.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Accounts with low monthly obligations</div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <AlertCircle className="h-4 w-4" /> Small Cases (POS < ₹1k)
          </div>
          <div className="text-3xl font-bold text-warning">{stats.smallCasesPOS.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Accounts with low principal outstanding</div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <TrendingUp className="h-4 w-4" /> Total Cases Analyzed
          </div>
          <div className="text-3xl font-bold text-primary">{filteredRecords.length.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
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
                <YAxis yAxisId="left" tickFormatter={(v) => \`\${v/1000}k\`} tick={{fontSize: 12}} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => \`\${v/1000}k\`} tick={{fontSize: 12}} stroke="hsl(var(--muted-foreground))" />
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
                  <th className="px-4 py-2 font-semibold text-right">POS Amount</th>
                  <th className="px-4 py-2 font-semibold text-right">Paid</th>
                  <th className="px-4 py-2 font-semibold text-right">Unpaid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.bucketData.map(b => (
                  <tr key={b.bucket} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{b.bucket}</td>
                    <td className="px-4 py-2 text-right">{b.cases.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{fmtCur(b.pos)}</td>
                    <td className="px-4 py-2 text-right text-success font-medium">{b.paid.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{b.unpaid.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* City Top Level */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2">Top Cities & Bandwise Bifurcation</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold text-right">Cases</th>
                  <th className="px-4 py-3 font-semibold text-right">Total POS</th>
                  <th className="px-4 py-3 font-semibold text-center bg-muted/30" colSpan={4}>POS Bands (Cases)</th>
                </tr>
                <tr className="border-t border-border/50 text-[10px]">
                  <th colSpan={3}></th>
                  <th className="px-2 py-1 text-center font-medium bg-muted/30 border-l border-border/30">&lt; 1k</th>
                  <th className="px-2 py-1 text-center font-medium bg-muted/30">1k-10k</th>
                  <th className="px-2 py-1 text-center font-medium bg-muted/30">10k-50k</th>
                  <th className="px-2 py-1 text-center font-medium bg-muted/30 border-r border-border/30">&gt; 50k</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.cityData.slice(0, 15).map(c => (
                  <tr key={c.city} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{c.city}</td>
                    <td className="px-4 py-2 text-right">{c.cases.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmtCur(c.pos)}</td>
                    <td className="px-2 py-2 text-center text-xs bg-muted/10 border-l border-border/30">{c.bands['<1k'] > 0 ? c.bands['<1k'] : '-'}</td>
                    <td className="px-2 py-2 text-center text-xs bg-muted/10">{c.bands['1k-10k'] > 0 ? c.bands['1k-10k'] : '-'}</td>
                    <td className="px-2 py-2 text-center text-xs bg-muted/10">{c.bands['10k-50k'] > 0 ? c.bands['10k-50k'] : '-'}</td>
                    <td className="px-2 py-2 text-center text-xs bg-muted/10 border-r border-border/30">{c.bands['50k+'] > 0 ? c.bands['50k+'] : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stats.cityData.length > 15 && (
            <div className="p-3 text-center text-xs text-muted-foreground border-t border-border bg-muted/10">
              Showing top 15 of {stats.cityData.length} cities
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
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase sticky top-0 z-10 shadow-sm">
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
                  <td className="px-4 py-2 font-medium">{c.city}</td>
                  <td className="px-4 py-2 text-right border-r border-border font-semibold">{c.cases.toLocaleString()}</td>
                  {stats.bucketData.map(b => {
                    const bData = c.buckets[b.bucket] || { paid: 0, unpaid: 0 };
                    return (
                      <Fragment key={b.bucket}>
                        <td className="px-2 py-2 text-center text-success font-medium">{bData.paid > 0 ? bData.paid : '-'}</td>
                        <td className="px-2 py-2 text-center text-muted-foreground border-r border-border/50">{bData.unpaid > 0 ? bData.unpaid : '-'}</td>
                      </Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </AppLayout>
  );
}

// Need Fragment
`
fs.writeFileSync(path, "import { Fragment } from 'react';\n" + code.trim());
console.log('Dashboard generated successfully.');
