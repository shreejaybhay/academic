import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Users, CalendarCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">QR Code-Based Student Attendance System</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A modern solution for tracking student attendance using QR codes and secure authentication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <QrCode className="h-12 w-12 mb-4 text-primary" />
            <CardTitle>QR Code Scanning</CardTitle>
            <CardDescription>
              Students can quickly mark attendance by scanning a QR code with their device.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-12 w-12 mb-4 text-primary" />
            <CardTitle>Secure Authentication</CardTitle>
            <CardDescription>
              JWT-based authentication ensures that only authorized users can access the system.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CalendarCheck className="h-12 w-12 mb-4 text-primary" />
            <CardTitle>Attendance Tracking</CardTitle>
            <CardDescription>
              Administrators can easily create sessions and track student attendance records.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
