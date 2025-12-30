import React from 'react';
import { Module } from '../../../types';
import { Button } from '../../ui';
import { calculateTotalCredits } from '../../../utils';
import LoadingSpinner from '../../LoadingSpinner';

interface ModuleSelectionStepProps {
  modules: Module[];
  selectedModules: Module[];
  onToggleModule: (module: Module) => void;
  onBack: () => void;
  onNext: () => void;
  loading?: boolean;
}

const ModuleSelectionStep: React.FC<ModuleSelectionStepProps> = ({
  modules,
  selectedModules,
  onToggleModule,
  onBack,
  onNext,
  loading = false
}) => {
  const totalCredits = calculateTotalCredits(selectedModules);
  const isValid = selectedModules.length === 6;

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Select Modules</h3>
            <p className="text-xs text-gray-500">Loading modules for this semester...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Select Modules</h3>
          <p className="text-xs text-gray-500">Please select exactly 6 modules for this semester.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg self-start md:self-auto">
          <div className="text-xs font-bold">
            Selected: <span className={`${selectedModules.length === 6 ? 'text-green-600' : 'text-black'}`}>{selectedModules.length}/6</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="text-xs font-bold">
            Credits: <span>{totalCredits}</span>
          </div>
        </div>
      </div>
      
      {modules.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
          <p className="text-xs font-bold text-yellow-800">
            No modules available for this semester. Please contact your administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((mod) => {
          const checked = !!selectedModules.find((m) => m.id === mod.id);
          return (
            <label
              key={mod.id}
              className={`
                relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                ${checked 
                  ? 'border-black bg-gray-50 shadow-sm' 
                  : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleModule(mod)}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black transition-all"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-start">
                  <span className={`font-bold text-sm ${checked ? 'text-black' : 'text-gray-900'}`}>{mod.name}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 ml-2 whitespace-nowrap">
                    {mod.credits} CR
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-1">{mod.code}</p>
                {checked && (
                  <div className="absolute top-0 right-0 p-2">
                     <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
        </div>
      )}

      {!isValid && (
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start space-x-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs font-bold text-yellow-800 leading-relaxed">
            Selection incomplete. You must select exactly 6 modules to proceed with registration.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onBack} size="lg" className="w-full md:w-auto">Back</Button>
        <Button onClick={onNext} disabled={!isValid} size="lg" className="w-full md:w-auto">Review & Submit</Button>
      </div>
    </div>
  );
};

export default ModuleSelectionStep;
