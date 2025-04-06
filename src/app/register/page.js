import RegisterForm from '@/components/RegisterForm';

export const metadata = {
  title: 'Register - Student Attendance System',
  description: 'Register for the QR Code-Based Student Attendance System',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Create an Account</h1>
          <p className="text-sm text-muted-foreground">Sign up to start tracking your attendance</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
