import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useSubmitAssessment } from '@/hooks/useSubmitAssessment';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button'; // Assuming you have a standard Button component
import { AnalysisScreen } from '@/pages/assessment/AnalysisScreen';

interface WizardLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  // Optional flag to explicitly show the submit button on the final step
  showSubmitButton?: boolean; 
}

export const WizardLayout = ({ title, description, children, showSubmitButton = false }: WizardLayoutProps) => {
  const { currentStep, totalSteps } = useAssessmentStore();
  const navigate = useNavigate();
  
  // Custom hook containing our API mapping and routing logic
  const { submitAssessment, error } = useSubmitAssessment();
  
  // UI State for the submission sequence
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);

  /**
   * Triggers the ML API call in the background while instantly 
   * throwing up the hacker-terminal Analysis Screen for UX.
   */
  const handleGenerateReport = async () => {
    setShowAnalysis(true);
    
    try {
      const result = await submitAssessment();
      setPredictionData(result);
    } catch (err) {
      // If the API fails quickly, hide the animation so the user can see the error
      setShowAnalysis(false);
      console.error("AI Diagnostics Failed:", err);
    }
  };

  /**
   * Only transitions to the results dashboard once the 8.5s animation 
   * has fully completed AND the data is ready.
   */
  const handleAnimationComplete = () => {
    if (predictionData) {
      navigate('/dashboard/results', { state: { results: predictionData } });
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative">
        
        {/* 1. Progress Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
            <div>
              <span className="text-primary-600 font-bold tracking-wide text-xs md:text-sm uppercase">
                Step {currentStep} of {totalSteps}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{title}</h1>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </div>
          </div>

          {/* 2. Segmented Progress Bar */}
          <div className="flex gap-2 h-2">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const stepNum = index + 1;
              const isActive = stepNum <= currentStep;
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "h-full flex-1 rounded-full transition-all duration-500",
                    isActive ? "bg-primary-500" : "bg-gray-200"
                  )}
                />
              );
            })}
          </div>
          
          {description && (
            <p className="text-gray-500 text-base md:text-lg">{description}</p>
          )}
        </div>

        {/* 3. Form Content - RESPONSIVE: Less padding on mobile */}
        <div className="bg-white p-4 md:p-8 rounded-xl shadow-soft border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
          {children}

          {/* 4. Global Error Handling (from the ML endpoints) */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-in fade-in duration-300">
              <span className="font-bold">Diagnostic Error: </span> 
              {error}
            </div>
          )}

          {/* 5. Final Submission Trigger */}
          {(isLastStep || showSubmitButton) && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <Button 
                onClick={handleGenerateReport} 
                className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
              >
                Initialize AI Diagnostics
              </Button>
            </div>
          )}
        </div>

        {/* 6. Render the Full-Screen Analysis Overlay when active */}
        {showAnalysis && (
          <AnalysisScreen onComplete={handleAnimationComplete} />
        )}

      </div>
    </AppLayout>
  );
};