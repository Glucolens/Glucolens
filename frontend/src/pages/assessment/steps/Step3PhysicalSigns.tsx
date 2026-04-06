import React, { useRef } from 'react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { WizardLayout } from '../WizardLayout';
import { Button } from '@/components/ui/Button'; 
import { Camera, X, ImageIcon } from 'lucide-react';

export default function Step3PhysicalSigns() {
  // FIX: Extracted nextStep and prevStep from the store
  const { data, updateData, nextStep, prevStep } = useAssessmentStore();
  
  const retinaInputRef = useRef<HTMLInputElement>(null);
  const skinInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, modality: 'retina' | 'skin') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (modality === 'retina') {
      updateData({ retinaImageFile: file, retinaImagePreviewUrl: previewUrl });
    } else {
      updateData({ skinImageFile: file, skinImagePreviewUrl: previewUrl });
    }
  };

  const handleRemoveImage = (modality: 'retina' | 'skin') => {
    if (modality === 'retina') {
      updateData({ retinaImageFile: null, retinaImagePreviewUrl: null });
      if (retinaInputRef.current) retinaInputRef.current.value = '';
    } else {
      updateData({ skinImageFile: null, skinImagePreviewUrl: null });
      if (skinInputRef.current) skinInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    return () => {
      if (data.retinaImagePreviewUrl) URL.revokeObjectURL(data.retinaImagePreviewUrl);
      if (data.skinImagePreviewUrl) URL.revokeObjectURL(data.skinImagePreviewUrl);
    };
  }, [data.retinaImagePreviewUrl, data.skinImagePreviewUrl]);

  return (
    // FIX: Wrapped the entire step in WizardLayout to match Step 1 and 4
    <WizardLayout 
      title="Physical Signs" 
      description="Upload images for visual analysis of potential insulin resistance markers."
    >
      <div className="space-y-8">
        {/* RETINA SCAN UPLOAD */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retina Scan (Optional)</h3>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={retinaInputRef}
            onChange={(e) => handleFileChange(e, 'retina')}
          />

          {!data.retinaImagePreviewUrl ? (
            <div 
              onClick={() => retinaInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Camera className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-4">Click or drag to upload a high-resolution retina scan</p>
              <Button variant="outline" type="button" onClick={(e) => { e.stopPropagation(); retinaInputRef.current?.click(); }}>
                Browse Files
              </Button>
            </div>
          ) : (
            <div className="relative inline-block mt-4">
              <img 
                src={data.retinaImagePreviewUrl} 
                alt="Retina Preview" 
                className="h-48 w-auto rounded-lg object-cover border"
              />
              <Button 
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => handleRemoveImage('retina')}
                className="absolute -top-3 -right-3 rounded-full p-2 h-8 w-8 flex items-center justify-center shadow-md"
              >
                <X size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* SKIN SCAN UPLOAD */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skin Assessment (Acanthosis Nigricans)</h3>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={skinInputRef}
            onChange={(e) => handleFileChange(e, 'skin')}
          />

          {!data.skinImagePreviewUrl ? (
            <div 
              onClick={() => skinInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-4">Click or drag to upload a clear image of the neck or armpit fold</p>
              <Button variant="outline" type="button" onClick={(e) => { e.stopPropagation(); skinInputRef.current?.click(); }}>
                Browse Files
              </Button>
            </div>
          ) : (
            <div className="relative inline-block mt-4">
              <img 
                src={data.skinImagePreviewUrl} 
                alt="Skin Preview" 
                className="h-48 w-auto rounded-lg object-cover border"
              />
              <Button 
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => handleRemoveImage('skin')}
                className="absolute -top-3 -right-3 rounded-full p-2 h-8 w-8 flex items-center justify-center shadow-md"
              >
                <X size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* FIX: ADDED NAVIGATION BLOCK */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={prevStep}>
            Previous
          </Button>
          
          <div className="flex gap-3">
            {/* If no images are uploaded, show Skip, otherwise show Next */}
            {!data.retinaImageFile && !data.skinImageFile && (
              <Button type="button" variant="outline" onClick={nextStep}>
                Skip this step
              </Button>
            )}
            <Button type="button" size="lg" className="px-8" onClick={nextStep}>
              Next
            </Button>
          </div>
        </div>

      </div>
    </WizardLayout>
  );
}