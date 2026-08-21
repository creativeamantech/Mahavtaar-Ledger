const fs = require('fs');

const code = `import React, { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { fmtCur } from '../lib/formatters';
import { Users, Building2, Filter, X, Plus, CheckCircle2, ChevronRight, UserCircle2 } from 'lucide-react';

export default function Assignment() {
  const { records, bulkUpdateRecords, globalBucket } = useData();
  
  // Filters
  const [localBucket, setLocalBucket] = useState<string>('ALL'); // Allows overriding global if needed, but defaults to ALL. Actually, let's use a specific state for this page.
  const [excludePaid, setExcludePaid] = useState(true);

  // Available buckets for dropdown
  const availableBuckets = useMemo(() => {
    const bkts = new Set<string>();
    records.forEach(r => {
      if (r.bom_bkt) bkts.add(String(r.bom_bkt).trim().toUpperCase());
    });
    return Array.from(bkts).sort();
  }, [records]);

  // Unique executives for dropdown
  const existingExecutives = useMemo(() => {
    const execs = new Set<string>();
    records.forEach(r => {
      const e = String(r.executive_name || r['Executive Name'] || '').trim();
      if (e) execs.add(e);
    });
    return Array.from(execs).sort();
  }, [records]);

  // Filtered Records
  const activeRecords = useMemo(() => {
    return records.filter(r => {
      // Bucket filter
      if (localBucket !== 'ALL' && String(r.bom_bkt).trim().toUpperCase() !== localBucket) {
        return false;
      }
      
      // Paid filter
      if (excludePaid) {
        const status = String(r.status || '').toUpperCase();
        // Assuming 'PAID', 'SETTLED', or if amount_collected >= principal_outstanding
        const isPaid = status.includes('PAID') || status.includes('SETTLED') || (Number(r.amount_collected) > 0 && Number(r.amount_collected) >= Number(r.principal_outstanding));
        if (isPaid) return false;
      }
      return true;
    });
  }, [records, localBucket, excludePaid]);

  // Table Data Aggregation
  const cityStats = useMemo(() => {
    const stats: Record<string, { 
      total: number, 
      unallocated: number, 
      allocated: number, 
      execs: Record<string, number>,
      unallocatedCases: any[]
    }> = {};

    activeRecords.forEach(r => {
      const city = String(r.city || r.City || 'Unknown').trim();
      const exec = String(r.executive_name || r['Executive Name'] || '').trim();
      
      if (!stats[city]) {
        stats[city] = { total: 0, unallocated: 0, allocated: 0, execs: {}, unallocatedCases: [] };
      }

      stats[city].total += 1;

      if (exec) {
        stats[city].allocated += 1;
        stats[city].execs[exec] = (stats[city].execs[exec] || 0) + 1;
      } else {
        stats[city].unallocated += 1;
        stats[city].unallocatedCases.push(r);
      }
    });

    return Object.entries(stats).map(([city, data]) => ({
      city,
      ...data
    })).sort((a, b) => b.total - a.total); // Sort by total cases descending
  }, [activeRecords]);

  // Totals
  const totals = useMemo(() => {
    return cityStats.reduce((acc, curr) => {
      acc.total += curr.total;
      acc.allocated += curr.allocated;
      acc.unallocated += curr.unallocated;
      return acc;
    }, { total: 0, allocated: 0, unallocated: 0 });
  }, [cityStats]);

  // Modal State
  const [assignModal, setAssignModal] = useState<{ city: string, cases: any[] } | null>(null);
  const [selectedExecs, setSelectedExecs] = useState<{ name: string, count: string }[]>([{ name: '', count: '' }]);
  const [distMode, setDistMode] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');

  // Modal Actions
  const openAssignModal = (city: string, cases: any[]) => {
    setAssignModal({ city, cases });
    setSelectedExecs([{ name: '', count: '' }]);
    setDistMode('EQUAL');
  };

  const closeAssignModal = () => {
    setAssignModal(null);
  };

  const addExecRow = () => {
    setSelectedExecs([...selectedExecs, { name: '', count: '' }]);
  };

  const removeExecRow = (index: number) => {
    const newExecs = [...selectedExecs];
    newExecs.splice(index, 1);
    if (newExecs.length === 0) newExecs.push({ name: '', count: '' });
    setSelectedExecs(newExecs);
  };

  const updateExecRow = (index: number, field: 'name' | 'count', value: string) => {
    const newExecs = [...selectedExecs];
    newExecs[index][field] = value;
    setSelectedExecs(newExecs);
  };

  const handleConfirmAssignment = () => {
    if (!assignModal) return;
    
    // Filter out empty names
    const validExecs = selectedExecs.filter(e => e.name.trim() !== '');
    if (validExecs.length === 0) {
      alert("Please enter at least one executive name.");
      return;
    }

    const availableCases = assignModal.cases;
    let updates: any[] = [];
    let caseIndex = 0;

    if (distMode === 'EQUAL') {
      const totalExecs = validExecs.length;
      const baseCount = Math.floor(availableCases.length / totalExecs);
      let remainder = availableCases.length % totalExecs;

      validExecs.forEach(exec => {
        let countForThis = baseCount + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;

        for (let i = 0; i < countForThis; i++) {
          if (caseIndex < availableCases.length) {
            const targetCase = availableCases[caseIndex];
            updates.push({
              agreementid: String(targetCase.agreementid || targetCase.agreement_no || targetCase.id),
              field: 'executive_name',
              value: exec.name.trim()
            });
            caseIndex++;
          }
        }
      });
    } else {
      // CUSTOM Dist
      let totalRequested = validExecs.reduce((sum, e) => sum + (parseInt(e.count) || 0), 0);
      if (totalRequested > availableCases.length) {
        alert(\`You requested to assign \${totalRequested} cases, but only \${availableCases.length} are available.\`);
        return;
      }

      validExecs.forEach(exec => {
        const countForThis = parseInt(exec.count) || 0;
        for (let i = 0; i < countForThis; i++) {
          if (caseIndex < availableCases.length) {
            const targetCase = availableCases[caseIndex];
            updates.push({
              agreementid: String(targetCase.agreementid || targetCase.agreement_no || targetCase.id),
              field: 'executive_name',
              value: exec.name.trim()
            });
            caseIndex++;
          }
        }
      });
    }

    if (updates.length > 0) {
      bulkUpdateRecords(updates, 'System');
    }
    
    closeAssignModal();
  };


  return (
    <AppLayout>
      {/* Header & Controls */}
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground">Resource Allocation Master</h1>
          <p className="text-sm text-muted-foreground mt-1">Single-pane view for verifying counts and bulk distributing cases.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={localBucket}
            onChange={(e) => setLocalBucket(e.target.value)}
            className="h-10 px-3 rounded-lg bg-card border border-border text-sm font-semibold outline-none focus:border-primary shadow-sm"
          >
            <option value="ALL">All Buckets</option>
            {availableBuckets.map(b => (
              <option key={b} value={b}>Bucket {b}</option>
            ))}
          </select>

          <button
            onClick={() => setExcludePaid(!excludePaid)}
            className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm border \${
              excludePaid 
                ? 'bg-primary/10 text-primary border-primary' 
                : 'bg-card text-foreground border-border hover:bg-muted'
            }\`}
          >
            <Filter className="h-4 w-4" />
            {excludePaid ? 'Paid Cases Hidden' : 'Showing All Cases'}
          </button>
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden animate-in fade-in duration-500">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">City</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Total Cases</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center text-primary">Allocated</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center text-destructive">Unallocated</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Executive Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {cityStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No cases match the current filters.
                  </td>
                </tr>
              ) : (
                cityStats.map((stat) => (
                  <tr key={stat.city} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 font-bold text-foreground">
                      {stat.city}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {stat.total}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-primary">
                      {stat.allocated}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {stat.unallocated > 0 ? (
                        <button 
                          onClick={() => openAssignModal(stat.city, stat.unallocatedCases)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive font-bold hover:bg-destructive hover:text-destructive-foreground transition-all"
                          title="Click to Assign"
                        >
                          {stat.unallocated}
                          <Plus className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground/50 font-medium">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {Object.keys(stat.execs).length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {Object.entries(stat.execs).sort((a,b) => b[1] - a[1]).map(([exec, count]) => (
                            <span key={exec} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-[11px] font-semibold text-foreground border border-border">
                              <UserCircle2 className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[100px]">{exec}</span>
                              <span className="text-primary ml-1">{count}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-muted/80 border-t-2 border-border font-bold">
              <tr>
                <td className="px-6 py-4 text-foreground uppercase tracking-wider text-xs">Total Grid</td>
                <td className="px-6 py-4 text-center text-foreground">{totals.total}</td>
                <td className="px-6 py-4 text-center text-primary">{totals.allocated}</td>
                <td className="px-6 py-4 text-center text-destructive">{totals.unallocated}</td>
                <td className="px-6 py-4 text-muted-foreground text-xs uppercase">Overall Breakdown Aggregated</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Assignment Modal overlay */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Allocate Cases: {assignModal.city}</h2>
                <p className="text-sm font-medium text-destructive mt-0.5">
                  {assignModal.cases.length} Unallocated Cases Available
                </p>
              </div>
              <button onClick={closeAssignModal} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Distribution Mode */}
              <div className="mb-6 bg-muted/30 p-1 rounded-lg inline-flex w-full sm:w-auto">
                <button 
                  onClick={() => setDistMode('EQUAL')}
                  className={\`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-colors \${distMode === 'EQUAL' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}\`}
                >
                  Equal Split
                </button>
                <button 
                  onClick={() => setDistMode('CUSTOM')}
                  className={\`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-colors \${distMode === 'CUSTOM' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}\`}
                >
                  Custom Count
                </button>
              </div>

              {/* Executives List */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Assign to Agents
                </label>
                
                {selectedExecs.map((exec, idx) => (
                  <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={exec.name}
                        onChange={(e) => updateExecRow(idx, 'name', e.target.value)}
                        placeholder="Agent Name..."
                        list="modal-exec-list"
                        className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                      />
                    </div>
                    
                    {distMode === 'CUSTOM' && (
                      <div className="w-24 relative">
                        <input 
                          type="number"
                          min="1"
                          max={assignModal.cases.length}
                          value={exec.count}
                          onChange={(e) => updateExecRow(idx, 'count', e.target.value)}
                          placeholder="Count"
                          className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary"
                        />
                      </div>
                    )}
                    
                    {distMode === 'EQUAL' && (
                      <div className="w-24 h-10 px-3 flex items-center justify-center bg-muted rounded-lg text-sm font-semibold text-muted-foreground border border-border">
                        Auto
                      </div>
                    )}

                    <button 
                      onClick={() => removeExecRow(idx)}
                      className="shrink-0 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={addExecRow}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Another Agent
              </button>

              {/* Custom Warning if over limit */}
              {distMode === 'CUSTOM' && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Requested:</span>
                  <span className={\`text-lg font-black \${
                    selectedExecs.reduce((s, e) => s + (parseInt(e.count)||0), 0) > assignModal.cases.length ? 'text-destructive' : 'text-foreground'
                  }\`}>
                    {selectedExecs.reduce((s, e) => s + (parseInt(e.count)||0), 0)} / {assignModal.cases.length}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end gap-3">
              <button 
                onClick={closeAssignModal}
                className="px-6 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAssignment}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Allocation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Datalist for autocomplete */}
      <datalist id="modal-exec-list">
        {existingExecutives.map(e => <option key={e} value={e} />)}
      </datalist>

    </AppLayout>
  );
}
`

fs.writeFileSync('src/pages/Assignment.tsx', code);
console.log("Rewrote assignment page as requested with modal and equal/custom split logic");
