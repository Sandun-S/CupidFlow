import { useState } from 'react';
import BasicInfo from './steps/BasicInfo';
import FamilyDetails from './steps/FamilyDetails';
import Interests from './steps/Interests';
import PhotoUpload from './steps/PhotoUpload';
import Lifestyle from './steps/Lifestyle';
import { User, Users, Coffee, Heart, Camera } from 'lucide-react';

const steps = [
    { label: "Basic Info", icon: User },
    { label: "Family", icon: Users },
    { label: "Lifestyle", icon: Coffee },
    { label: "Interests", icon: Heart },
    { label: "Photos", icon: Camera }
];

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
            case 2: return <Lifestyle />;
            case 3: return <Interests />;
            case 4: return <PhotoUpload />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
                {/* Progress Bar & Stepper */}
                <div className="mb-8">
                    <div className="flex justify-between items-center relative z-10">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = idx === currentStep;
                            const isCompleted = idx < currentStep;

                            return (
                                <div key={idx} className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 
                                        ${isActive ? 'bg-pink-600 border-pink-600 text-white scale-110 shadow-md' :
                                                isCompleted ? 'bg-pink-100 border-pink-600 text-pink-600' :
                                                    'bg-white border-gray-300 text-gray-400'}`}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <span className={`text-xs font-medium mt-2 transition-colors duration-300 ${isActive ? 'text-pink-600 font-bold' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                        {/* Connecting Line (Behind) */}
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2 px-4">
                            <div
                                className="h-full bg-pink-200 transition-all duration-300"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            />
                        </div>
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
