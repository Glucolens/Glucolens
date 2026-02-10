import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { settingsService, type UserPreferences } from '@/services/settingsService';
import { User, Bell, Shield, LogOut, Save } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/LoadingScreen'; 

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  // Local State
  const [isLoading, setIsLoading] = useState(true);
  const [prefs, setPrefs] = useState<UserPreferences>({
    emailNotifications: false,
    pushNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false
  });

  // Load Preferences on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await settingsService.getPreferences();
        setPrefs(data);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        // Fake delay just so you can see the loader for a moment
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    loadData();
  }, []);

  const handleToggle = async (key: keyof UserPreferences) => {
    const newVal = !prefs[key];
    setPrefs(prev => ({ ...prev, [key]: newVal }));
    try {
      await settingsService.updatePreferences({ [key]: newVal });
    } catch (error) {
      console.error("Failed to save preference", error);
      setPrefs(prev => ({ ...prev, [key]: !newVal }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  //  LoadingScreen component
  if (isLoading) {
    return (
      <AppLayout>
        <LoadingScreen className="h-[50vh]" message="Loading settings..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>

        {/* 1. Profile Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-primary-50 rounded-lg">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue={user?.name || "Jean Pierre"} />
              <Input label="Email Address" defaultValue={user?.email || "jp@glucolens.com"} disabled className="bg-gray-50 text-gray-500" />
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Notifications Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Bell className="h-5 w-5 text-yellow-600" />
            </div>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-900">Email Alerts</label>
                <p className="text-xs text-gray-500">Receive weekly health summaries</p>
              </div>
              <Switch 
                checked={prefs.emailNotifications} 
                onCheckedChange={() => handleToggle('emailNotifications')} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                <p className="text-xs text-gray-500">Instant alerts for high risk detection</p>
              </div>
              <Switch 
                checked={prefs.pushNotifications} 
                onCheckedChange={() => handleToggle('pushNotifications')} 
              />
            </div>

          </CardContent>
        </Card>

        {/* 3. Security Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
              <Switch 
                checked={prefs.twoFactorAuth} 
                onCheckedChange={() => handleToggle('twoFactorAuth')} 
              />
            </div>
          </CardContent>
        </Card>

        {/* 4. Danger Zone */}
        <div className="pt-6 border-t border-gray-200">
          <Button variant="destructive" className="w-full sm:w-auto" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>

      </div>
    </AppLayout>
  );
        }
                
