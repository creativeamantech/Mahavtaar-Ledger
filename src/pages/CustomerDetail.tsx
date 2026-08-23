import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpDown,
  Filter, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { db, CustomerFeedback } from '../lib/db';
import { fmtCur } from '../lib/formatters';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, PhoneCall, Phone, MessageCircle, 
  MapPin, Calendar, Briefcase, CreditCard, Activity, Search,
  CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, Database
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STANDARD_STATUSES = [
  "Paid", "PTP", "CB", "RTP", "RNR", "Non Contactable", 
  "Already settled", "Disputed Case", "Loan Closed", "Agent dispute", "Talked with third party"
];

const PAID_SUB_STATUSES = ["DAC", "ECS", "Special", "CASA", "Settlement"];
const NON_CONTACTABLE_REASONS = [
  "Switch off", "Not connected", "Incoming not available", 
  "Not in service", "Not exist", "Wrong number"
];

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { records } = useData();
  const { user } = useAuth();
  
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [otherPropsSearch, setOtherPropsSearch] = useState('');
  
  // Feedback Form State
  const [contactNumber, setContactNumber] = useState('');
  const [availability, setAvailability] = useState('');
  const [status, setStatus] = useState('');
  const [paidSubStatus, setPaidSubStatus] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [nonContactableSubStatus, setNonContactableSubStatus] = useState('');
  const [ptpDate, setPtpDate] = useState('');
  const [cbDate, setCbDate] = useState('');
  const [detailedFeedback, setDetailedFeedback] = useState('');
  const [concernNumber, setConcernNumber] = useState('');
  const [relationName, setRelationName] = useState('');
  const [overallDetailedFeedback, setOverallDetailedFeedback] = useState('');

  const record = useMemo(() => records.find(r => r.agreementid === id), [records, id]);

  const { prevId, nextId, currentIndex, totalList } = useMemo(() => {
    try {
      const listStr = sessionStorage.getItem('currentCaseList');
      if (listStr) {
        const list = JSON.parse(listStr) as string[];
        const idx = list.indexOf(id || '');
        return {
          prevId: idx > 0 ? list[idx - 1] : null,
          nextId: idx < list.length - 1 ? list[idx + 1] : null,
          currentIndex: idx,
          totalList: list.length
        };
      }
    } catch(e) { /* ignore */ }
    return { prevId: null, nextId: null, currentIndex: -1, totalList: 0 };
  }, [id]);

  useEffect(() => {
    if (id) {
      db.customer_feedbacks.where('agreementid').equals(id).reverse().sortBy('createdAt')
        .then(data => setFeedbacks(data))
        .catch(console.error);
    }
  }, [id]);

  
  
  
  const phones = useMemo(() => {
    if (!record) return [];
    const extracted: { number: string, source: string, name?: string }[] = [];
    
    const customerName = record.customer_name || record.CUSTOMERNAME || record['Customer Name'] || record.CUSTOMER_NAME || record.customername || 'Customer';

    Object.entries(record).forEach(([key, val]) => {
      const kLow = key.toLowerCase();
      // Skip CRN, Agreement, Loan IDs as they are often 10-12 digits but not phone numbers
      if (kLow.includes('crn') || kLow.includes('agreement') || kLow.includes('loan') || kLow.includes('pos')) return;

      const sVal = String(val).replace(/[^0-9]/g, '');
      if (sVal.length >= 10 && sVal.length <= 12) {
        
        let assocName = customerName;
        
        // If it's a reference or guarantor, try to find their specific name
        if (kLow.includes('ref') || kLow.includes('guar') || kLow.includes('relat')) {
          assocName = 'Reference';
          
          let num = '';
          const digitMatch = kLow.match(/\d+/);
          if (digitMatch) num = digitMatch[0];
          else if (kLow.includes('one')) num = 'one';
          else if (kLow.includes('two')) num = 'two';
          else if (kLow.includes('three')) num = 'three';
          else if (kLow.includes('first')) num = 'first';
          else if (kLow.includes('second')) num = 'second';
          
          const nameKey = Object.keys(record).find(k => {
            const kl = k.toLowerCase();
            if (kl === kLow) return false;
            return kl.includes('name') && 
                   (kl.includes('ref') || kl.includes('guar') || kl.includes('relat')) && 
                   (num ? kl.includes(num) : true);
          });
          
          if (nameKey && record[nameKey]) {
            assocName = String(record[nameKey]);
          } else {
            // Fallback: looking for a field without 'no'/'number'/'phone'
            const fallbackKey = Object.keys(record).find(k => {
              const kl = k.toLowerCase();
              if (kl === kLow) return false;
              const hasRef = kl.includes('ref') || kl.includes('guar') || kl.includes('relat');
              const hasNum = num ? kl.includes(num) : true;
              const isNotNumberField = !kl.includes('no') && !kl.includes('num') && !kl.includes('phone') && !kl.includes('mob');
              return hasRef && hasNum && isNotNumberField;
            });
            if (fallbackKey && record[fallbackKey]) {
              assocName = String(record[fallbackKey]);
            }
          }
        }

        if (!extracted.some(e => e.number === sVal)) {
          extracted.push({ number: sVal, source: key, name: assocName });
        }
      }
    });
    return extracted;
  }, [record]);



  if (!record) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Customer Not Found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">Go Back</button>
        </div>
      </AppLayout>
    );
  }


  // Group properties
  const financialKeys = ['principal_outstanding', 'emi_amt', 'dac', 'ecs', 'Approx Forclosure', 'approx_forclosure', 'penal_pending', 'bcc_pending', 'New Total', 'new_total', 'Special', 'special', 'SPECIAL'];
  const assetKeys = ['ASSET_CATEGORY', 'Make', 'Model', 'Chassis Number', 'Engine Number', 'Manufacturer'];
  const personalKeys = ['customer_name', 'Customer Name', 'CUSTOMERNAME', 'Father Name', 'DOB', 'Age', 'Employer', 'Designation', 'state', 'city', 'Address', 'Pincode', 'reference1_Name', 'reference2_name', 'Supplier', 'Fos Name', 'FOS Name', 'Mailing Address', 'Mailing Landmark', 'SO Name', 'SO Code', 'RO Name', 'RO Code'];
  const opsKeys = ['executive_name', 'Executive Name', 'bom_bkt', 'Allocation Date'];

  const otherProps = Object.entries(record).filter(([k, v]) => 
    !financialKeys.some(fk => k.toLowerCase().includes(fk.toLowerCase())) &&
    !assetKeys.some(ak => k.toLowerCase().includes(ak.toLowerCase())) &&
    !personalKeys.some(pk => k.toLowerCase().includes(pk.toLowerCase())) &&
    !opsKeys.some(ok => k.toLowerCase().includes(ok.toLowerCase())) &&
    k !== 'agreementid' && k !== 'agreement_no' && !k.toLowerCase().includes('crn')
  );

  const getStatusColor = (s: string) => {
    if (s === 'Paid' || s === 'Already settled' || s === 'Loan Closed') return 'bg-success/20 text-success';
    if (s === 'PTP' || s === 'CB') return 'bg-warning/20 text-warning';
    if (s === 'Non Contactable' || s === 'RTP' || s === 'RNR') return 'bg-destructive/20 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  const handleLogFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactNumber || !availability || !status) {
      toast.error('Please fill required fields (Number, Availability, Status)');
      return;
    }

    const feedback: CustomerFeedback = {
      id: crypto.randomUUID(),
      agreementid: record.agreementid,
      contactNumber,
      availability,
      status,
      paidSubStatus: status === 'Paid' ? paidSubStatus : undefined,
      amountPaid: status === 'Paid' && paidSubStatus === 'DAC' ? Number(amountPaid) : undefined,
      paymentMode: status === 'Paid' && paidSubStatus === 'DAC' ? paymentMode : undefined,
      approvedAmount: status === 'Paid' && paidSubStatus === 'Settlement' ? Number(approvedAmount) : undefined,
      nonContactableSubStatus: status === 'Non Contactable' ? nonContactableSubStatus : undefined,
      ptpDate: status === 'PTP' ? ptpDate : undefined,
      cbDate: status === 'CB' ? cbDate : undefined,
      detailedFeedback: ['RTP', 'Talked with third party', 'Agent dispute'].includes(status) ? detailedFeedback : undefined,
      concernNumber: availability === 'Yes' ? concernNumber : undefined,
      relationName: availability === 'Third Party' ? relationName : undefined,
      overallDetailedFeedback,
      agentId: user?.id || 'unknown',
      agentName: user?.name || 'Unknown Agent',
      createdAt: new Date().toISOString()
    };

    try {
      await db.customer_feedbacks.put(feedback);
      setFeedbacks([feedback, ...feedbacks]);
      toast.success('Feedback logged successfully');
      
      // Reset form (keep number selected for convenience)
      setAvailability('');
      setStatus('');
      setPaidSubStatus('');
      setAmountPaid('');
      setPaymentMode('');
      setApprovedAmount('');
      setNonContactableSubStatus('');
      setPtpDate('');
      setCbDate('');
      setDetailedFeedback('');
      setConcernNumber('');
      setRelationName('');
      setOverallDetailedFeedback('');
    } catch (error) {
      console.error("Failed to log feedback", error);
      toast.error('Failed to log feedback');
    }
  };

  const handleExportHistory = () => {
    try {
      if (feedbacks.length === 0) {
        toast.info("No feedback history to export.");
        return;
      }
      const headers = ['Date', 'Agent', 'Contact Number', 'Availability', 'Status', 'Sub Status', 'Amount', 'Date/Time', 'Notes'];
      const csv = [
        headers.join(','),
        ...feedbacks.map(f => [
          format(new Date(f.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          `"${f.agentName}"`,
          f.contactNumber,
          f.availability,
          f.status,
          f.paidSubStatus || f.nonContactableSubStatus || '',
          f.amountPaid || f.approvedAmount || '',
          f.ptpDate || f.cbDate || '',
          `"${(f.detailedFeedback || '')} ${(f.overallDetailedFeedback || '')}"`.trim()
        ].join(','))
      ].join('\n');
      
      const a = document.createElement('a'); 
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); 
      a.download = `Feedback_History_${record.agreementid}.csv`; 
      a.click();
    } catch(err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  const currentFeedbackStatus = feedbacks[0]?.status || 'No Action Yet';

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(`/explorer?${searchParams.toString()}`)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </button>
          
          <div className="flex items-center gap-4">
            {currentIndex >= 0 && (
              <span className="text-xs text-muted-foreground">
                Case {currentIndex + 1} of {totalList}
              </span>
            )}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => prevId && navigate(`/customer/${prevId}?${searchParams.toString()}`)}
                disabled={!prevId}
                className="p-2 border border-border rounded bg-card hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => nextId && navigate(`/customer/${nextId}?${searchParams.toString()}`)}
                disabled={!nextId}
                className="p-2 border border-border rounded bg-card hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Identity Banner */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {record.customer_name || record.CUSTOMERNAME || record['Customer Name'] || 'Unknown Customer'}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="font-mono font-medium">{record.agreementid || record.agreement_no || record.AGREEMENTNO}</span>
              <span className="h-4 w-px bg-border"></span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {record.city || record.City || 'Unknown City'}</span>
              <span className="h-4 w-px bg-border"></span>
              <Badge variant="outline" className="font-bold">Bucket {record.bom_bkt || '?'}</Badge>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Current Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(currentFeedbackStatus)}`}>
              {currentFeedbackStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Info & Phones */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Phone Directory */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Directory</h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phones.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full">No valid phone numbers found.</p>
                ) : (
                  phones.map((p, i) => (
                    <div key={i} className="flex flex-col border border-border rounded-lg p-3 bg-muted/5 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-lg leading-none mb-1">{p.number}</span>
                          {p.name && (
                            <span className="text-[11px] font-bold text-primary/80 uppercase tracking-wider line-clamp-1" title={p.name}>
                              {p.name}
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px] capitalize max-w-[100px] text-center ml-2">{p.source.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <a href={`tel:${p.number}`} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-2 py-1.5 rounded hover:bg-primary/90 transition-colors">
                          <PhoneCall className="h-3 w-3" /> Call
                        </a>
                        <a href={`whatsapp://send?phone=91${p.number}&text=Hello`} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-[#25D366] text-white px-2 py-1.5 rounded hover:bg-[#25D366]/90 transition-colors">
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </a>
                        <button onClick={() => setContactNumber(p.number)} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-muted text-muted-foreground px-2 py-1.5 rounded hover:bg-muted/80 transition-colors">
                          Log Form
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Grid Cards for Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Financials */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4" /> Financial Overview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">POS</span><span className="font-bold">{fmtCur(record.principal_outstanding || 0)}</span></div>
                  {record.bcc_pending && <div className="flex justify-between"><span className="text-muted-foreground">BCC Pending</span><span className="font-medium">{fmtCur(record.bcc_pending)}</span></div>}
                  {record.penal_pending && <div className="flex justify-between"><span className="text-muted-foreground">Penal Pending</span><span className="font-medium">{fmtCur(record.penal_pending)}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">EMI</span><span className="font-medium">{fmtCur(record.emi_amt || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">DAC</span><span className="font-medium text-info">{fmtCur(record.dac || record.DAC || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">ECS</span><span className="font-medium">{fmtCur(record.ecs || record.ECS || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Special</span><span className="font-medium">{fmtCur(record.special || record.Special || record.SPECIAL || 0)}</span></div>
                  {record.approx_forclosure && <div className="flex justify-between"><span className="text-muted-foreground">Foreclosure</span><span className="font-medium">{fmtCur(record.approx_forclosure)}</span></div>}
                </div>
              </div>

              {/* Personal / Location */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> Personal & Location</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">State</span><span className="font-medium">{record.state || record.State || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">City</span><span className="font-medium">{record.city || record.City || '-'}</span></div>
                  {(record.Supplier || record.supplier) && <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span className="font-medium">{record.Supplier || record.supplier}</span></div>}
                  {(record['Fos Name'] || record['FOS Name'] || record.fos_name) && <div className="flex justify-between"><span className="text-muted-foreground">FOS Name</span><span className="font-medium">{record['Fos Name'] || record['FOS Name'] || record.fos_name}</span></div>}
                  {(record['SO Name'] || record.so_name) && <div className="flex justify-between"><span className="text-muted-foreground">SO Name</span><span className="font-medium">{record['SO Name'] || record.so_name}</span></div>}
                  {(record['SO Code'] || record.so_code) && <div className="flex justify-between"><span className="text-muted-foreground">SO Code</span><span className="font-medium">{record['SO Code'] || record.so_code}</span></div>}
                  {(record['RO Name'] || record.ro_name) && <div className="flex justify-between"><span className="text-muted-foreground">RO Name</span><span className="font-medium">{record['RO Name'] || record.ro_name}</span></div>}
                  {(record['RO Code'] || record.ro_code) && <div className="flex justify-between"><span className="text-muted-foreground">RO Code</span><span className="font-medium">{record['RO Code'] || record.ro_code}</span></div>}
                  {(record['Mailing Address'] || record.mailing_address) && <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground whitespace-nowrap">Mailing Address</span><span className="font-medium text-right text-xs mt-0.5 line-clamp-2" title={record['Mailing Address'] || record.mailing_address}>{record['Mailing Address'] || record.mailing_address}</span></div>}
                  {(record['Mailing Landmark'] || record.mailing_landmark) && <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground whitespace-nowrap">Landmark</span><span className="font-medium text-right text-xs mt-0.5 line-clamp-2" title={record['Mailing Landmark'] || record.mailing_landmark}>{record['Mailing Landmark'] || record.mailing_landmark}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Executive</span><span className="font-medium">{record.executive_name || record['Executive Name'] || '-'}</span></div>
                </div>
              </div>

            </div>

            {/* Dynamic Attributes */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2"><Database className="h-4 w-4" /> Full Record Data</h3>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search attributes..." 
                    className="h-8 pl-7 pr-3 rounded-md border border-border bg-card text-xs focus:outline-none focus:border-primary"
                    value={otherPropsSearch}
                    onChange={(e) => setOtherPropsSearch(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="h-64">
                <div className="p-0">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-border">
                      {otherProps
                        .filter(([k,v]) => k.toLowerCase().includes(otherPropsSearch.toLowerCase()) || String(v).toLowerCase().includes(otherPropsSearch.toLowerCase()))
                        .map(([k, v]) => (
                        <tr key={k} className="hover:bg-muted/30">
                          <td className="px-4 py-2 font-medium text-muted-foreground w-1/3">{k}</td>
                          <td className="px-4 py-2 font-data">{v !== null && v !== undefined ? String(v) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>

          </div>

          {/* RIGHT COLUMN: Feedback Form & History */}
          <div className="space-y-6">
            
            {/* Feedback Form */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-primary/10">
                <h3 className="font-bold text-primary flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Log Interaction</h3>
              </div>
              <form onSubmit={handleLogFeedback} className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Contact Number *</label>
                  <select 
                    value={contactNumber} 
                    onChange={e => setContactNumber(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select number...</option>
                    {phones.map(p => <option key={p.number} value={p.number}>{p.number} ({p.source})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Availability *</label>
                  <div className="flex gap-2">
                    {['Yes', 'No', 'Third Party'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAvailability(opt)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${availability === opt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {availability === 'Yes' && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Concern Number</label>
                    <input type="text" value={concernNumber} onChange={e => setConcernNumber(e.target.value)} className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary" />
                  </div>
                )}
                {availability === 'Third Party' && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Relation Name *</label>
                    <input type="text" value={relationName} onChange={e => setRelationName(e.target.value)} required className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Status *</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select status...</option>
                    {STANDARD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Conditional Fields */}
                {status === 'Paid' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Payment Type *</label>
                      <select value={paidSubStatus} onChange={e=>setPaidSubStatus(e.target.value)} required className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary">
                        <option value="">Select...</option>
                        {PAID_SUB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {paidSubStatus === 'DAC' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Amount *</label>
                          <input type="number" value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} required className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Mode *</label>
                          <select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} required className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary">
                            <option value="">Select...</option>
                            <option value="UPI">UPI</option><option value="Net Banking">Net Banking</option><option value="Cash">Cash</option><option value="Cheque">Cheque</option>
                          </select>
                        </div>
                      </div>
                    )}
                    {paidSubStatus === 'Settlement' && (
                       <div>
                       <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Approved Amount *</label>
                       <input type="number" value={approvedAmount} onChange={e=>setApprovedAmount(e.target.value)} required className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary" />
                     </div>
                    )}
                  </>
                )}

                {status === 'Non Contactable' && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Reason *</label>
                    <select value={nonContactableSubStatus} onChange={e=>setNonContactableSubStatus(e.target.value)} required className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary">
                      <option value="">Select...</option>
                      {NON_CONTACTABLE_REASONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {status === 'PTP' && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">PTP Date/Time *</label>
                    <input type="datetime-local" value={ptpDate} onChange={e=>setPtpDate(e.target.value)} required className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary" />
                  </div>
                )}

                {status === 'CB' && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Call Back Date/Time *</label>
                    <input type="datetime-local" value={cbDate} onChange={e=>setCbDate(e.target.value)} required className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary" />
                  </div>
                )}

                {['RTP', 'Talked with third party', 'Agent dispute'].includes(status) && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Detailed Feedback *</label>
                    <textarea value={detailedFeedback} onChange={e=>setDetailedFeedback(e.target.value)} required rows={2} className="w-full rounded-md border border-border bg-card p-2 text-sm focus:outline-none focus:border-primary resize-none"></textarea>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Overall Notes (Optional)</label>
                  <textarea value={overallDetailedFeedback} onChange={e=>setOverallDetailedFeedback(e.target.value)} rows={2} className="w-full rounded-md border border-border bg-card p-2 text-sm focus:outline-none focus:border-primary resize-none"></textarea>
                </div>

                <button type="submit" className="w-full h-10 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Save Feedback
                </button>
              </form>
            </div>

            {/* Feedback History */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[500px]">
              <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4" /> Audit Stream</h3>
                <button onClick={handleExportHistory} className="text-[10px] uppercase font-bold text-primary hover:underline">Export</button>
              </div>
              <ScrollArea className="flex-1 p-4">
                {feedbacks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No feedback history yet.</p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map(f => (
                      <div key={f.id} className="relative pl-4 border-l-2 border-primary/20 pb-4 last:pb-0">
                        <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-1"></div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-foreground">{f.status}</span>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(f.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div><span className="font-medium text-foreground">Agent:</span> {f.agentName}</div>
                          <div><span className="font-medium text-foreground">Number:</span> {f.contactNumber}</div>
                          <div><span className="font-medium text-foreground">Avail:</span> {f.availability}</div>
                          
                          {f.paidSubStatus && <div><span className="font-medium text-foreground">Sub-status:</span> {f.paidSubStatus}</div>}
                          {f.amountPaid && <div><span className="font-medium text-foreground">Amount:</span> {fmtCur(f.amountPaid)}</div>}
                          {f.ptpDate && <div><span className="font-medium text-foreground">PTP Date:</span> {format(new Date(f.ptpDate), 'PP p')}</div>}
                          {(f.detailedFeedback || f.overallDetailedFeedback) && (
                            <div className="p-2 mt-2 bg-muted/30 rounded italic border border-border/50">
                              "{f.detailedFeedback} {f.overallDetailedFeedback}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}
