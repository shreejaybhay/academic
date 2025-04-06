import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Login - Student Attendance System',
  description: 'Login to the QR Code-Based Student Attendance System',
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
