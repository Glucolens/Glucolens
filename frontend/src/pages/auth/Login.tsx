import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Stores & Services
import { useAuthStore } from '@/store/authStore';
import { loginSchema, type LoginFormData } from '@/lib/validation';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthLayout } from '@/components/layout/AuthLayout';

const Login = () => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const login = useAuthStore((state) => state.login);
  // Pull the loading state directly from the Zustand store!
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      // Pass the single credentials object to the store
      await login({ email: data.email, password: data.password });
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('[Login] Request Failed:', err);
      setServerError(useAuthStore.getState().error || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoAccess = () => {
    // Bypass the API entirely and force the store into an authenticated state
    useAuthStore.setState({
      user: { id: "demo-user", email: "guest@glucolens.com", role: "patient", org_id: null, facility_id: null },
      accessToken: "demo-token",
      isAuthenticated: true,
    });
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('login_title', 'Welcome back!')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('login_subtitle', 'Enter your credentials to access your dashboard')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <Input
            label={t('email_label', 'Email or username')}
            icon={<Mail size={18} className="text-muted-foreground" />}
            {...register('email')}
            error={errors.email?.message}
            placeholder="your.email@example.com"
            disabled={isLoading}
            autoComplete="email"
          />
          
          <Input
            label={t('password_label', 'Password')}
            type={showPassword ? "text" : "password"}
            icon={<Lock size={18} className="text-muted-foreground" />}
            {...register('password')}
            error={errors.password?.message}
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-end">
          <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline transition-colors">
            {t('forgot_password', 'Forgot password?')}
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full py-2.5 shadow-soft"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {t('login_button', 'Login')}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground font-medium">Or</span>
          </div>
        </div>

        <Button 
          type="button"
          onClick={handleDemoAccess}
          disabled={isLoading}
          variant="outline"
          className="w-full font-semibold py-2.5 rounded-xl text-sm"
        >
          {t('demo_button', 'Try Demo')}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">{t('no_account', "Don't have an account?")} </span>
        <Link to="/auth/register" className="font-medium text-primary hover:underline transition-colors">
          {t('sign_up', 'Sign up')}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;