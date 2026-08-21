const fs = require('fs');
const file = 'src/pages/Assignment.tsx';

const content = `import React, { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { fmtCur } from '../lib/formatters';
import { 
  Building2, Filter, X, Plus, CheckCircle2, UserCircle2, 
  Download, Calendar, BarChart3, PieChart, Scale, Equal, LayoutList
} from 'lucide-react';

export default function Assignment() {
  const { records, bulkUpdateRecords, auditLog, globalBucket } = useData();
  const { user } = useAuth();
  
  // Filters & Toggles
  const [excludePaid, setExcludePaid] = useState(false);
  const [viewMode, setViewMode] = useState<'LIVE' | 'DAILY'>('LIVE');
  const [reportDate, setReportDate] = useState<string>(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD

  const existingExecutives = useMemo(() => {
    const execs = new Set<string>();
    records.forEach(r => {
      const e = String(r.executive_name || r['Executive Name'] || '').trim();
      if (e) execs.add(e);
    });
    return Array.from(execs).sort();
  }, [records]);

  // Active records respecting Bucket and Paid filters
  const activeRecords = useMemo(() => {
    return records.filter(r => {
      if (globalBucket !== 'ALL' && String(r.bom_bkt).trim().toUpperCase() !== globalBucket) {
        return false;
      }
      if (excludePaid) {
        const status = String(r.status || '').toUpperCase();
        const isPaid = status.includes('PAID') || status.includes('SETTLED') || (Number(r.amount_collected) > 0 && Number(r.amount_collected) >= Number(r.principal_outstanding));
        if (isPaid) return false;
      }
      return true;
    });
  }, [records, globalBucket, excludePaid]);

  // LIVE STATS: City Aggregation (Master Table)
  const cityStats = useMemo(() => {
    const stats: Record<string, { total: number, unallocated: number, allocated: number, execs: Record<string, number>, unallocatedCases: any[] }> = {};
    activeRecords.forEach(r => {
      const city = String(r.city || r.City || 'Unknown').trim();
      const exec = String(r.executive_name || r['Executive Name'] || '').trim();
      if (!stats[city]) stats[city] = { total: 0, unallocated: 0, allocated: 0, execs: {}, unallocatedCases: [] };
      stats[city].total += 1;
      if (exec) {
        stats[city].allocated += 1;
        stats[city].execs[exec] = (stats[city].execs[exec] || 0) + 1;
      } else {
        stats[city].unallocated += 1;
        stats[city].unallocatedCases.push(r);
      }
    });
    return Object.entries(stats).map(([city, data]) => ({ city, ...data })).sort((a, b) => b.total - a.total);
  }, [activeRecords]);

  // LIVE STATS: Executive Matrix (Sidebar)
  const execStatsList = useMemo(() => {
    const stats: Record<string, { total: number, totalPos: number, cities: Record<string, number> }> = {};
    activeRecords.forEach(r => {
      const exec = String(r.executive_name || r['Executive Name'] || '').trim();
      if (!exec) return;
      const city = String(r.city || r.City || 'Unknown').trim();
      const pos = Number(r.principal_outstanding) || 0;
      
      if (!stats[exec]) stats[exec] = { total: 0, totalPos: 0, cities: {} };
      stats[exec].total += 1;
      stats[exec].totalPos += pos;
      stats[exec].cities[city] = (stats[exec].cities[city] || 0) + 1;
    });

    // Flatten into rows: Executive | City | Count | Total
    const rows: { exec: string, city: string, count: number, execTotal: number }[] = [];
    Object.entries(stats).forEach(([exec, data]) => {
      Object.entries(data.cities).forEach(([city, count]) => {
        rows.push({ exec, city, count, execTotal: data.total });
      });
    });
    
    // Sort by Executive Total Desc, then Executive Name, then Count Desc
    return rows.sort((a, b) => b.execTotal - a.execTotal || a.exec.localeCompare(b.exec) || b.count - a.count);
  }, [activeRecords]);

  // DAILY STATS: Based on Audit Log
  const dailyReport = useMemo(() => {
    // 1. Filter audit log for the selected date, where field is executive_name and a new assignment was made
    const dailyLogs = auditLog.filter(log => {
      if (log.field !== 'executive_name') return false;
      if (!log.newValue || String(log.newValue).trim() === '') return false; // Skip unassignments
      const logDate = new Date(log.createdAt).toLocaleDateString('en-CA');
      return logDate === reportDate;
    });

    // 2. Map back to records to resolve Bucket and City
    const aggregated: Record<string, { exec: string, city: string, count: number, pos: number }> = {};
    
    dailyLogs.forEach(log => {
      const exec = String(log.newValue).trim();
      const record = records.find(r => String(r.agreementid || r.agreement_no || r.id) === log.agreementid);
      if (!record) return;

      // Apply current bucket filter to daily report too (as requested)
      if (globalBucket !== 'ALL' && String(record.bom_bkt).trim().toUpperCase() !== globalBucket) return;

      const city = String(record.city || record.City || 'Unknown').trim();
      const pos = Number(record.principal_outstanding) || 0;
      const key = \`\${exec}|\${city}\`;
      
      if (!aggregated[key]) {
        aggregated[key] = { exec, city, count: 0, pos: 0 };
      }
      aggregated[key].count += 1;
      aggregated[key].pos += pos;
    });

    return Object.values(aggregated).sort((a, b) => b.count - a.count);
  }, [auditLog, records, reportDate, globalBucket]);

  // Modal State
  const [assignModal, setAssignModal] = useState<{ city: string, cases: any[] } | null>(null);
  const [selectedExecs, setSelectedExecs] = useState<{ name: string, val: string }[]>([{ name: '', val: '' }]);
  const [distMode, setDistMode] = useState<'EQUAL' | 'CUSTOM' | 'PERCENT' | 'POS'>('EQUAL');

  // Distribution Logic Info
  const DIST_INFO = {
    'EQUAL': "Equally divides the case count among all listed executives. Any remainder is distributed 1-by-1 to the first few.",
    'CUSTOM': "Assigns exactly the specific number of cases you input for each executive.",
    'PERCENT': "Distributes cases based on a percentage (e.g., 60% to Exec A, 40% to Exec B). Ensure totals equal 100%.",
    'POS': "Load balances based on monetary value. It intelligently assigns high-value cases to ensure all executives receive a roughly equal total Principal Outstanding (POS) amount, rather than just equal case counts."
  };

  const openAssignModal = (city: string, cases: any[]) => {
    setAssignModal({ city, cases });
    setSelectedExecs([{ name: '', val: '' }]);
    setDistMode('EQUAL');
  };

  const handleConfirmAssignment = () => {
    if (!assignModal) return;
    const validExecs = selectedExecs.filter(e => e.name.trim() !== '');
    if (validExecs.length === 0) return alert("Enter at least one executive.");

    const availableCases = [...assignModal.cases];
    const updates: {agreementid: string, field: string, value: string}[] = [];

    if (distMode === 'EQUAL') {
      const N = validExecs.length;
      const base = Math.floor(availableCases.length / N);
      let remainder = availableCases.length % N;
      let caseIdx = 0;

      validExecs.forEach(exec => {
        let count = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        for (let i = 0; i < count; i++) {
          if (caseIdx < availableCases.length) {
            const c = availableCases[caseIdx++];
            updates.push({ agreementid: String(c.agreementid || c.agreement_no || c.id), field: 'executive_name', value: exec.name.trim() });
          }
        }
      });
    } 
    else if (distMode === 'CUSTOM') {
      const totalReq = validExecs.reduce((s, e) => s + (parseInt(e.val) || 0), 0);
      if (totalReq > availableCases.length) return alert(\`Requested \${totalReq} cases, but only \${availableCases.length} available.\`);
      
      let caseIdx = 0;
      validExecs.forEach(exec => {
        const count = parseInt(exec.val) || 0;
        for (let i = 0; i < count; i++) {
          if (caseIdx < availableCases.length) {
            const c = availableCases[caseIdx++];
            updates.push({ agreementid: String(c.agreementid || c.agreement_no || c.id), field: 'executive_name', value: exec.name.trim() });
          }
        }
      });
    }
    else if (distMode === 'PERCENT') {
      const totalPct = validExecs.reduce((s, e) => s + (parseFloat(e.val) || 0), 0);
      if (Math.abs(totalPct - 100) > 0.1) return alert(\`Percentages must equal 100%. Currently: \${totalPct}%\`);
      
      let caseIdx = 0;
      const totalCases = availableCases.length;
      let assignedCount = 0;

      validExecs.forEach((exec, index) => {
        let count = Math.round(totalCases * ((parseFloat(exec.val) || 0) / 100));
        // Adjustment for rounding errors on the last executive
        if (index === validExecs.length - 1) {
          count = totalCases - assignedCount;
        }
        for (let i = 0; i < count; i++) {
          if (caseIdx < availableCases.length) {
            const c = availableCases[caseIdx++];
            updates.push({ agreementid: String(c.agreementid || c.agreement_no || c.id), field: 'executive_name', value: exec.name.trim() });
            assignedCount++;
          }
        }
      });
    }
    else if (distMode === 'POS') {
      // Sort cases by POS descending
      availableCases.sort((a, b) => (Number(b.principal_outstanding) || 0) - (Number(a.principal_outstanding) || 0));
      
      // Track running POS for each exec
      const execLoads = validExecs.map(e => ({ name: e.name.trim(), currentPos: 0 }));
      
      availableCases.forEach(c => {
        // Find exec with minimum load
        execLoads.sort((a, b) => a.currentPos - b.currentPos);
        const chosenExec = execLoads[0];
        
        updates.push({ agreementid: String(c.agreementid || c.agreement_no || c.id), field: 'executive_name', value: chosenExec.name });
        chosenExec.currentPos += (Number(c.principal_outstanding) || 0);
      });
    }

    if (updates.length > 0) {
      bulkUpdateRecords(updates, user?.name || 'System');
    }
    setAssignModal(null);
  };

  // CSV Export
  const handleExport = () => {
    let csv = "";
    if (viewMode === 'LIVE') {
      csv += "EXECUTIVE SIDEBAR PORTFOLIO\\n";
      csv += "Executive,City,Allocated Cases,Total\\n";
      execStatsList.forEach(row => {
        csv += \`"\${row.exec}","\${row.city}",\${row.count},\${row.execTotal}\\n\`;
      });
      csv += "\\nCITY ALLOCATION OVERVIEW\\n";
      csv += "City,Total Cases,Allocated,Unallocated\\n";
      cityStats.forEach(stat => {
        csv += \`"\${stat.city}",\${stat.total},\${stat.allocated},\${stat.unallocated}\\n\`;
      });
    } else {
      csv += \`DAILY ASSIGNMENT REPORT - \${reportDate}\\n\`;
      csv += "Executive,City,Cases Assigned,Principal (POS)\\n";
      dailyReport.forEach(row => {
        csv += \`"\${row.exec}","\${row.city}",\${row.count},\${row.pos}\\n\`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`Allocation_Export_\${viewMode}_\${new Date().toISOString().split('T')[0]}.csv\`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      {/* Header & Controls */}
      <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground">Resource Allocation</h1>
          <p className="text-sm text-muted-foreground mt-1">Multi-logic case distribution and portfolio tracking.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* View Toggles */}
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
            <button 
              onClick={() => setViewMode('LIVE')}
              className={\`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 \${viewMode === 'LIVE' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}\`}
            >
              <LayoutList className="h-4 w-4" /> Live Status
            </button>
            <button 
              onClick={() => setViewMode('DAILY')}
              className={\`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 \${viewMode === 'DAILY' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}\`}
            >
              <Calendar className="h-4 w-4" /> Daily Report
            </button>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>

          <button
            onClick={() => setExcludePaid(!excludePaid)}
            className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm border \${
              excludePaid ? 'bg-primary/10 text-primary border-primary' : 'bg-card text-foreground border-border hover:bg-muted'
            }\`}
          >
            <Filter className="h-4 w-4" /> {excludePaid ? 'Unpaid Only' : 'All Cases'}
          </button>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-card border border-border hover:bg-muted text-foreground"
          >
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </div>

      {/* Global Filter Indicator (For when User works with the Global Bucket Filter) */}
      {globalBucket !== 'ALL' && (
        <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between shadow-sm animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">Active Bucket Filter: <span className="uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded ml-1 text-xs">{globalBucket}</span></span>
          </div>
          <p className="text-xs font-medium text-primary/80 hidden sm:block">All views and exports below are currently restricted to this bucket.</p>
        </div>
      )}

      {viewMode === 'LIVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          {/* Main Content: City Grid */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">City Allocation Master</h2>
            </div>
            <div className="overflow-x-auto scrollbar-thin max-h-[800px]">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[500px]">
                <thead className="bg-muted/50 border-b border-border sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">City</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Total</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center text-primary">Allocated</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center text-destructive">Unallocated (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {cityStats.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No cases found.</td></tr>
                  ) : (
                    cityStats.map(stat => (
                      <tr key={stat.city} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">{stat.city}</td>
                        <td className="px-6 py-4 text-center font-semibold">{stat.total}</td>
                        <td className="px-6 py-4 text-center font-bold text-primary">{stat.allocated}</td>
                        <td className="px-6 py-4 text-center">
                          {stat.unallocated > 0 ? (
                            <button 
                              onClick={() => openAssignModal(stat.city, stat.unallocatedCases)}
                              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-destructive/10 text-destructive font-bold hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
                            >
                              {stat.unallocated} <Plus className="h-4 w-4" /> Assign
                            </button>
                          ) : (
                            <span className="text-muted-foreground/40 font-medium">0</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Executive Matrix */}
          <div className="lg:col-span-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[800px]">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-info" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Executive Sidebar</h2>
              </div>
            </div>
            <div className="overflow-y-auto scrollbar-thin">
              {execStatsList.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 text-sm">No allocated executives found.</div>
              ) : (
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-muted/30 text-muted-foreground uppercase tracking-widest text-[10px] sticky top-0 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-bold">Executive</th>
                      <th className="px-4 py-3 font-bold">City</th>
                      <th className="px-4 py-3 font-bold text-center">Count</th>
                      <th className="px-4 py-3 font-bold text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {execStatsList.map((row, i) => {
                      const isFirstForExec = i === 0 || execStatsList[i - 1].exec !== row.exec;
                      return (
                        <tr key={\`\${row.exec}-\${row.city}\`} className="hover:bg-muted/20">
                          <td className={\`px-4 py-3 font-bold \${isFirstForExec ? 'text-primary' : 'text-transparent'}\`}>
                            {isFirstForExec ? row.exec : '""'}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">{row.city}</td>
                          <td className="px-4 py-3 text-center font-bold">{row.count}</td>
                          <td className={\`px-4 py-3 text-center font-black \${isFirstForExec ? 'text-primary bg-primary/5 rounded-md' : 'text-transparent'}\`}>
                            {isFirstForExec ? row.execTotal : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}

      {viewMode === 'DAILY' && (
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 max-h-[800px]">
          <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Daily Assignment Report</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Date:</span>
              <input 
                type="date"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                className="h-9 px-3 rounded bg-background border border-border text-sm outline-none focus:border-primary shadow-sm cursor-pointer"
              />
            </div>
          </div>
          <div className="overflow-auto scrollbar-thin">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
              <thead className="bg-muted/50 border-b border-border sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Executive</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">City</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Cases Assigned</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Total POS Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {dailyReport.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No assignments recorded on this date for the selected filters.</td></tr>
                ) : (
                  dailyReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{row.exec}</td>
                      <td className="px-6 py-4 text-muted-foreground">{row.city}</td>
                      <td className="px-6 py-4 text-center font-bold text-primary">{row.count}</td>
                      <td className="px-6 py-4 text-right font-medium text-info">{fmtCur(row.pos)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Modal overlay */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Distribute Portfolio: <span className="text-primary">{assignModal.city}</span>
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-black uppercase tracking-widest text-destructive">
                    {assignModal.cases.length} Pending Cases
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Available for allocation</span>
                </div>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-background">
              {/* Distribution Mode Tabs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { id: 'EQUAL', label: 'Equal Split', icon: Equal },
                  { id: 'CUSTOM', label: 'Custom Count', icon: BarChart3 },
                  { id: 'PERCENT', label: 'Percentage (%)', icon: PieChart },
                  { id: 'POS', label: 'POS Balance', icon: Scale },
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => setDistMode(mode.id as any)}
                    className={\`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all \${distMode === mode.id ? 'bg-primary/5 border-primary text-primary shadow-sm scale-[1.02]' : 'bg-card border-border text-muted-foreground hover:bg-muted'}\`}
                  >
                    <mode.icon className="h-6 w-6" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Mode Info Box */}
              <div className="mb-6 p-4 rounded-xl bg-info/5 border border-info/20 text-sm text-info/90 flex items-start gap-3 shadow-inner">
                <div className="shrink-0 mt-0.5"><Scale className="h-5 w-5" /></div>
                <p className="leading-relaxed font-medium">{DIST_INFO[distMode]}</p>
              </div>

              {/* Executives List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select Agents & Values
                   </label>
                </div>
                
                {selectedExecs.map((exec, idx) => (
                  <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={exec.name}
                        onChange={(e) => {
                          const n = [...selectedExecs];
                          n[idx].name = e.target.value;
                          setSelectedExecs(n);
                        }}
                        placeholder="Agent Name..."
                        list="modal-exec-list"
                        className="w-full h-12 px-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                      />
                    </div>
                    
                    {distMode === 'CUSTOM' && (
                      <div className="w-32 relative">
                        <input type="number" min="1" max={assignModal.cases.length} value={exec.val} placeholder="Count"
                          onChange={(e) => {
                            const n = [...selectedExecs]; n[idx].val = e.target.value; setSelectedExecs(n);
                          }}
                          className="w-full h-12 px-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                        />
                      </div>
                    )}

                    {distMode === 'PERCENT' && (
                      <div className="w-32 relative flex items-center">
                        <input type="number" min="1" max="100" value={exec.val} placeholder="0"
                          onChange={(e) => {
                            const n = [...selectedExecs]; n[idx].val = e.target.value; setSelectedExecs(n);
                          }}
                          className="w-full h-12 px-4 pr-8 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                        />
                        <span className="absolute right-3 text-muted-foreground font-bold">%</span>
                      </div>
                    )}
                    
                    {(distMode === 'EQUAL' || distMode === 'POS') && (
                      <div className="w-32 h-12 px-4 flex items-center justify-center bg-muted/50 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground border border-border">
                        Auto
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        const n = [...selectedExecs];
                        n.splice(idx, 1);
                        if (n.length === 0) n.push({ name: '', val: '' });
                        setSelectedExecs(n);
                      }}
                      className="shrink-0 p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedExecs([...selectedExecs, { name: '', val: '' }])}
                className="mt-6 flex items-center justify-center w-full sm:w-auto gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors bg-primary/5 border border-primary/20 px-6 py-3 rounded-xl hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" /> Add Another Agent
              </button>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-border bg-muted/30 flex flex-wrap justify-end gap-3">
              <button 
                onClick={() => setAssignModal(null)}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAssignment}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Distribute & Save
              </button>
            </div>
          </div>
        </div>
      )}

      <datalist id="modal-exec-list">
        {existingExecutives.map(e => <option key={e} value={e} />)}
      </datalist>

    </AppLayout>
  );
}
`;

fs.writeFileSync(file, content);
