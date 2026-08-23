import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { db, CustomerFeedback, LoanRecord } from '../lib/db';
import { format, isToday, parseISO, formatDistanceToNow, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Phone, MessageSquare, UserCheck, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from 'react-router-dom';
import { LiveDetailsSheet } from '@/components/dashboard/LiveDetailsSheet';

const Rupee = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M8 7h5c1.42 0 2.7.75 3.44 1.83A4.012 4.012 0 0 1 18 12.5a4.012 4.012 0 0 1-1.56 3.17A4.02 4.02 0 0 1 13 17h-2v2.5a.5.5 0 0 1-1 0V17H8v2.5a.5.5 0 0 1-1 0V17H5.5a.5.5 0 0 1 0-1H7v-4H5.5a.5.5 0 0 1 0-1H7V8H5.5a.5.5 0 0 1 0-1H7V4.5a.5.5 0 0 1 1 0V6h5c.89 0 1.7-.45 2.22-1.16A3.01 3.01 0 0 0 13 4.5a3.01 3.01 0 0 0-2.22-1.16A3.038 3.038 0 0 0 8 2.5a.5.5 0 0 1-1 0c0-.85.34-1.67.94-2.26C8.54.64 9.35.3 10.2.3c1.78 0 3.39 1.04 4.16 2.61c.32.65.48 1.34.48 2.09c0 .75-.16 1.44-.48 2.09c-.77 1.57-2.38 2.61-4.16 2.61H8zm5 5H8v4h5c.89 0 1.7-.45 2.22-1.16A3.01 3.01 0 0 0 17 12.5a3.01 3.01 0 0 0-1.78-2.84A3.038 3.038 0 0 0 13 8.5a3.01 3.01 0 0 0-2.22-1.16A3.038 3.038 0 0 0 8 6.5a.5.5 0 0 1-1 0c0-.85.34-1.67.94-2.26C8.54.64 9.35.3 10.2.3c1.78 0 3.39 1.04 4.16 2.61c.32.65.48 1.34.48 2.09c0 .75-.16 1.44-.48 2.09A3.99 3.99 0 0 1 13 12h-1z"/></svg>
)

