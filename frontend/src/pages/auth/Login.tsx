import { useState } from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import axios from 'axios';

import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Stores & Services

import { useAuthStore } from '@/store/authStore';

import api from '@/services/api';

import { loginSchema, type LoginFormData } from '@/lib/validation';


// Components

import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';

import { AuthLayout } from '@/components/layout/AuthLayout';

/**

 * Login Page Component

 * Handles user authentication via API and offers a demo access fallback.

 */

const Login = () => {

  const { t } = useTranslation();

  const [serverError, setServerError] = useState<string | null>(null);

  

  const navigate = useNavigate();

  const location = useLocation();

  const login = useAuthStore((state) => state.login);

  

  // State for UI controls

  const [showLoader, setShowLoader] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Determine where to send the user after login 

  const from = location.state?.from?.pathname || '/dashboard';

  // Initialize React Hook Form

  const {

    register,

    handleSubmit,

    formState: { errors },

  } = useForm<LoginFormData>({

    resolver: zodResolver(loginSchema),

    defaultValues: { email: '', password: '' }

  });

  /**

   * Handle Form Submission (Production API Call)

   */

  const onSubmit = async (data: LoginFormData) => {

    setServerError(null);

    setShowLoader(true);

    try {

      //Type-Safe API Call 

      const response = await api.post<any>('/auth/login', {

        username: data.email, 

        password: data.password

      });

      // Validate and Extract Response

      const { user, access_token } = response.data;

      

      if (!access_token || !user) {

        throw new Error("Invalid response from server: Missing token or user data");

      }

      // Login and Redirect

      login(user, access_token);

      navigate(from, { replace: true });

    } catch (err: unknown) {

      console.error('[Login] Request Failed:', err);

      // error checking

      if (axios.isAxiosError(err)) {

        const message = err.response?.data?.message || t('invalid_credentials', 'Invalid email or password.');

        setServerError(message);

      } else if (err instanceof Error) {

        setServerError(err.message);

      } else {

        setServerError(t('unexpected_error', 'An unexpected error occurred.'));

      }

    } finally {

      setShowLoader(false);

    }

  };

  /**

   * Immediate Dashboard Access for Demo Purposes

   */

  const handleDemoAccess = () => {

    const demoUser = {

      id: "demo-user",

      email: "guest@glucolens.com",

      name: "Guest User",

      role: "patient"

    };

    login(demoUser, "demo-token");

    navigate('/dashboard', { replace: true });

  };

  return (

    <AuthLayout>

      {/* Header*/}

      <div className="flex flex-col space-y-2 text-center mb-8">

        <h1 className="text-2xl font-semibold tracking-tight">

          {t('login_title', 'Welcome back!')}

        </h1>

        <p className="text-sm text-gray-500">

          {t('login_subtitle', 'Enter your credentials to access your dashboard')}

        </p>

      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Server Error Alert */}

        {serverError && (

          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in">

            <AlertCircle size={16} className="shrink-0" />

            <span className="font-medium">{serverError}</span>

          </div>

        )}

        

        <div className="space-y-4">

          {/* Email Input*/}

          <Input

            label={t('email_label', 'Email or username')}

            icon={<Mail size={18} className="text-muted-foreground" />}

            {...register('email')}

            error={errors.email?.message}

            placeholder="your.email@example.com"

            disabled={showLoader}

            autoComplete="email"

          />

          

          {/* Password Input  */}

          <Input

            label={t('password_label', 'Password')}

            type={showPassword ? "text" : "password"}

            icon={<Lock size={18} className="text-muted-foreground" />}

            {...register('password')}

            error={errors.password?.message}

            placeholder="••••••••"

            disabled={showLoader}

            autoComplete="current-password"

            rightElement={

              <button

                type="button"

                onClick={() => setShowPassword(!showPassword)}

                className="text-muted-foreground hover:text-foreground focus:outline-none transition-colors"

                disabled={showLoader}

              >

                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}

              </button>

            }

          />

        </div>

        {/* Forgot Password Link*/}

        <div className="flex items-center justify-end">

          <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline transition-colors">

            {t('forgot_password', 'Forgot password?')}

          </Link>

        </div>

        {/* Submit Button */}

        <Button 

          type="submit" 

          className="w-full py-2.5 shadow-soft"

          isLoading={showLoader}

          disabled={showLoader}

        >

          {t('login_button', 'Login')}

        </Button>

        {/* Divider */}

        <div className="relative py-2">

          <div className="absolute inset-0 flex items-center">

            <div className="w-full border-t border-border"></div>

          </div>

          <div className="relative flex justify-center text-xs uppercase">

            <span className="bg-white px-2 text-muted-foreground font-medium">Or</span>

          </div>

        </div>

        {/* Demo Button */}

        <Button 

          type="button"

          onClick={handleDemoAccess}

          disabled={showLoader}

          variant="outline"

          className="w-full font-semibold py-2.5 rounded-xl text-sm"

        >

          {t('demo_button', 'Try Demo')}

        </Button>

      </form>

      {/* Footer */}

      <div className="mt-6 text-center text-sm">

        <span className="text-gray-500">{t('no_account', "Don't have an account?")} </span>

        <Link 

          to="/auth/register" 

          className="font-medium text-primary hover:underline transition-colors"

        >

          {t('sign_up', 'Sign up')}

        </Link>

      </div>

    </AuthLayout>

  );

};

export default Login;

