'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SessionForm from '@/components/SessionForm';
import QRGenerator from '@/components/QRGenerator';
import AttendanceTable from '@/components/AttendanceTable';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import AdminRoute from '@/components/AdminRoute';

function AdminDashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        const data = await res.json();

        if (data.success) {
          setSessions(data.data);
        } else {
          toast({
            title: 'Error',
            description: data.message || 'Failed to fetch sessions',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while fetching sessions',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSessions(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();

        if (data.success) {
          setStudents(data.data);
        } else {
          toast({
            title: 'Error',
            description: data.message || 'Failed to fetch students',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while fetching students',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchSessions();
    fetchStudents();
  }, [toast]);

  const handleSessionCreated = (newSession) => {
    setSessions([newSession, ...sessions]);
    setSelectedSession(newSession);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setSessions(sessions.filter((session) => session._id !== sessionId));

        if (selectedSession && selectedSession._id === sessionId) {
          setSelectedSession(null);
        }

        toast({
          title: 'Success',
          description: 'Session deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to delete session',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the session',
        variant: 'destructive',
      });
    }
  };

  // No need to check for admin role here as AdminRoute handles that

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
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
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{sessions.length}</p>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{students.length}</p>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="mb-6 w-full grid grid-cols-3">
          <TabsTrigger value="sessions" className="text-xs sm:text-sm">Sessions</TabsTrigger>
          <TabsTrigger value="students" className="text-xs sm:text-sm">Students</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SessionForm onSessionCreated={handleSessionCreated} />

              {selectedSession && (
                <div className="mt-8">
                  <QRGenerator sessionData={selectedSession} />
                </div>
              )}
            </div>

            <div>
              <Card>
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="text-lg sm:text-xl">Session List</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Select a session to view its QR code and attendance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSessions ? (
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>
                        {sessions.length
                          ? `Total ${sessions.length} sessions`
                          : 'No sessions found'}
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.length > 0 ? (
                          sessions.map((session) => (
                            <TableRow key={session._id}>
                              <TableCell className="font-medium">{session.subject}</TableCell>
                              <TableCell>{new Date(session.date).toLocaleString()}</TableCell>
                              <TableCell>{new Date(session.expiresAt).toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedSession(session)}
                                  >
                                    View QR
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteSession(session._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              No sessions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                All registered students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableCaption>
                    {students.length
                      ? `Total ${students.length} students`
                      : 'No students found'}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Registered On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                {selectedSession
                  ? `Showing attendance for ${selectedSession.subject}`
                  : 'Select a session to view attendance or view all records'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceTable sessionId={selectedSession?._id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}
