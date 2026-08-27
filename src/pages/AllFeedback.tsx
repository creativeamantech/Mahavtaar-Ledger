import React, { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataTable } from '../components/ui/DataTable';
import { db, CustomerFeedback } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Download, Eye, CalendarIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export default function AllFeedback() {
  const feedbacks = useLiveQuery(
    () => db.customer_feedbacks.orderBy('createdAt').reverse().toArray(),
    [],
    [] as CustomerFeedback[]
  );
  const isLoading = feedbacks === undefined;
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Dialog State
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      // Status Filter
      if (statusFilter !== "ALL" && f.status !== statusFilter) return false;
      
      // Date Range Filter
      if (dateRange?.from) {
        const feedbackDate = parseISO(f.createdAt);
        if (dateRange.to) {
          if (!isWithinInterval(feedbackDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })) {
            return false;
          }
        } else {
            if (!isWithinInterval(feedbackDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.from) })) {
                return false;
            }
        }
      }
      return true;
    });
  }, [feedbacks, statusFilter, dateRange]);

  const handleExportCSV = () => {
    if (filteredFeedbacks.length === 0) return;
    const csv = Papa.unparse(filteredFeedbacks.map(f => ({
      'Date': format(parseISO(f.createdAt), "yyyy-MM-dd HH:mm"),
      'Agent': f.agentName,
      'Agreement ID': f.agreementid,
      'Status': f.status,
      'Contact Number': f.contactNumber || 'N/A',
      'Availability': f.availability || 'N/A',
      'Feedback': f.detailedFeedback || f.overallDetailedFeedback || 'N/A',
      'Amount Paid': f.amountPaid || '',
      'Mode of Payment': f.modeOfPayment || '',
      'PTP Date': f.ptpDate || '',
      'PTP Amount': f.ptpAmount || ''
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `feedback_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo(() => [
    { key: 'createdAt', label: 'Date', render: (val: string) => format(parseISO(val), "PPP p") },
    { key: 'agentName', label: 'Agent' },
    { key: 'agreementid', label: 'Agreement ID' },
    { key: 'status', label: 'Status' },
    { key: 'contactNumber', label: 'Contact Number' },
    { key: 'actions', label: 'Actions', render: (_: any, row: CustomerFeedback) => (
      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedFeedback(row); }}>
          <Eye className="h-4 w-4" />
      </Button>
    ) },
  ], []);

  return (
    <AppLayout title="Feedback Log">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight mb-2">All Feedback</h1>
            <p className="text-muted-foreground">View and export all agent feedback records.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="PTP">PTP</SelectItem>
                    <SelectItem value="RTP">RTP</SelectItem>
                    <SelectItem value="Call Back">Call Back</SelectItem>
                    <SelectItem value="Not Reachable">Not Reachable</SelectItem>
                    <SelectItem value="Wrong Number">Wrong Number</SelectItem>
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Filter by Date Range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <DataTable columns={columns} data={filteredFeedbacks} pageSize={50} />
          )}
        </div>
      </div>

      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Feedback Details</DialogTitle>
                <DialogDescription>Full record details for {selectedFeedback?.agreementid}</DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
                <div className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Agent:</div>
                        <div className="font-medium">{selectedFeedback.agentName}</div>
                        
                        <div className="text-muted-foreground">Date:</div>
                        <div className="font-medium">{format(parseISO(selectedFeedback.createdAt), "PPP p")}</div>
                        
                        <div className="text-muted-foreground">Status:</div>
                        <div className="font-medium">{selectedFeedback.status}</div>
                        
                        {selectedFeedback.contactNumber && (
                             <>
                                <div className="text-muted-foreground">Contact:</div>
                                <div className="font-medium">{selectedFeedback.contactNumber}</div>
                             </>
                        )}
                        
                        {selectedFeedback.amountPaid && (
                             <>
                                <div className="text-muted-foreground">Amount Paid:</div>
                                <div className="font-medium text-green-600">₹{selectedFeedback.amountPaid}</div>
                             </>
                        )}
                        
                        {selectedFeedback.ptpDate && (
                             <>
                                <div className="text-muted-foreground">PTP Date:</div>
                                <div className="font-medium">{selectedFeedback.ptpDate}</div>
                             </>
                        )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                        <div className="text-muted-foreground text-sm mb-1">Feedback/Remarks:</div>
                        <p className="text-sm bg-muted p-3 rounded-md">
                            {selectedFeedback.detailedFeedback || selectedFeedback.overallDetailedFeedback || 'No remarks provided.'}
                        </p>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
