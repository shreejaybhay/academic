"use client";

import { useState, useEffect, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AttendanceTable({ sessionId: propSessionId }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(propSessionId || null);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const { toast } = useToast();

  // Update sessionId when propSessionId changes
  useEffect(() => {
    setSessionId(propSessionId || null);
  }, [propSessionId]);

  // Define fetchData function
  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Fetch session data
      if (sessionId) {
        const sessionRes = await fetch(`/api/sessions/${sessionId}`);

        if (!sessionRes.ok) {
          throw new Error(
            `Session API error: ${sessionRes.status} ${sessionRes.statusText}`
          );
        }

        const sessionData = await sessionRes.json();

        if (sessionData.success) {
          setSession(sessionData.data);
        } else {
          console.error("Session API returned error:", sessionData.message);
        }

        // Fetch attendance data for the session
        const attendanceRes = await fetch(
          `/api/attendance?sessionId=${sessionId}`
        );

        if (!attendanceRes.ok) {
          throw new Error(
            `Attendance API error: ${attendanceRes.status} ${attendanceRes.statusText}`
          );
        }

        const attendanceData = await attendanceRes.json();

        if (attendanceData.success) {
          // Filter out any records with missing sessionId or studentId
          const validRecords = attendanceData.data.filter(
            (record) => record && record.sessionId && record.studentId
          );

          if (validRecords.length < attendanceData.data.length) {
            console.warn(
              "Some attendance records have missing data and were filtered out"
            );
          }

          setAttendanceData(validRecords);
        } else {
          console.error(
            "Attendance API returned error:",
            attendanceData.message
          );
        }
      } else {
        // Fetch all attendance data
        const res = await fetch("/api/attendance");

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (data.success) {
          // Filter out any records with missing sessionId or studentId
          const validRecords = data.data.filter(
            (record) => record && record.sessionId && record.studentId
          );

          if (validRecords.length < data.data.length) {
            console.warn(
              "Some attendance records have missing data and were filtered out"
            );
          }

          setAttendanceData(validRecords);
        } else {
          console.error("API returned error:", data.message);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/sessions");

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        setAvailableSessions(data.data);
      } else {
        console.error("API returned error:", data.message);
        toast({
          title: "Error",
          description: "Failed to load sessions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "An error occurred while loading sessions",
        variant: "destructive",
      });
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Fetch attendance data when sessionId changes
  useEffect(() => {
    // Always fetch data when sessionId changes, whether it's set to a value or null
    fetchData();

    // If sessionId is null (All Sessions), also reset the session state
    if (!sessionId) {
      setSession(null);
    }
  }, [sessionId]);

  // Initial data fetch - only runs once on component mount
  useEffect(() => {
    // Initial data fetch will be handled by the sessionId effect
    // This is intentionally left empty to avoid duplicate fetches
  }, []);

  const exportToCSV = () => {
    if (!attendanceData.length) return;

    // Create CSV content
    const headers = ["Student Name", "Email", "Subject", "Date", "Timestamp"];
    const csvContent = [
      headers.join(","),
      ...attendanceData.map((record) =>
        [
          record.studentId ? record.studentId.name : "Unknown Student",
          record.studentId ? record.studentId.email : "Unknown Email",
          record.sessionId ? record.sessionId.subject : "Unknown Subject",
          record.sessionId?.date
            ? new Date(record.sessionId.date).toLocaleDateString()
            : "Unknown Date",
          record.timestamp
            ? new Date(record.timestamp).toLocaleString()
            : "Unknown Time",
        ].join(",")
      ),
    ].join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `attendance_${sessionId || "all"}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle session selection
  const handleSessionChange = (value) => {
    // Show loading state when changing sessions
    setIsLoading(true);

    // Clear current data to avoid showing stale data
    setAttendanceData([]);

    // If "all" is selected, set sessionId to null to show all sessions
    setSessionId(value === "all" ? null : value);

    // Add a toast notification for better user feedback
    toast({
      title: value === "all" ? "Showing all sessions" : "Session selected",
      description:
        value === "all"
          ? "Displaying attendance for all sessions"
          : "Displaying attendance for the selected session",
    });
  };

  // Refresh data
  const refreshData = () => {
    // Always refresh sessions list
    fetchSessions();

    // Always refresh attendance data
    setIsLoading(true);
    fetchData();

    // Show feedback to user
    toast({
      title: "Data refreshed",
      description: "The attendance data has been refreshed",
    });
  };

  return (
    <div className="w-full">
      {/* Session selector when no session is provided via props */}
      {!propSessionId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Session</CardTitle>
            <CardDescription>
              Choose a session to view its attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Select
                  value={sessionId || "all"}
                  onValueChange={handleSessionChange}
                  disabled={loadingSessions}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    {availableSessions.map((session) => (
                      <SelectItem key={session._id} value={session._id}>
                        {session.subject} -{" "}
                        {new Date(session.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshData}
                disabled={isLoading || loadingSessions}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isLoading || loadingSessions ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {session && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {session.subject || "Session Details"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Date:{" "}
            {session.date
              ? new Date(session.date).toLocaleString()
              : "Not specified"}
            <br />
            Expires:{" "}
            {session.expiresAt
              ? new Date(session.expiresAt).toLocaleString()
              : "Not specified"}
          </p>
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          onClick={exportToCSV}
          disabled={!attendanceData.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <Table>
        <TableCaption>
          {attendanceData.length
            ? `Showing ${attendanceData.length} attendance records`
            : "No attendance records found"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendanceData.length > 0 ? (
            // If no specific session is selected, group records by session
            !sessionId ? (
              // Group records by session and sort by session date
              Object.entries(
                attendanceData.reduce((groups, record) => {
                  const sessionId = record.sessionId?._id;
                  if (!sessionId) return groups;

                  if (!groups[sessionId]) {
                    groups[sessionId] = {
                      session: record.sessionId,
                      records: [],
                    };
                  }

                  groups[sessionId].records.push(record);
                  return groups;
                }, {})
              )
                .sort(([, groupA], [, groupB]) => {
                  const dateA = new Date(groupA.session?.date || 0);
                  const dateB = new Date(groupB.session?.date || 0);
                  return dateB - dateA; // Sort by date descending
                })
                .map(([sessionId, group]) => (
                  <Fragment key={sessionId}>
                    {/* Session header row */}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={5} className="font-medium">
                        <div className="flex items-center justify-between">
                          <span>
                            {group.session?.subject || "Unknown Session"} -
                            {group.session?.date
                              ? new Date(
                                  group.session.date
                                ).toLocaleDateString()
                              : "Unknown Date"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {group.records.length}{" "}
                            {group.records.length === 1 ? "record" : "records"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Session attendance records */}
                    {group.records.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {record.studentId
                            ? record.studentId.name
                            : "Unknown Student"}
                        </TableCell>
                        <TableCell>
                          {record.studentId
                            ? record.studentId.email
                            : "Unknown Email"}
                        </TableCell>
                        <TableCell>
                          {record.sessionId
                            ? record.sessionId.subject
                            : "Unknown Subject"}
                        </TableCell>
                        <TableCell>
                          {record.sessionId?.date
                            ? new Date(
                                record.sessionId.date
                              ).toLocaleDateString()
                            : "Unknown Date"}
                        </TableCell>
                        <TableCell>
                          {record.timestamp
                            ? new Date(record.timestamp).toLocaleString()
                            : "Unknown Time"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))
            ) : (
              // Show records for the selected session
              attendanceData.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">
                    {record.studentId
                      ? record.studentId.name
                      : "Unknown Student"}
                  </TableCell>
                  <TableCell>
                    {record.studentId
                      ? record.studentId.email
                      : "Unknown Email"}
                  </TableCell>
                  <TableCell>
                    {record.sessionId
                      ? record.sessionId.subject
                      : "Unknown Subject"}
                  </TableCell>
                  <TableCell>
                    {record.sessionId?.date
                      ? new Date(record.sessionId.date).toLocaleDateString()
                      : "Unknown Date"}
                  </TableCell>
                  <TableCell>
                    {record.timestamp
                      ? new Date(record.timestamp).toLocaleString()
                      : "Unknown Time"}
                  </TableCell>
                </TableRow>
              ))
            )
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No attendance records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
