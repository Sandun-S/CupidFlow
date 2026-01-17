import { useState } from 'react';
import BasicInfo from './steps/BasicInfo';
import FamilyDetails from './steps/FamilyDetails';
import Interests from './steps/Interests';
import PhotoUpload from './steps/PhotoUpload';


const steps = ["Basic Info", "Family", "Lifestyle", "Verification"];

export default function ProfileWizard() {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep((p) => p - 1);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <BasicInfo />;
            case 1: return <FamilyDetails />;
            case 2: return <Interests />;
            case 3: return <PhotoUpload />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {steps.map((label, idx) => (
                            <span key={idx} className={`text-xs font-medium ${idx <= currentStep ? 'text-pink-600' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                    {renderStep()}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`px-6 py-2 rounded-lg border ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={nextStep}
                        className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
