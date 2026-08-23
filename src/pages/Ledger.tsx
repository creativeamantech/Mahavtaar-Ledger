import {
  useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { AppLayout } from '../components/layout/AppLayout';
import { calculateRow } from '../lib/calculations';
import { fmtCur } from '../lib/formatters';
import { FileText, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function Ledger() {
  const { records, isLoading, globalBucket } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    
    let result = records;
    if (globalBucket !== 'ALL') {
        result = result.filter((r: any) => String(r.bom_bkt).trim().toUpperCase() === globalBucket);
    }
    
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter((r: any) => {
            const id = String(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '').toLowerCase();
            const name = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '').toLowerCase();
            return id.includes(q) || name.includes(q);
        });
    }
    
    // Sort by POS descending
    return result.sort((a: any, b: any) => {
        const posA = Number(a.principal_outstanding) || 0;
        const posB = Number(b.principal_outstanding) || 0;
        return posB - posA;
    });
  }, [records, globalBucket, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center text-muted-foreground animate-pulse">
          Loading ledger data...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-extrabold uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Case Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Detailed breakdown of EMI and Principal Outstanding per agreement</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Agreement ID or Name..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase sticky top-0 z-10 shadow-sm bg-muted text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold border-b border-border">Agreement ID</th>
                <th className="px-6 py-4 font-semibold border-b border-border">Customer Name</th>
                <th className="px-6 py-4 font-semibold text-right border-b border-border">EMI Amount</th>
                <th className="px-6 py-4 font-semibold text-right border-b border-border">Principal Outstanding (POS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No records found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-primary">
                        {r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'}
                    </td>
                    <td className="px-6 py-3 font-medium">
                        {r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-'}
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                        {fmtCur(Number(r.emi_amt) || 0)}
                    </td>
                    <td className="px-6 py-3 text-right font-bold">
                        {fmtCur(Number(r.principal_outstanding) || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{((page - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * itemsPerPage, filteredRecords.length)}</span> of <span className="font-medium text-foreground">{filteredRecords.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-background border border-border rounded text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                Previous
              </button>
              <span className="text-sm px-2 text-muted-foreground">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-background border border-border rounded text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}