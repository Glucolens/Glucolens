import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAssessmentStore } from '@/store/assessmentStore';
import { dashboardService, type DashboardStats, type GlucoseDataPoint } from '@/services/dashboardService';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlucoseChart } from '@/components/dashboard/GlucoseChart';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Activity, Upload, TrendingUp, History, Droplet, Dna, Scale, Footprints, Ruler, Target, Loader2 } from 'lucide-react';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: assessmentData } = useAssessmentStore();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<GlucoseDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, historyData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getGlucoseHistory()
        ]);
        setStats(statsData);
        setChartData(historyData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Keep this for profile completion logic (as they might still be filling it out)
  const fields = Object.values(assessmentData);
  const completionPercentage = Math.round((fields.filter(v => v !== '' && v !== null && v !== false).length / fields.length) * 100);

  // FIX 1: Pull metrics from the backend (stats) instead of local assessmentStore
  const weight = Number(stats?.weight) || 0;
  const height = Number(stats?.height) || 0;
  const waist = Number(stats?.waistCircumference) || 0;
  
  const bmi = (weight > 0 && height > 0) ? (weight / Math.pow(height / 100, 2)) : 0;
  const waistToHeightRatio = (waist > 0 && height > 0) ? (waist / height) : 0;
  const activityLevel = stats?.activityLevel || 'Not Set';
  
  const currentRiskLevel = Number(stats?.riskScore || 0) > 70 ? 'high' : Number(stats?.riskScore || 0) > 40 ? 'medium' : 'low';

  const quickActions = [
    { title: 'Enter My Data', icon: Activity, desc: 'Add your health information', color: 'from-blue-500 to-blue-600', path: '/assessment' },
    { title: 'Track Glucose', icon: Droplet, desc: 'Monitor your blood sugar levels', color: 'from-indigo-500 to-indigo-600', path: '/dashboard' },
    { title: 'Upload Lab Results', icon: Upload, desc: 'Upload test reports', color: 'from-purple-500 to-purple-600', path: '/assessment', optional: true },
    { title: 'Genomic Data', icon: Dna, desc: 'Optional precise prediction', color: 'from-teal-500 to-teal-600', path: '/assessment', optional: true },
    { title: 'Past Assessments', icon: History, desc: 'View your history', color: 'from-orange-500 to-orange-600', path: '/settings' },
    { title: 'Risk Score', icon: TrendingUp, desc: 'Check health status', color: 'from-green-500 to-green-600', path: '/dashboard' },
  ]; 

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Hi {user?.email || 'Guest'}! Let's check your health status today.
          </h1>
          <p className="text-muted-foreground">Your wellness journey continues here</p>
        </div>

        <Card>
          <CardContent className="p-6 pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Profile Completion</h2>
                <p className="text-sm text-muted-foreground">Your profile is {completionPercentage}% complete</p>
              </div>
              <Badge level={currentRiskLevel} />
            </div>
            <Progress value={completionPercentage} />
            {completionPercentage < 100 && (
              <button onClick={() => navigate('/assessment')} className="mt-4 text-sm font-medium text-primary hover:underline">
                Complete your profile →
              </button>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-5 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-foreground">BMI Status</h3>
                </div>
                <div className="text-2xl font-bold text-foreground">{bmi > 0 ? bmi.toFixed(1) : '—'}</div>
                <p className="text-muted-foreground text-xs mt-1">Calculated from Anthropometrics</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-5 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Footprints className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-foreground">Physical Activity</h3>
                </div>
                <div className="text-2xl font-bold text-foreground capitalize">{activityLevel}</div>
                <p className="text-muted-foreground text-xs mt-1">Reported activity level</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-5 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="w-5 h-5 text-teal-600" />
                  <h3 className="font-medium text-foreground">Waist-to-Height</h3>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {waistToHeightRatio > 0 ? (waistToHeightRatio * 100).toFixed(1) + '%' : '—'}
                </div>
                <p className="text-muted-foreground text-xs mt-1">Central adiposity indicator</p>
              </CardContent>
            </Card>

            {/* FIX 2: Correctly display the ML Risk Score instead of Average Glucose */}
            <Card className="hover:shadow-md transition-all border-orange-100">
              <CardContent className="p-5 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium text-foreground">AI Risk Summary</h3>
                </div>
                <div className="text-2xl font-bold text-foreground">{stats?.riskScore || 0} / 100</div>
                <p className="text-muted-foreground text-xs mt-1">Risk Level: {currentRiskLevel.toUpperCase()} • Confidence: {stats?.riskConfidence || 0}%</p>
              </CardContent>
            </Card>

          </div>
        </div>

        <Card>
          <CardContent className="p-6 pt-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Glucose Trends (24h)</h2>
            <div className="h-[300px] w-full">
              <GlucoseChart data={chartData} />
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <Card key={i} className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(action.path)}>
                <CardContent className="p-6 pt-6 flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{action.title}</h3>
                      {action.optional && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] uppercase font-bold rounded-full">Optional</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}