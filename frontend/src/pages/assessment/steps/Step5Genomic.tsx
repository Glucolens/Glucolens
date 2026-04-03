import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '@/store/assessmentStore';
import { WizardLayout } from '../WizardLayout';
import { Button } from '@/components/ui/Button';
import { UploadCloud, X, FileJson, Dna, Info } from 'lucide-react';
import { AnalysisScreen } from '../AnalysisScreen'; // Import the existing screen

interface Step5Form {
  genomicFile: File | null;
}

export default function Step5Genomic() {
  const { data, updateData, prevStep, resetData } = useAssessmentStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  
  const { handleSubmit, setValue, watch } = useForm<Step5Form>({
    defaultValues: {
      genomicFile: data.genomicFile
    }
  });

  const genomicFile = watch('genomicFile');

  const onSubmit = async (formData: Step5Form) => {
    // 1. Show the Analysis Overlay immediately
    setIsAnalyzing(true);
    
    // 2. Save final step data to store
    updateData(formData);

    try {
      // 3. Trigger the ML API call in the background
    } catch (error) {
      console.error("Failed to submit assessment:", error);
    }
  };

  const handleAnalysisComplete = () => {
    // 4. When the 8-second animation is totally done, route to dashboard
    setIsAnalyzing(false);
    resetData(); // Clear the wizard state so it's fresh for next time
    navigate('/dashboard'); 
  };

  const handleSkip = () => {
    handleSubmit(onSubmit)();
  };

  const handleFileChange = (file: File | null) => {
    setValue('genomicFile', file, { shouldValidate: true });
  };

  const supportedGenes = [
    "TCF7L2 (rs7903146)", "APOL1 (G1/G2 variants)", "APO1 variants", 
    "G6PD (rs1050878-T)", "KCNJ11 (rs5219, E23K)", "ABCC8 (C49620T)", 
    "HRANB3 / ZRANB3", "PPARG (Pro12Ala)", "ACE (I/D polymorphism)", "VEGF (rs3025039)"
  ];

  // If analyzing, completely take over the screen with the Analysis component
  if (isAnalyzing) {
    return <AnalysisScreen onComplete={handleAnalysisComplete} />;
  }

  return (
    <WizardLayout 
      title="Genomic Data" 
      description="You can upload any of the following genes to enhance the precision of your diabetes risk prediction."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
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
          <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors pt-2 mt-2 border-t border-indigo-100/50 w-full">
            <Info className="w-4 h-4" />
            Why do these genes matter?
          </button>
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
              <input 
                type="file" accept=".vcf,.txt,.json,application/json,text/plain" className="hidden" 
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)} 
              />
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
            <Button 
              type="submit" 
              size="lg" 
              className="px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30"
            >
              {genomicFile ? 'Complete Assessment' : 'Complete Without Genomics'}
            </Button>
          </div>
        </div>
      </form>
    </WizardLayout>
  );
}