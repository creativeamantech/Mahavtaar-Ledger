import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoanRecord, CustomerFeedback } from '../../lib/db';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { IndianRupee as Rupee } from 'lucide-react';

interface AgentLiveDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    customers: LoanRecord[];
    feedbacks: CustomerFeedback[];
}

export function AgentLiveDetailsSheet({ open, onOpenChange, title, customers, feedbacks }: AgentLiveDetailsSheetProps) {
  
  const getLatestFeedback = (agreementId: string) => {
      const customerFeedbacks = feedbacks.filter(f => f.agreementid === agreementId);
      if (customerFeedbacks.length === 0) return null;
      return customerFeedbacks.sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime())[0];
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {customers.length} customer(s) found.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
            <div className="space-y-4">
                {customers.map((customer, index) => {
                    const latestFeedback = getLatestFeedback(customer.agreementid);
                    const name = customer.customer_name || customer['Customer Name'] || 'Unknown';
                    const pos = Number(customer.principal_outstanding || 0);
                    const emi = Number(customer.emi_amt || customer.EMI || 0);
                    const dac = Number(customer.dac || customer.DAC || 0);

                    return (
                        <Link 
                            key={`${customer.agreementid}-${index}`} 
                            to={`/customer/${customer.agreementid}`}
                            className="block p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-semibold">{name}</h4>
                                    <p className="text-xs text-muted-foreground">{customer.agreementid}</p>
                                </div>
                                {latestFeedback && (
                                     <Badge variant="secondary">{latestFeedback.status}</Badge>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                <div>
                                    <span className="text-muted-foreground text-xs">POS</span>
                                    <div className="flex items-center font-medium">
                                        <Rupee className="h-3 w-3 mr-1" />
                                        {pos.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs">EMI</span>
                                    <div className="flex items-center font-medium">
                                        <Rupee className="h-3 w-3 mr-1" />
                                        {emi.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                {dac > 0 && (
                                    <div className="col-span-2 mt-1 pt-1 border-t">
                                        <span className="text-muted-foreground text-xs">Collected (DAC)</span>
                                        <div className="flex items-center font-bold text-primary">
                                            <Rupee className="h-3 w-3 mr-1" />
                                            {dac.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {latestFeedback && (
                                <div className="mt-3 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                    <span className="font-medium">Last note: </span>
                                    <span className="italic line-clamp-1">{latestFeedback.remarks || 'No remarks'}</span>
                                    <div className="mt-1 text-[10px]">
                                        {formatDistanceToNow(parseISO(latestFeedback.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            )}
                        </Link>
                    )
                })}
                
                {customers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No customers found for this category.
                    </div>
                )}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
