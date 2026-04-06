import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useSubmitAssessment } from '@/hooks/useSubmitAssessment';
import { WizardLayout } from '../WizardLayout';
import { Button } from '@/components/ui/Button';
import { UploadCloud, X, FileJson, Dna, AlertCircle } from 'lucide-react';
import { AnalysisScreen } from '../AnalysisScreen';

interface Step5Form {
  genomicFile: File | null;
}

export default function Step5Genomic() {
  const { data, updateData, prevStep, resetData } = useAssessmentStore();
  const { submitAssessment, error } = useSubmitAssessment();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  
  // Refs to handle the Race Condition between Animation and API
  const predictionResultRef = useRef<any>(null);
  const isAnimationDoneRef = useRef(false);
  const isApiDoneRef = useRef(false);
  
  const { handleSubmit, setValue, watch } = useForm<Step5Form>({
    defaultValues: { genomicFile: data.genomicFile }
  });

  const genomicFile = watch('genomicFile');

  // Unified function to route to dashboard ONLY when both Animation & API are finished
  const attemptCompletion = () => {
    if (isAnimationDoneRef.current && isApiDoneRef.current) {
      setIsAnalyzing(false);
      resetData(); 
      // Pass the result safely to the dashboard!
      navigate('/dashboard', { state: { newPrediction: predictionResultRef.current } }); 
    }
  };

  const onSubmit = async (formData: Step5Form) => {
    updateData(formData);
    setIsAnalyzing(true);
    isApiDoneRef.current = false;
    isAnimationDoneRef.current = false;

    try {
      // 1. Trigger the REAL API CALL
      const result = await submitAssessment();
      predictionResultRef.current = result;
      isApiDoneRef.current = true;
      attemptCompletion(); // Check if animation is already done
    } catch (err) {
      // If it fails, stop the animation so the user can see the error
      setIsAnalyzing(false);
      isApiDoneRef.current = true;
    }
  };

  const handleAnalysisComplete = () => {
    // 2. Triggered when the 8.5s animation finishes
    isAnimationDoneRef.current = true;
    attemptCompletion(); // Check if API is already done
  };

  const handleSkip = () => handleSubmit(onSubmit)();
  const handleFileChange = (file: File | null) => setValue('genomicFile', file, { shouldValidate: true });

  const supportedGenes = [
    "TCF7L2 (rs7903146)", "APOL1 (G1/G2 variants)", "APO1 variants", 
    "G6PD (rs1050878-T)", "KCNJ11 (rs5219, E23K)", "ABCC8 (C49620T)", 
    "HRANB3 / ZRANB3", "PPARG (Pro12Ala)", "ACE (I/D polymorphism)", "VEGF (rs3025039)"
  ];

  if (isAnalyzing) {
    return <AnalysisScreen onComplete={handleAnalysisComplete} />;
  }

  return (
    <WizardLayout 
      title="Genomic Data" 
      description="You can upload any of the following genes to enhance the precision of your diabetes risk prediction."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Backend Error Alert */}
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-medium">Analysis Failed: {error}</span>
          </div>
        )}

        {/* Educational Box */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
            <Dna className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-indigo-900">Supported Genes for Upload</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {supportedGenes.map((gene, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-indigo-800">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                {gene}
              </div>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Upload Genomic File</h3>
          {!genomicFile ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-primary" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">Click to upload genomic data</p>
                <p className="text-sm text-muted-foreground">Accepted formats: .vcf, .txt, .json</p>
              </div>
              <input type="file" accept=".vcf,.txt,.json" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
            </label>
          ) : (
            <div className="flex items-center justify-between p-4 border-2 border-primary bg-primary/5 rounded-xl animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <FileJson className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px] md:max-w-xs">{genomicFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(genomicFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => handleFileChange(null)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={prevStep}>Previous</Button>
          <div className="flex gap-3">
            {!genomicFile && (
              <Button type="button" variant="outline" onClick={handleSkip}>
                Skip this step
              </Button>
            )}
            <Button type="submit" size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30">
              {genomicFile ? 'Complete Assessment' : 'Complete Without Genomics'}
            </Button>
          </div>
        </div>
      </form>
    </WizardLayout>
  );
}