export default function LiveMonitoring() {
  const { records } = useData();
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [sheetData, setSheetData] = useState<{title: string, customers: LoanRecord[]}>({title: '', customers: []});
  const [isSheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    db.customer_feedbacks.toArray().then(setFeedbacks);
  }, []);

  const filteredFeedbacks = useMemo(() => {
    if (dateFilter === 'today') {
      return feedbacks.filter(f => isToday(parseISO(f.createdAt)));
    }
    return feedbacks;
  }, [feedbacks, dateFilter]);

  const uniquePtpCustomers = useMemo(() => {
    const ptpFeedbacks = filteredFeedbacks.filter(f => f.status === 'PTP');
    const ptpAgreementIds = [...new Set(ptpFeedbacks.map(f => f.agreementid))];
    return ptpAgreementIds.map(id => records.find(c => c.agreementid === id)).filter(Boolean) as LoanRecord[];
  }, [filteredFeedbacks, records]);

  const uniquePtpAmount = uniquePtpCustomers.reduce((sum, c) => sum + (Number(c.emi_amt || c.EMI) || 0), 0);

  const uniquePaidCustomers = useMemo(() => {
    const paidFeedbacks = filteredFeedbacks.filter(f => f.status === 'Paid');
    const paidAgreementIds = [...new Set(paidFeedbacks.map(f => f.agreementid))];
    return paidAgreementIds.map(id => records.find(c => c.agreementid === id)).filter(Boolean) as LoanRecord[];
  }, [filteredFeedbacks, records]);

  const uniqueFeedbackCustomers = useMemo(() => {
    const fbAgreementIds = [...new Set(filteredFeedbacks.map(f => f.agreementid))];
    return fbAgreementIds.map(id => records.find(c => c.agreementid === id)).filter(Boolean) as LoanRecord[];
  }, [filteredFeedbacks, records]);

  const totalCollected = useMemo(() => {
    const paidFeedbacks = filteredFeedbacks.filter(f => f.status === 'Paid');
    return paidFeedbacks.reduce((sum, f) => sum + (Number(f.amountPaid) || 0), 0);
  }, [filteredFeedbacks]);

  const agentPerformance = useMemo(() => {
    const agentsMap: Record<string, any> = {};
    filteredFeedbacks.forEach(f => {
      if (!agentsMap[f.agentName]) {
        agentsMap[f.agentName] = { name: f.agentName, feedbackCount: 0, ptpCount: 0, collectedAmount: 0 };
      }
      agentsMap[f.agentName].feedbackCount++;
      if (f.status === 'PTP') agentsMap[f.agentName].ptpCount++;
      if (f.status === 'Paid') agentsMap[f.agentName].collectedAmount += (Number(f.amountPaid) || 0);
    });
    return Object.values(agentsMap).sort((a, b) => b.feedbackCount - a.feedbackCount);
  }, [filteredFeedbacks]);

  const feedbackStatusData = useMemo(() => {
    const counts = filteredFeedbacks.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const colors = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#9333ea', '#0891b2', '#be123c'];
    return Object.entries(counts).map(([name, value], i) => ({
      name, value, fill: colors[i % colors.length]
    }));
  }, [filteredFeedbacks]);

  const recentActivities = [...filteredFeedbacks]
    .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime())
    .slice(0, 15);

  const handleCardClick = (title: string, customers: LoanRecord[]) => {
    setSheetData({ title, customers });
    setSheetOpen(true);
  };

  return (
    <AppLayout title="Live Monitoring">
      <div className="space-y-6">
        <LiveDetailsSheet 
            open={isSheetOpen}
            onOpenChange={setSheetOpen}
            title={sheetData.title}
            customers={sheetData.customers}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight mb-2">Live Monitoring</h1>
            <p className="text-muted-foreground">Real-time overview of feedback and agent productivity.</p>
          </div>
          <select 
            className="h-10 px-3 rounded-md border border-input bg-background"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'today'|'all')}
          >
            <option value="today">Today</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleCardClick("Customers with Feedback", uniqueFeedbackCustomers)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback Submitted</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredFeedbacks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total entries in range</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentPerformance.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Agents with feedback</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleCardClick("Customers with PTP Status", uniquePtpCustomers)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PTP Value</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <Rupee className="h-5 w-5 mr-1" />
                {uniquePtpAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total PTP amount logged</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleCardClick("Customers with Paid Status", uniquePaidCustomers)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <Rupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <Rupee className="h-5 w-5 mr-1" />
                {totalCollected.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total recorded collection amount</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Agent Productivity</CardTitle>
              <CardDescription>Feedback submitted by agent in the selected range.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="feedbackCount" fill="#3b82f6" name="Feedback Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Breakdown of feedback statuses.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie data={feedbackStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                    {feedbackStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          <Card className="md:col-span-7">
            <CardHeader>
              <CardTitle>Agent Performance Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-center">Total Feedback</TableHead>
                    <TableHead className="text-center">PTP Count</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentPerformance.map(agent => (
                    <TableRow key={agent.name}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell className="text-center">{agent.feedbackCount}</TableCell>
                      <TableCell className="text-center">{agent.ptpCount}</TableCell>
                      <TableCell className="text-right">₹{agent.collectedAmount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                  {agentPerformance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="md:col-span-5">
            <CardHeader>
              <CardTitle>Recent Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-4">
                  {recentActivities.map(activity => (
                    <Link to={`/customer/${activity.agreementid}`} key={activity.id} className="block p-3 rounded-lg border bg-muted/30 hover:bg-muted transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">{activity.agentName}</span>
                        <Badge variant="outline" className="text-[10px]">{activity.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{activity.detailedFeedback || activity.overallDetailedFeedback || 'No additional remarks'}</p>
                      <div className="text-[10px] text-muted-foreground mt-2 text-right">
                        {formatDistanceToNow(parseISO(activity.createdAt), { addSuffix: true })}
                      </div>
                    </Link>
                  ))}
                  {recentActivities.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No recent activities</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
