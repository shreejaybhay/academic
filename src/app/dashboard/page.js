'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRScanner from '@/components/QRScanner';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, QrCode, History, RefreshCw, Calendar } from 'lucide-react';
import StudentRoute from '@/components/StudentRoute';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function DashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scan");

  const fetchAttendanceHistory = async () => {
    if (!user) return;

    setIsLoading(true);
    setAttendanceHistory([]);

    try {
      const res = await fetch(`/api/attendance?studentId=${user.id}`);

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        // Filter out any records with missing sessionId or studentId
        const validRecords = data.data.filter(record =>
          record && record.sessionId && record.studentId
        );

        if (validRecords.length < data.data.length) {
          console.warn('Some attendance records have missing data and were filtered out');
        }

        setAttendanceHistory(validRecords);
      } else {
        console.error('API returned error:', data.message);
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch attendance history',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching attendance history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [user]);

  // No need to check for user here as StudentRoute handles that

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">Scan QR codes and view your attendance history</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Badge variant="outline" className="text-xs sm:text-sm font-medium">
            <Calendar className="mr-1 h-3 w-3" />
            {new Date().toLocaleDateString()}
          </Badge>

          <Button variant="outline" size="sm" onClick={fetchAttendanceHistory} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{attendanceHistory.length}</p>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <History className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("scan")}>
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("history")}>
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full mb-4 sm:mb-8">
          <button
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'scan' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/80'}`}
            onClick={() => setActiveTab('scan')}
          >
            <QrCode className="h-4 w-4" />
            Scan QR Code
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'history' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/80'}`}
            onClick={() => setActiveTab('history')}
          >
            <History className="h-4 w-4" />
            Attendance History
          </button>
        </div>

        {activeTab === 'scan' && (
          <Card className="border-2 border-dashed">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Scan QR Code</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Scan the QR code provided by your instructor to mark your attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <QRScanner />
            </CardContent>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Attendance History</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View your attendance records for all sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden overflow-x-auto">
                  <Table>
                    <TableCaption>
                      {attendanceHistory.length
                        ? `Showing ${attendanceHistory.length} attendance records`
                        : "No attendance records found"}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Subject</TableHead>
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap">Time</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceHistory.length > 0 ? (
                        attendanceHistory.map((record) => (
                          <TableRow key={record._id}>
                            <TableCell className="font-medium">
                              {record.sessionId ? record.sessionId.subject : 'Unknown Session'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {record.sessionId ? new Date(record.sessionId.date).toLocaleDateString() : 'Unknown'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {record.timestamp ? new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Present
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <History className="h-12 w-12 mb-2 opacity-20" />
                              <p>No attendance records found</p>
                              <p className="text-sm">Your attendance history will appear here once you've scanned a QR code</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            {attendanceHistory.length > 0 && (
              <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
                <p>Last updated: {new Date().toLocaleString()}</p>
                <p>{attendanceHistory.length} records found</p>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <StudentRoute>
      <DashboardContent />
    </StudentRoute>
  );
}
