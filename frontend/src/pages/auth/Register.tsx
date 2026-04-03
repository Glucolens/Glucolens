import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Activity } from 'lucide-react';

// Stores & Services
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { registerSchema, type RegisterFormData } from '@/lib/validation';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthLayout } from '@/components/layout/AuthLayout';

/**
 * Register Page Component
 * Handles new user registration, notification consents, and auto-login.
 */
const Register = () => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  
  // UI State for Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // NEW: State to track if the server is taking a long time
  const [isWakingServer, setIsWakingServer] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  // --- 1. THE HEAD START PING ---
  // Silently wake the server up while the user fills out their information
  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsWakingServer(false);

    // --- 2. THE SLOW REQUEST DETECTOR ---
    // Registration + Auto-Login can take a while on a cold start.
    const wakeTimer = setTimeout(() => {
      setIsWakingServer(true);
    }, 4000);

    try {
      // 1. Create the user
      await api.post('/auth/register-public', {
        email: data.email,
        password: data.password,
      });

      // 2. Automatically log them in (which handles token fetching and profile building)
      await login({ 
        email: data.email, 
        password: data.password 
      });

      clearTimeout(wakeTimer);
      navigate('/dashboard');

    } catch (err: unknown) {
      clearTimeout(wakeTimer);
      setIsWakingServer(false);
      console.error('[Register] Request Failed:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setServerError('This email address is already registered. Please log in.');
          return;
        }

        const detail = err.response?.data?.detail;
        const message = Array.isArray(detail) ? detail[0].msg : err.response?.data?.message || 'Registration failed. Please try again.';
        setServerError(message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred.');
      }
    }
  };

  // We consider it loading if the form is submitting OR if Zustand is busy logging them in
  const isLoading = isSubmitting || useAuthStore.getState().isLoading;

  return (
    <AuthLayout>
      {/* HEADER SECTION  */}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {t('reg_title', 'Create Your Account')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('reg_subtitle', 'Join GlucoLens to start monitoring your health')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
        
        {/* --- 3. DYNAMIC REASSURANCE BANNER --- */}
        {isWakingServer && !serverError && (
          <div className="p-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-500">
            <Activity className="shrink-0 w-5 h-5 animate-pulse text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Warming up the servers...</p>
              <p className="text-blue-600/80 leading-snug">Our servers are booting up to ensure your data is processed securely. This may take a minute or two.</p>
            </div>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        {/* INPUT FIELDS */}
        <div className="space-y-4">
          <Input
            label={t('reg_username', 'Full Name')}
            icon={<User size={18} className="text-muted-foreground" />}
            placeholder="Enter your full name"
            error={errors.fullName?.message}
            disabled={isLoading}
            {...register('fullName')}
          />
          
          <Input
            label={t('reg_email', 'Email Address')}
            type="email"
            icon={<Mail size={18} className="text-muted-foreground" />}
            placeholder="your.email@example.com"
            error={errors.email?.message}
            disabled={isLoading}
            {...register('email')}
          />
          
          <Input
            label={t('reg_phone', 'Phone Number')}
            type="tel"
            icon={<Phone size={18} className="text-muted-foreground" />}
            placeholder="+1 (555) 000-0000"
            error={errors.phoneNumber?.message}
            disabled={isLoading}
            {...register('phoneNumber')}
          />

          <Input
            label={t('reg_password', 'Password')}
            type={showPassword ? 'text' : 'password'}
            icon={<Lock size={18} className="text-muted-foreground" />}
            placeholder="Enter your password"
            error={errors.password?.message}
            disabled={isLoading}
            rightElement={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            {...register('password')}
          />

          <Input
            label={t('reg_confirm', 'Confirm Password')}
            type={showConfirmPassword ? 'text' : 'password'}
            icon={<Lock size={18} className="text-muted-foreground" />}
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            disabled={isLoading}
            rightElement={
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            {...register('confirmPassword')}
          />
        </div>

        {/* CONSENT CHECKBOXES */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex items-center h-5 mt-0.5">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors disabled:opacity-50"
                disabled={isLoading}
                {...register('emailReminders')}
              />
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-snug">
              {t('reg_email_consent', 'I agree to receive email reminders')}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex items-center h-5 mt-0.5">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors disabled:opacity-50"
                disabled={isLoading}
                {...register('smsReminders')}
              />
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-snug">
              {t('reg_sms_consent', 'I agree to receive SMS notifications')}
            </span>
          </label>
        </div>

        {/* AI DISCLAIMER BOX */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start mt-6">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <p className="text-[13px] leading-relaxed text-amber-800 font-medium">
            {t('reg_ai_warning', 'GlucoLens provides AI-driven insights based on your data. Always consult a healthcare professional for medical advice.')}
          </p>
        </div>

        {/* SUBMIT BUTTON */}
        <Button 
          type="submit" 
          className="w-full mt-6 py-2.5 text-base font-medium shadow-soft transition-all" 
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isWakingServer ? 'Connecting...' : t('reg_submit', 'Sign Up')}
        </Button>
      </form>

      {/* FOOTER  */}
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">{t('reg_have_account', 'Already have an account?')} </span>
        <Link 
          to="/auth/login" 
          className="font-medium text-primary hover:underline transition-colors"
        >
          {t('reg_login_link', 'Log in')}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;