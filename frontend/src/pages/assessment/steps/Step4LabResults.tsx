import { useForm } from 'react-hook-form';
import { useAssessmentStore } from '@/store/assessmentStore';
import { WizardLayout } from '../WizardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UploadCloud, X, FileText, Activity } from 'lucide-react';

interface Step4Form {
  labFile?: File | null;
  fastingGlucose?: number | string;
  totalCholesterol?: number | string;
  hba1c?: number | string;
  systolicBP?: number | string;
}

export default function Step4LabResults() {
  const { data, updateData, nextStep, prevStep } = useAssessmentStore();
  
  const { register, handleSubmit, setValue, watch } = useForm<Step4Form>({
    defaultValues: {
      labFile: data.labFile,
      fastingGlucose: data.fastingGlucose,
      totalCholesterol: data.totalCholesterol,
      hba1c: data.hba1c,
      systolicBP: data.systolicBP,
    }
  });

  const labFile = watch('labFile');
  const fastingGlucose = watch('fastingGlucose');
  const totalCholesterol = watch('totalCholesterol');
  const hba1c = watch('hba1c');
  const systolicBP = watch('systolicBP');

  const onSubmit = (formData: Step4Form) => {
    updateData(formData);
    nextStep();
  };

  const handleSkip = () => {
    // If they explicitly click skip, we can just move forward
    // without enforcing any manual input completion.
    nextStep();
  };

  const handleFileChange = (file: File | null) => {
    setValue('labFile', file, { shouldValidate: true });
  };

  // Determine if the user has entered any data (to toggle Skip vs Next text if desired)
  const hasData = labFile || fastingGlucose || totalCholesterol || hba1c || systolicBP;

  return (
    <WizardLayout 
      title="Lab Results" 
      description="This upload is optional. Results can be shown without uploading these files."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* --- SECTION 1: File Upload --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Upload Lab Report</h3>
          
          {!labFile ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-primary" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">PDF, JPG, PNG (Max 10MB)</p>
              </div>
              <input 
                type="file" 
                accept=".pdf,image/png,image/jpeg,image/jpg" 
                className="hidden" 
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)} 
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-4 border-2 border-primary bg-primary/5 rounded-xl animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px] md:max-w-xs">{labFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(labFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => handleFileChange(null)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* --- DIVIDER --- */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground font-medium">or enter manually</span>
          </div>
        </div>

        {/* --- SECTION 2: Manual Entry --- */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Fasting Glucose */}
            <div className="space-y-1">
              <Input 
                label="Fasting Blood Glucose (mg/dL)" 
                type="number" step="0.1" 
                placeholder="e.g., 95"
                {...register('fastingGlucose', { valueAsNumber: true })}
              />
              <p className="text-xs text-green-600 font-medium px-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Normal: 70-100 mg/dL
              </p>
            </div>

            {/* Total Cholesterol */}
            <div className="space-y-1">
              <Input 
                label="Total Cholesterol (mg/dL)" 
                type="number" step="0.1" 
                placeholder="e.g., 180"
                {...register('totalCholesterol', { valueAsNumber: true })}
              />
              <p className="text-xs text-green-600 font-medium px-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Normal: &lt; 200 mg/dL
              </p>
            </div>

            {/* HbA1c */}
            <div className="space-y-1">
              <Input 
                label="HbA1c (%)" 
                type="number" step="0.1" 
                placeholder="e.g., 5.4"
                {...register('hba1c', { valueAsNumber: true })}
              />
              <p className="text-xs text-green-600 font-medium px-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Normal: &lt; 5.7%
              </p>
            </div>

            {/* Systolic BP */}
            <div className="space-y-1">
              <Input 
                label="Blood Pressure (systolic)" 
                type="number" 
                placeholder="e.g., 115"
                {...register('systolicBP', { valueAsNumber: true })}
              />
              <p className="text-xs text-green-600 font-medium px-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Normal: &lt; 120 mmHg
              </p>
            </div>

          </div>
        </div>

        {/* --- NAVIGATION --- */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={prevStep}>Previous</Button>
          
          <div className="flex gap-3">
            {!hasData && (
              <Button type="button" variant="outline" onClick={handleSkip}>
                Skip this step
              </Button>
            )}
            <Button type="submit" size="lg" className="px-8">
              Next
            </Button>
          </div>
        </div>
      </form>
    </WizardLayout>
  );
}