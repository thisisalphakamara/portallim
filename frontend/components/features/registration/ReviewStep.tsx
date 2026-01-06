import React from 'react';
import { User, Module } from '../../../types';
import { Button } from '../../ui';
import { formatDate, formatIntake } from '../../../utils';

interface ReviewStepProps {
  user: User;
  semester: string;
  academicYear: string;
  phoneNumber: string;
  sponsorType: string;
  selectedModules: Module[];
  enrollmentMonthYear: string;
  profilePhoto?: string;
  onBack: () => void;
  onSubmit: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  user,
  semester,
  academicYear,
  phoneNumber,
  sponsorType,
  selectedModules,
  enrollmentMonthYear,
  profilePhoto,
  onBack,
  onSubmit
}) => {
  const SummaryItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-0.5">{label}</span>
      <span className="text-sm font-bold text-gray-900 break-words">{value}</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
          <h3 className="text-sm font-black uppercase tracking-widest">Registration Summary</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          {profilePhoto && (
            <div className="col-span-full flex justify-center mb-4">
              <div className="w-32 h-32 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <SummaryItem label="Student Name" value={user.name} />
          <SummaryItem label="Student ID" value={user.studentId || user.id} />
          <SummaryItem label="Email Address" value={user.email} />
          <SummaryItem label="Phone Number" value={phoneNumber} />
          <SummaryItem label="National ID" value={user.nationalId || 'Not provided'} />
          <SummaryItem label="Sponsor Type" value={sponsorType} />
          <SummaryItem label="Faculty" value={user.faculty || 'Not assigned'} />
          <SummaryItem label="Program" value={user.program || 'Not assigned'} />
          <SummaryItem label="Enrollment Intake" value={enrollmentMonthYear ? formatIntake(enrollmentMonthYear) : 'Not provided'} />
          <SummaryItem label="Semester / Year" value={`${semester} • ${academicYear}`} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest">Selected Modules</h3>
          <span className="px-2 py-1 bg-black text-white text-[10px] font-bold rounded-lg">{selectedModules.length} Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedModules.map((mod) => (
            <div key={mod.id} className="p-4 bg-white border border-gray-200 rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-0.5">{mod.code}</p>
                <p className="text-sm font-bold text-gray-900">{mod.name}</p>
              </div>
              <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                {mod.credits} CR
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start space-x-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-800 font-medium">
          By clicking Submit, you confirm that the selected modules and personal information are correct.
          This registration will be sent for approval.
        </p>
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-2">
        <Button variant="outline" onClick={onBack} size="lg" className="w-full md:w-auto">Modify Selection</Button>
        <Button onClick={onSubmit} size="lg" className="w-full md:w-auto bg-black hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all">Submit Registration</Button>
      </div>
    </div>
  );
};

export default ReviewStep;
