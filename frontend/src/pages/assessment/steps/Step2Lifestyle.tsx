import { useForm } from 'react-hook-form';
import { useAssessmentStore } from '@/store/assessmentStore';
import { WizardLayout } from '../WizardLayout';
import { Button } from '@/components/ui/Button';
import { Activity, Moon, BookOpen, Users, Flame, Wine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step2Form {
  educationLevel?: string;
  socialLife?: string;
  activityLevel?: string;
  sleepHours?: number | string;
  smoking?: string;
  alcohol?: string;
}

export default function Step2Lifestyle() {
  const { data, updateData, nextStep, prevStep } = useAssessmentStore();
  
const { handleSubmit, setValue, watch } = useForm<Step2Form>({
    defaultValues: {
      educationLevel: data.educationLevel,
      socialLife: data.socialLife,
      activityLevel: data.activityLevel,
      sleepHours: data.sleepHours === '' ? 7 : data.sleepHours,
      smoking: data.smoking,
      alcohol: data.alcohol
    }
  });

  const educationLevel = watch('educationLevel');
  const socialLife = watch('socialLife');
  const activityLevel = watch('activityLevel');
  const sleepHours = watch('sleepHours');
  const smoking = watch('smoking');
  const alcohol = watch('alcohol');

  const onSubmit = (formData: Step2Form) => {
    updateData(formData);
    // Note: We will wire this to assessmentService.submitLifestyle in the final API pass!
    nextStep();
  };

  // UX Options Mapped
  const educationOptions = [
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary', label: 'Secondary School' },
    { value: 'college', label: 'College/University' },
    { value: 'postgraduate', label: 'Postgraduate' },
  ] as const;

  const socialOptions = [
    { value: 'very_active', label: 'Very Active' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'limited', label: 'Limited' },
  ] as const;

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'light', label: 'Light Activity' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'active', label: 'Active' },
    { value: 'very_active', label: 'Very Active' },
  ] as const;

  const habitOptions = [
    { value: 'never', label: 'Never' },
    { value: 'occasionally', label: 'Occasionally' },
  ] as const;

  return (
    <WizardLayout 
      title="Lifestyle Information" 
      description="Help us understand your daily habits and lifestyle."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        
        {/* -- SECTION 1: Socioeconomic -- */}
        <div className="space-y-6">
          
          {/* Education Level */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <BookOpen className="w-5 h-5 text-primary" />
              Education Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {educationOptions.map((opt) => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setValue('educationLevel', opt.value as any, { shouldValidate: true })}
                  className={cn("py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all text-center", educationLevel === opt.value ? "border-primary bg-primary/10 text-primary" : "border-input bg-background text-foreground hover:border-primary/50")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Social Life */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <Users className="w-5 h-5 text-primary" />
              Social Life
            </label>
            <div className="grid grid-cols-3 gap-3">
              {socialOptions.map((opt) => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setValue('socialLife', opt.value as any, { shouldValidate: true })}
                  className={cn("py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all text-center", socialLife === opt.value ? "border-primary bg-primary/10 text-primary" : "border-input bg-background text-foreground hover:border-primary/50")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* -- SECTION 2: Physical & Sleep -- */}
        <div className="space-y-6">
          
          {/* Activity Level */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <Activity className="w-5 h-5 text-primary" />
              Daily Physical Activity
            </label>
            <div className="flex flex-wrap gap-2">
              {activityOptions.map((opt) => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setValue('activityLevel', opt.value as any, { shouldValidate: true })}
                  className={cn("py-2 px-4 rounded-full border-2 text-sm font-medium transition-all", activityLevel === opt.value ? "border-primary bg-primary text-white" : "border-input bg-background text-foreground hover:border-primary/50")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Slider */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-foreground font-medium">
              <Moon className="w-5 h-5 text-primary" />
              Sleep Hours (per night)
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-sm font-bold text-slate-400">4h</span>
              <input
                type="range"
                min="4" max="12" step="0.5"
                value={sleepHours}
                onChange={(e) => setValue('sleepHours', parseFloat(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-bold text-slate-400">12h</span>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 min-w-[80px] text-center ml-4">
                <span className="text-primary font-bold text-lg">{sleepHours}</span>
                <span className="text-slate-500 text-sm ml-1">hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* -- SECTION 3: Habits -- */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Smoking */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-foreground font-medium">
                <Flame className="w-5 h-5 text-orange-500" />
                Do you smoke?
              </label>
              <div className="flex flex-col gap-2">
                {[...habitOptions, { value: 'yes', label: 'Yes' }].map((opt) => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => setValue('smoking', opt.value as any, { shouldValidate: true })}
                    className={cn("py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all text-left", smoking === opt.value ? "border-primary bg-primary/10 text-primary" : "border-input bg-background text-foreground hover:border-primary/50")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alcohol */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-foreground font-medium">
                <Wine className="w-5 h-5 text-purple-500" />
                Alcohol consumption
              </label>
              <div className="flex flex-col gap-2">
                {[...habitOptions, { value: 'regularly', label: 'Regularly' }].map((opt) => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => setValue('alcohol', opt.value as any, { shouldValidate: true })}
                    className={cn("py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all text-left", alcohol === opt.value ? "border-primary bg-primary/10 text-primary" : "border-input bg-background text-foreground hover:border-primary/50")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>
          <Button type="submit" size="lg" className="px-8">Next Step</Button>
        </div>
      </form>
    </WizardLayout>
  );
}