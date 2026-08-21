/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { calculateRow } from '../lib/calculations';
import { fmtCur } from '../lib/formatters';
import { Filter, Database, Search, Download, Columns, Plus, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { ResponsiveFilter } from '../components/ui/ResponsiveFilter';


const STANDARD_KEYS = [
  'agreementid', 'agreement_no',
  'customer_name', 'CUSTOMERNAME', 'Customer Name', 'CUSTOMER_NAME', 'customername',
  'bom_bkt',
  'state', 'State',
  'city', 'City',
  'executive_name', 'Executive Name',
  'principal_outstanding',
  'emi_amt',
  'ecs',
  'provisional_dac', 'dac',
  'mainPaid', 'emiCount'
];

export default function DataExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { records, schema, isLoading } = useData();
  const { user, isExecutive } = useAuth();
  
  // Filter States
  const [selectedState, setSelectedState] = useState<string>(searchParams.get('state') || 'All');
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || 'All');
  const [selectedBucket, setSelectedBucket] = useState<string>(searchParams.get('bucket') || 'All');
  const [selectedExecutive, setSelectedExecutive] = useState<string>(searchParams.get('executive') || 'All');
  const [selectedPaidStatus, setSelectedPaidStatus] = useState<string>(searchParams.get('paid') || 'All'); // All, Paid, Unpaid
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [exactCustomerFingerprint, setExactCustomerFingerprint] = useState<string | null>(null);
  const [minPos, setMinPos] = useState<string>(searchParams.get('minPos') || '');
  const [maxPos, setMaxPos] = useState<string>(searchParams.get('maxPos') || '');
  const [activeCustomFilters, setActiveCustomFilters] = useState<string[]>([]);
  const [customFilterValues, setCustomFilterValues] = useState<Record<string, string>>({});
  const [customFilterSearch, setCustomFilterSearch] = useState('');
  const [columnFilterSearches, setColumnFilterSearches] = useState<Record<string, string>>({});

  
  
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [multiCaseModal, setMultiCaseModal] = useState<{name: string, records: any[]} | null>(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  const allExtraKeys = useMemo(() => {
    return schema.filter(k => !STANDARD_KEYS.includes(k) && !k.startsWith('_'));
  }, [schema]);

  
  const [columnSearch, setColumnSearch] = useState('');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollTable = (dir: 'left' | 'right') => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };
  const jumpToColumn = (colName: string) => {
    const el = document.getElementById(`th-${colName}`);
    if (el && tableContainerRef.current) {
      // Get the relative position of the column within the container
      const containerLeft = tableContainerRef.current.getBoundingClientRect().left;
      const elLeft = el.getBoundingClientRect().left;
      const scrollOffset = elLeft - containerLeft - 100; // offset slightly
      tableContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  
  const [visibleExtraColumns, setVisibleExtraColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('dataExplorerExtraColumns');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (visibleExtraColumns === null && allExtraKeys.length > 0) {
      setVisibleExtraColumns(allExtraKeys);
      localStorage.setItem('dataExplorerExtraColumns', JSON.stringify(allExtraKeys));
    }
  }, [allExtraKeys, visibleExtraColumns]);

  const toggleExtraColumn = (col: string) => {
    setVisibleExtraColumns(prev => {
      const safePrev = prev || [];
      const next = safePrev.includes(col) ? safePrev.filter(c => c !== col) : [...safePrev, col];
      localStorage.setItem('dataExplorerExtraColumns', JSON.stringify(next));
      return next;
    });
  };


  useEffect(() => {
    // Update URL when filters change to allow sharing links
    const params = new URLSearchParams();
    if (selectedState !== 'All') params.set('state', selectedState);
    if (selectedCity !== 'All') params.set('city', selectedCity);
    if (selectedBucket !== 'All') params.set('bucket', selectedBucket);
    if (selectedExecutive !== 'All') params.set('executive', selectedExecutive);
    if (selectedPaidStatus !== 'All') params.set('paid', selectedPaidStatus);
    if (searchQuery) params.set('q', searchQuery);
    if (minPos) params.set('minPos', minPos);
    if (maxPos) params.set('maxPos', maxPos);
    setSearchParams(params, { replace: false });
    setPage(1); // Reset page on filter change
  }, [selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, searchQuery, minPos, maxPos, setSearchParams]);

  const baseRecords = useMemo(() => {
    if (isExecutive() && user) return records.filter((r: any) => r.executive_name === user.name);
    return records;
  }, [records, user, isExecutive]);

  // Derived options for filters
  const availableStates = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.state || r.State || 'UNKNOWN').trim().toUpperCase()).filter(Boolean))).sort()], [baseRecords]);
  const availableCities = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.city || r.City || 'UNKNOWN').trim().toUpperCase()).filter(Boolean))).sort()], [baseRecords]);
  const availableBuckets = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.bom_bkt || 'UNKNOWN').trim()).filter(Boolean))).sort((a,b) => Number(a) - Number(b))], [baseRecords]);
  const { addressKey, contactKey } = useMemo(() => {
    return {
      addressKey: schema.find(k => k.toLowerCase() === 'mailingaddress') || schema.find(k => k.toLowerCase().includes('address') || k.toLowerCase() === 'add1' || k.toLowerCase().includes('add_1') || k.toLowerCase().includes('res_add')) || null,
      contactKey: schema.find(k => k.toLowerCase().includes('mobile') || k.toLowerCase().includes('phone') || k.toLowerCase().includes('contact')) || null
    };
  }, [schema]);

  const availableExecutives = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim()).filter(Boolean))).sort()], [baseRecords]);

  const customerStats = useMemo(() => {
    const stats: Record<string, { count: number, totalPos: number }> = {};
    baseRecords.forEach((r: any) => {
      const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
      const name = String(rawName).trim().toUpperCase();
      const address = addressKey ? String(r[addressKey] || '').trim().toUpperCase() : '';
      const contact = contactKey ? String(r[contactKey] || '').trim().toUpperCase() : '';
      const fingerprint = `${name}||${contact}||${address}`;
      
      if (name && name !== '-') {
        if (!stats[fingerprint]) stats[fingerprint] = { count: 0, totalPos: 0 };
        stats[fingerprint].count += 1;
        stats[fingerprint].totalPos += Number(r.principal_outstanding) || 0;
      }
    });
    return stats;
  }, [baseRecords, addressKey, contactKey]);

  
  // Computed Records
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((r: any) => {
      if (exactCustomerFingerprint) {
        const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
        const name = String(rawName).trim().toUpperCase();
        const address = addressKey ? String(r[addressKey] || '').trim().toUpperCase() : '';
        const contact = contactKey ? String(r[contactKey] || '').trim().toUpperCase() : '';
        if (`${name}||${contact}||${address}` !== exactCustomerFingerprint) return false;
      }
      if (selectedState !== 'All' && String(r.state || r.State || 'UNKNOWN').trim().toUpperCase() !== selectedState) return false;
      if (selectedCity !== 'All' && String(r.city || r.City || 'UNKNOWN').trim().toUpperCase() !== selectedCity) return false;
      if (selectedBucket !== 'All' && String(r.bom_bkt || 'UNKNOWN').trim() !== selectedBucket) return false;
      if (selectedExecutive !== 'All' && String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim() !== selectedExecutive) return false;
      
      const c = calculateRow(r);
      const isPaid = c.mainPaid === 1;
      
      if (selectedPaidStatus === 'Paid' && !isPaid) return false;
      if (selectedPaidStatus === 'Unpaid' && isPaid) return false;
      const pos = Number(r.principal_outstanding) || 0;
      if (minPos && pos < Number(minPos)) return false;
      if (maxPos && pos > Number(maxPos)) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '').toLowerCase();
        const id = String(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '').toLowerCase();
        if (!name.includes(q) && !id.includes(q)) return false;

      }
      
      for (const col of activeCustomFilters) {
        const filterVal = customFilterValues[col];
        if (filterVal && filterVal !== 'All') {
          if (String(r[col] || '').trim().toUpperCase() !== filterVal.trim().toUpperCase()) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [baseRecords, selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, searchQuery, minPos, maxPos, activeCustomFilters, customFilterValues, exactCustomerFingerprint, addressKey, contactKey]);

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredRecords, page]);

    const handleExport = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['Agreement Number', 'Customer Name', 'State', 'City', 'Executive', 'Bucket', 'POS', 'EMI', 'DAC', 'ECS', 'Paid Status'];
    const csv = [
      headers.join(','),
      ...filteredRecords.map((r: any) => {
        const isPaid = calculateRow(r).mainPaid === 1;
        return [
          `"${r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || ''}"`,
          `"${r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || ''}"`,
          `"${r.state || r.State || ''}"`,
          `"${r.city || r.City || ''}"`,
          `"${r.executive_name || r['Executive Name'] || ''}"`,
          `"${r.bom_bkt || ''}"`,
          Number(r.principal_outstanding) || 0,
          Number(r.emi_amt) || 0,
          Number(r.dac ?? r.DAC) || 0,
          Number(r.ecs ?? r.ECS) || 0,
          isPaid ? 'Paid' : 'Unpaid'
        ].join(',');
      })
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Data_Explorer_Export.csv'; a.click();
  };
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-10 w-48 bg-muted rounded-md mb-4" />
          <div className="h-20 w-full bg-card border border-border rounded-xl" />
          <div className="h-[500px] w-full bg-card border border-border rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> Data Explorer
          </h1>
          <p className="font-sans text-xs text-muted-foreground mt-1">Raw record inspection and drill-down analysis</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm">
            {filteredRecords.length.toLocaleString()} <span className="font-medium opacity-80 text-xs uppercase tracking-wider">Cases</span>
          </div>
          <div className="bg-info/10 text-info px-4 py-2 rounded-lg font-bold text-sm">
            {fmtCur(filteredRecords.reduce((sum, r) => sum + (Number(r.principal_outstanding) || 0), 0))} <span className="font-medium opacity-80 text-xs uppercase tracking-wider">Total POS</span>
          </div>
        </div>
      </div>

      {/* Primary Bucket Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Primary Bucket:</span>
        {availableBuckets.map(b => (
          <button
            key={b}
            onClick={() => setSelectedBucket(b)}
            className={`px-4 py-1.5 font-sans text-[11px] font-bold uppercase tracking-wider rounded-full transition-all border ${
              selectedBucket === b 
                ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' 
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {b === 'All' ? 'All Buckets' : `Bucket ${b}`}
          </button>
        ))}
      </div>

      {/* Consolidated Secondary Filters */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-3 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Paid Status</span>
            <select value={selectedPaidStatus} onChange={e => setSelectedPaidStatus(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              <option value="All">All Cases</option>
              <option value="Paid">Main Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">State</span>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">City</span>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableCities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Executive</span>
            <select value={selectedExecutive} onChange={e => setSelectedExecutive(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableExecutives.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          {activeCustomFilters.map(col => {
            // Compute unique options for this column
            const options = Array.from(new Set(baseRecords.map((r: any) => String(r[col] || 'UNKNOWN').trim().toUpperCase()).filter(Boolean))).sort();
            return (
              <div key={col} className="flex items-center gap-2 shrink-0 bg-muted/30 px-2 py-1 rounded border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                  {col}
                  <button onClick={() => {
                    setActiveCustomFilters(prev => prev.filter(c => c !== col));
                    setCustomFilterValues(prev => { const n = {...prev}; delete n[col]; return n; });
                  }} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-8 min-w-[120px] max-w-[150px] justify-between px-2 flex items-center text-xs font-medium bg-muted/50 border border-border rounded hover:bg-muted transition-colors truncate">
                      <span className="truncate">{customFilterValues[col] || 'All'}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Search values..." 
                        className="w-full pl-6 pr-2 py-1.5 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                        value={columnFilterSearches[col] || ''}
                        onChange={e => setColumnFilterSearches(prev => ({...prev, [col]: e.target.value}))}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar flex flex-col gap-1">
                      <button 
                        onClick={() => setCustomFilterValues(prev => ({...prev, [col]: 'All'}))}
                        className={`text-left px-2 py-2 shrink-0 text-xs rounded hover:bg-muted transition-colors ${!customFilterValues[col] || customFilterValues[col] === 'All' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}`}
                      >
                        All
                      </button>
                      {options.filter(o => o.toLowerCase().includes((columnFilterSearches[col] || '').toLowerCase())).map(o => (
                        <button 
                          key={o}
                          onClick={() => setCustomFilterValues(prev => ({...prev, [col]: o}))}
                          className={`text-left px-2 py-2 shrink-0 text-xs rounded hover:bg-muted transition-colors truncate ${customFilterValues[col] === o ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border border-dashed border-border hover:bg-muted text-muted-foreground">
                <Plus className="h-3 w-3" /> Add Filter
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Select Column</h4>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search columns..." 
                  className="w-full pl-6 pr-2 py-1 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                  value={customFilterSearch}
                  onChange={e => setCustomFilterSearch(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto pr-1 no-scrollbar flex flex-col gap-1">
                {schema
                  .filter(col => !STANDARD_KEYS.includes(col) && !col.startsWith('_') && !activeCustomFilters.includes(col))
                  .filter(col => col.toLowerCase().includes(customFilterSearch.toLowerCase()))
                  .map(col => (
                    <button
                      key={col}
                      onClick={() => {
                        setActiveCustomFilters(prev => [...prev, col]);
                        setCustomFilterSearch('');
                      }}
                      className="text-left px-2 py-2 text-xs rounded hover:bg-muted transition-colors truncate shrink-0 text-foreground"
                    >
                      {col}
                    </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap items-center gap-2 shrink-0 lg:ml-auto">
    
            <button 
              onClick={() => {
                setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All'); setSearchQuery(''); setCustomFilterValues({}); setActiveCustomFilters([]); setExactCustomerFingerprint(null);
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider underline underline-offset-2 transition-colors"
            >
              Clear Secondary
            </button>
    <div className="flex flex-wrap items-center border-l border-border pl-4 gap-2">
            
            <div className="flex items-center gap-1 mr-2">
              <button onClick={() => scrollTable('left')} className="h-8 px-2 border border-border rounded bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors" title="Scroll Left">
                <span className="text-[14px] leading-none">←</span>
              </button>
              <button onClick={() => scrollTable('right')} className="h-8 px-2 border border-border rounded bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors" title="Scroll Right">
                <span className="text-[14px] leading-none">→</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 mr-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Jump</span>
              <select onChange={(e) => { if(e.target.value) jumpToColumn(e.target.value); e.target.value = ""; }} className="h-8 w-32 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
                <option value="">Select Col...</option>
                {(visibleExtraColumns || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all bg-card border border-border hover:bg-muted text-muted-foreground">
                  <Columns className="h-4 w-4" /> Columns
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search columns..." 
                      className="w-full pl-7 pr-2 py-1.5 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                      value={columnSearch}
                      onChange={e => setColumnSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Extra Columns</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setVisibleExtraColumns(allExtraKeys); localStorage.setItem('dataExplorerExtraColumns', JSON.stringify(allExtraKeys)); }}
                      className="text-[10px] uppercase text-primary font-bold hover:underline"
                    >
                      All
                    </button>
                    <button 
                      onClick={() => { setVisibleExtraColumns([]); localStorage.setItem('dataExplorerExtraColumns', JSON.stringify([])); }}
                      className="text-[10px] uppercase text-muted-foreground hover:underline"
                    >
                      None
                    </button>
                  </div>
                </div>
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-2">
                    {allExtraKeys.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">No extra columns found</div>
                    ) : (
                      allExtraKeys.filter(col => col.toLowerCase().includes(columnSearch.toLowerCase())).map(col => (
                        <div key={col} className="flex items-center gap-2">
                          <Checkbox 
                            id={`col-${col}`} 
                            checked={(visibleExtraColumns || []).includes(col)}
                            onCheckedChange={() => toggleExtraColumn(col)}
                          />
                          <label htmlFor={`col-${col}`} className="text-xs font-medium leading-none cursor-pointer select-none">
                            {col}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Name or Aggr No..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 w-48 rounded bg-muted/50 border border-border pl-8 pr-2 text-xs font-medium outline-none focus:border-primary"
              />
            </div>
          </div>

          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-auto scrollbar-thin max-h-[calc(100vh-380px)] min-h-[400px]" ref={tableContainerRef}>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur shadow-sm">
              <tr className="bg-muted/30 border-b border-border">
                <th className="sticky left-0 top-0 z-30 bg-muted border-r border-border px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Name</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Bucket</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">State</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">City</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Executive</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">POS</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">EMI</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">ECS</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">DAC</th>
                <th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">Status</th>

                {(visibleExtraColumns || []).map(col => (
                  <th key={col} id={`th-${col}`} className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-data text-[11px]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11 + (visibleExtraColumns || []).length} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-xs">No records match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r: any, idx: number) => {
                  const c = calculateRow(r);
                  const isPaid = c.mainPaid === 1;
                  return (
                    <tr key={r.id || idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-card border-r border-border px-2 py-1.5 text-primary font-bold cursor-pointer hover:underline" onClick={() => setSelectedRecord(r)}>{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'}</td>
                                            <td className="px-2 py-1.5 cursor-pointer group" onClick={() => {
                        const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
                        const name = String(rawName).trim().toUpperCase();
                        if (name !== '-' && name !== '') {
                          const address = addressKey ? String(r[addressKey] || '').trim().toUpperCase() : '';
                          const contact = contactKey ? String(r[contactKey] || '').trim().toUpperCase() : '';
                          const fingerprint = `${name}||${contact}||${address}`;
                          
                          const stats = customerStats[fingerprint];
                          if (stats && stats.count > 1) {
                            const matched = baseRecords.filter((rec: any) => {
                              const rRawName = rec.customer_name || rec.CUSTOMERNAME || rec['Customer Name'] || rec.CUSTOMER_NAME || rec.customername || '';
                              const rName = String(rRawName).trim().toUpperCase();
                              const rAddr = addressKey ? String(rec[addressKey] || '').trim().toUpperCase() : '';
                              const rCont = contactKey ? String(rec[contactKey] || '').trim().toUpperCase() : '';
                              return `${rName}||${rCont}||${rAddr}` === fingerprint;
                            });
                            setMultiCaseModal({ name: name, records: matched });
                          } else {
                            setSelectedRecord(r);
                          }
                        }
                      }}>
                        <div className="flex flex-col">
                          <span className="text-primary group-hover:underline font-semibold">
                            {r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-'}
                          </span>
                          {(() => {
                            const rawName = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '';
                            const name = String(rawName).trim().toUpperCase();
                            const address = addressKey ? String(r[addressKey] || '').trim().toUpperCase() : '';
                            const contact = contactKey ? String(r[contactKey] || '').trim().toUpperCase() : '';
                            const fingerprint = `${name}||${contact}||${address}`;
                            
                            const stats = customerStats[fingerprint];
                            if (stats && stats.count > 1) {
                              return (
                                <span className="text-[9px] font-bold text-muted-foreground mt-0.5 bg-muted/50 px-1 py-0.5 rounded w-fit group-hover:bg-primary/10 group-hover:text-primary transition-colors" title="Matched via Name + Address/Contact">
                                  {stats.count} CASES • {fmtCur(stats.totalPos)}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-foreground font-bold">{r.bom_bkt}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{r.state || r.State || '-'}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{r.city || r.City || '-'}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{r.executive_name || r['Executive Name'] || '-'}</td>
                      <td className="px-2 py-1.5 text-right font-bold text-foreground">{fmtCur(Number(r.principal_outstanding) || 0)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{fmtCur(Number(r.emi_amt) || 0)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{fmtCur(Number(r.ecs ?? r.ECS) || 0)}</td>
                      <td className="px-2 py-1.5 text-right text-info font-bold">{fmtCur(Number(r.dac ?? r.DAC) || 0)}</td>
                      <td className="px-2 py-1.5 text-right">
                        {isPaid 
                          ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-success/20 text-success uppercase tracking-wider">Paid</span>
                          : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Unpaid</span>
                        }
                      </td>
                      {(visibleExtraColumns || []).map(col => (
                        <td key={col} className="px-2 py-1.5 text-muted-foreground font-sans text-xs">
                          {r[col] !== undefined && r[col] !== null ? String(r[col]) : '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {(totalPages > 0) && (
          <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">Page {page} of {totalPages}</span>
            <button onClick={handleExport} className="mx-4 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors">
              <Download className="h-3 w-3" /> Export Filtered Data
            </button>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-card border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-card border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={!!selectedRecord} onOpenChange={(o) => !o && setSelectedRecord(null)}>
        <SheetContent className="w-full sm:max-w-md bg-card p-0 border-l border-border flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-border bg-muted/10">
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle className="text-xl font-heading font-bold text-foreground">
                  {selectedRecord?.customer_name || selectedRecord?.CUSTOMERNAME || '-'}
                </SheetTitle>
                <SheetDescription className="font-data font-medium text-primary mt-1">
                  Aggr: {selectedRecord?.agreementid || selectedRecord?.agreement_no || '-'}
                </SheetDescription>
              </div>
              <Badge variant="outline" className="uppercase font-bold tracking-wider">{selectedRecord?.bom_bkt ? `BKT ${selectedRecord.bom_bkt}` : ''}</Badge>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State</p>
                  <p className="font-sans text-sm font-semibold">{selectedRecord?.state || selectedRecord?.State || '-'}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City</p>
                  <p className="font-sans text-sm font-semibold">{selectedRecord?.city || selectedRecord?.City || '-'}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Executive</p>
                  <p className="font-sans text-sm font-semibold">{selectedRecord?.executive_name || selectedRecord?.['Executive Name'] || '-'}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                  <p className="font-sans text-sm font-semibold">
                    {calculateRow(selectedRecord || {}).mainPaid === 1 ? <span className="text-success flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success"></span>Paid</span> : <span className="text-muted-foreground flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>Unpaid</span>}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-px flex-1 bg-border"></span>
                  Financial Summary
                  <span className="h-px flex-1 bg-border"></span>
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">Principal Outstanding (POS)</span>
                    <span className="font-data font-bold text-foreground">{fmtCur(Number(selectedRecord?.principal_outstanding) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">EMI Amount</span>
                    <span className="font-data font-bold">{fmtCur(Number(selectedRecord?.emi_amt) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">Collection (DAC)</span>
                    <span className="font-data font-bold text-info">{fmtCur(Number(selectedRecord?.dac ?? selectedRecord?.DAC) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">ECS</span>
                    <span className="font-data font-bold text-info">{fmtCur(Number(selectedRecord?.ecs ?? selectedRecord?.ECS) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground">Special</span>
                    <span className="font-data font-bold text-info">{fmtCur(Number(selectedRecord?.special ?? selectedRecord?.Special) || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors border-t border-border mt-2 pt-4">
                    <span className="text-muted-foreground font-semibold">Total Cleared</span>
                    <span className="font-data font-bold text-success">
                      {fmtCur(calculateRow(selectedRecord || {}).totalCleared)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

              {selectedRecord && (
                <div className="mt-6">
                  <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="h-px flex-1 bg-border"></span>
                    Additional Information
                    <span className="h-px flex-1 bg-border"></span>
                  </h4>
                  <div className="grid gap-2 text-sm">
                    {Object.keys(selectedRecord)
                      .filter(k => !STANDARD_KEYS.includes(k) && !k.startsWith('_'))
                      .map(k => (
                        <div key={k} className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-sans font-medium text-foreground">{selectedRecord[k] || '-'}</span>
                        </div>
                      ))
                    }
                    {Object.keys(selectedRecord).filter(k => !STANDARD_KEYS.includes(k) && !k.startsWith('_')).length === 0 && (
                      <div className="text-center p-4 text-xs italic text-muted-foreground">No extra data available</div>
                    )}
                  </div>
                </div>
              )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {multiCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-7xl max-h-[90vh] rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <h2 className="text-xl font-heading font-bold text-foreground">{multiCaseModal.name || 'Multiple Cases'}</h2>
                <p className="font-sans font-medium text-sm text-muted-foreground">{multiCaseModal.records.length} Related Cases Found</p>
              </div>
              <button onClick={() => setMultiCaseModal(null)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-card">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur shadow-sm">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggr No</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Bucket</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">State</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">City</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Executive</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">POS</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">EMI</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">ECS</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">DAC</th>
                    <th className="px-4 py-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="font-data text-[12px]">
                  {multiCaseModal.records.map((r, idx) => {
                    const c = calculateRow(r);
                    const isPaid = c.mainPaid === 1;
                    return (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-primary font-bold cursor-pointer hover:underline" onClick={() => { setMultiCaseModal(null); setSelectedRecord(r); }}>
                          {r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold">{r.bom_bkt}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.state || r.State || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.city || r.City || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.executive_name || r['Executive Name'] || '-'}</td>
                        <td className="px-4 py-3 text-right font-bold">{fmtCur(Number(r.principal_outstanding) || 0)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmtCur(Number(r.emi_amt) || 0)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmtCur(Number(r.ecs ?? r.ECS) || 0)}</td>
                        <td className="px-4 py-3 text-right text-info font-bold">{fmtCur(Number(r.dac ?? r.DAC) || 0)}</td>
                        <td className="px-4 py-3 text-right">
                          {isPaid 
                            ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-success/20 text-success uppercase tracking-wider">Paid</span>
                            : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Unpaid</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
