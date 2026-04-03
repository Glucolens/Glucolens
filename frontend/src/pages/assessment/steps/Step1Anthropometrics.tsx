import { useForm } from 'react-hook-form';
import { useAssessmentStore } from '@/store/assessmentStore';
import { WizardLayout } from '../WizardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calculator, Check, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step1Form {
  fullName?: string;
  age?: number | string;
  gender?: string;
  height?: number | string;
  weight?: number | string;
  waistCircumference?: number | string;
  armCircumference?: number | string;
  familyHistory?: boolean | string;
  familyCondition?: string;
  familyRelationship?: string;
  hasDiabetes?: boolean | string;
  diabetesType?: string;
  otherConditions?: string;
  currentMedication?: string;
}

export default function Step1Anthropometrics() {
  const { data, updateData, nextStep } = useAssessmentStore();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step1Form>({
    defaultValues: {
      fullName: data.fullName,
      age: data.age === '' ? undefined : data.age,
      gender: data.gender,
      height: data.height === '' ? undefined : data.height,
      weight: data.weight === '' ? undefined : data.weight,
      waistCircumference: data.waistCircumference === '' ? undefined : data.waistCircumference,
      armCircumference: data.armCircumference === '' ? undefined : data.armCircumference,
      familyHistory: data.familyHistory,
      familyCondition: data.familyCondition,
      familyRelationship: data.familyRelationship,
      hasDiabetes: data.hasDiabetes,
      diabetesType: data.diabetesType,
      otherConditions: data.otherConditions,
      currentMedication: data.currentMedication,
    }
  });

// Watchers for calculations and progressive disclosure
  const height = watch('height');
  const weight = watch('weight');
  const waist = watch('waistCircumference');
  const gender = watch('gender');
  const familyHistory = watch('familyHistory');
  const familyRelationship = watch('familyRelationship');
  const hasDiabetes = watch('hasDiabetes');

  // --- Safely parse to numbers for TypeScript ---
  const numHeight = Number(height) || 0;
  const numWeight = Number(weight) || 0;
  const numWaist = Number(waist) || 0;

  // --- Calculations ---
  let bmi: number | null = null;
  if (numHeight > 0 && numWeight > 0) {
    const heightInMeters = numHeight / 100;
    bmi = numWeight / (heightInMeters * heightInMeters);
  }

  let whtr: number | null = null;
  if (numWaist > 0 && numHeight > 0) {
    whtr = numWaist / numHeight;
  }

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmiValue < 25) return { label: 'Normal weight', color: 'text-green-600' };
    if (bmiValue < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const getWhtrCategory = (ratio: number) => {
    if (ratio < 0.5) return { label: 'Healthy', color: 'text-green-600' };
    if (ratio < 0.6) return { label: 'Elevated Risk', color: 'text-yellow-600' };
    return { label: 'High Risk', color: 'text-red-600' };
  };

  const onSubmit = async (formData: Step1Form) => {
    updateData(formData);
    // Note: In Phase 2, this nextStep will eventually be wrapped in an API call to submitAnthropometrics!
    nextStep();
  };

  return (
    <WizardLayout 
      title="Basic Information" 
      description="Let's start with your basic health information."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* -- SECTION 1: Personal Details -- */}
        <div className="space-y-6">
          <Input 
            label="Full Name" 
            placeholder="Enter your full name"
            error={errors.fullName?.message}
            {...register('fullName', { required: "Full name is required" })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Age" 
              type="number" 
              placeholder="Your age"
              error={errors.age && "Age is required"}
              {...register('age', { required: true, min: 18, max: 120, valueAsNumber: true })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Sex</label>
              <div className="grid grid-cols-3 gap-2">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g} type="button"
                    onClick={() => setValue('gender', g as any, { shouldValidate: true })}
                    className={cn(
                      "py-2 px-3 rounded-lg border transition-all capitalize text-sm font-medium",
                      gender === g ? "border-primary bg-primary text-white shadow-sm" : "border-input bg-background text-foreground hover:border-primary/50"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-xs text-destructive mt-1">Please select your sex</p>}
            </div>
          </div>
        </div>

        {/* -- SECTION 2: Measurements & Calculators -- */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Measurements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Height (cm)" type="number" placeholder="e.g., 170"
              error={errors.height && "Height is required"}
              {...register('height', { required: true, min: 50, max: 300, valueAsNumber: true })}
            />
            <Input 
              label="Weight (kg)" type="number" placeholder="e.g., 70"
              error={errors.weight && "Weight is required"}
              {...register('weight', { required: true, min: 20, max: 300, valueAsNumber: true })}
            />
          </div>

          {bmi && (
            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900 font-medium text-sm">Body Mass Index (BMI)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{bmi.toFixed(1)}</span>
                <span className={`font-medium ${getBmiCategory(bmi).color}`}>
                  {getBmiCategory(bmi).label}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Waist Circumference (cm)" type="number" placeholder="Optional"
              {...register('waistCircumference', { min: 30, max: 200, valueAsNumber: true })}
            />
            <Input 
              label="Arm Circumference (cm)" type="number" placeholder="Optional"
              {...register('armCircumference', { min: 10, max: 100, valueAsNumber: true })}
            />
          </div>

          {/* NEW: Waist-to-Height Calculator from UX */}
          {whtr && (
            <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-900 font-medium text-sm">Waist-to-Height Ratio</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{whtr.toFixed(2)}</span>
                <span className={`font-medium ${getWhtrCategory(whtr).color}`}>
                  {getWhtrCategory(whtr).label}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">A healthy ratio is generally below 0.5</p>
            </div>
          )}
        </div>

        {/* -- SECTION 3: Health History (Progressive Disclosure) -- */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Health History</h3>
          
          {/* Family History */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Do you have a family history of diabetes or metabolic syndrome?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button" onClick={() => setValue('familyHistory', true, { shouldValidate: true })}
                className={cn("py-3 px-4 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-2", familyHistory === true ? "border-primary bg-primary text-white" : "border-input bg-background hover:border-primary/50")}
              >
                {familyHistory === true && <Check className="w-4 h-4" />} Yes
              </button>
              <button
                type="button" onClick={() => setValue('familyHistory', false, { shouldValidate: true })}
                className={cn("py-3 px-4 rounded-lg border-2 transition-all font-medium", familyHistory === false ? "border-input bg-muted ring-1 ring-ring/50" : "border-input bg-background hover:border-primary/50")}
              >
                No
              </button>
            </div>
          </div>

          {/* Conditional Family History Fields */}
          {familyHistory && (
            <div className="pl-4 border-l-2 border-primary/20 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
               <Input 
                 label="Specify which condition(s)" 
                 placeholder="e.g., Type 2 Diabetes"
                 {...register('familyCondition')}
               />
               <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Specify the closeness of the relative</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Parent', 'Sibling', 'Grandparent', 'Other'].map((rel) => (
                      <button
                        key={rel} type="button"
                        onClick={() => setValue('familyRelationship', rel as any)}
                        className={cn("py-2 px-3 rounded-lg border text-sm transition-all", familyRelationship === rel ? "border-primary bg-primary/10 text-primary font-medium" : "border-input bg-background hover:border-primary/50")}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {/* Diabetes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Do you have diabetes?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button" onClick={() => setValue('hasDiabetes', true, { shouldValidate: true })}
                className={cn("py-3 px-4 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-2", hasDiabetes === true ? "border-primary bg-primary text-white" : "border-input bg-background hover:border-primary/50")}
              >
                {hasDiabetes === true && <Check className="w-4 h-4" />} Yes
              </button>
              <button
                type="button" onClick={() => setValue('hasDiabetes', false, { shouldValidate: true })}
                className={cn("py-3 px-4 rounded-lg border-2 transition-all font-medium", hasDiabetes === false ? "border-input bg-muted ring-1 ring-ring/50" : "border-input bg-background hover:border-primary/50")}
              >
                No
              </button>
            </div>
          </div>

          {/* Conditional Diabetes Field */}
          {hasDiabetes && (
            <div className="pl-4 border-l-2 border-primary/20 animate-in slide-in-from-top-2 fade-in duration-300">
               <Input 
                 label="Specify the type of diabetes" 
                 placeholder="e.g., Type 1, Type 2, Gestational"
                 {...register('diabetesType')}
               />
            </div>
          )}

          <Input 
            label="Do you have any other medical conditions under treatment?" 
            placeholder="List conditions or type 'None'"
            {...register('otherConditions')}
          />
          <Input 
            label="Are you taking any current medication?" 
            placeholder="List medications or type 'None'"
            {...register('currentMedication')}
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-border">
          <Button type="submit" size="lg" className="w-full md:w-auto">
            Next Step
          </Button>
        </div>
      </form>
    </WizardLayout>
  );
}