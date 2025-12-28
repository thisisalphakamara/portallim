import React from 'react';
import { User } from '../../../types';
import { Input, Select, Button } from '../../ui';

interface ProfileStepProps {
  user: User;
  semester: string;
  academicYear: string;
  phoneNumber: string;
  sponsorType: string;
  onSemesterChange: (semester: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onSponsorTypeChange: (type: string) => void;
  enrollmentMonthYear: string;
  onEnrollmentMonthYearChange: (value: string) => void;
  onNext: () => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({
  user,
  semester,
  academicYear,
  phoneNumber,
  sponsorType,
  onSemesterChange,
  onPhoneNumberChange,
  onSponsorTypeChange,
  enrollmentMonthYear,
  onEnrollmentMonthYearChange,
  onNext
}) => {
  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
    value: `Semester ${i + 1}`,
    label: `Semester ${i + 1}`
  }));

  const sponsorOptions = [
    { value: 'Self', label: 'Self' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Scholarship', label: 'Scholarship' },
    { value: 'Other', label: 'Other' }
  ];

  const ReadOnlyField = ({ label, value, mono = false }: { label: string, value: string | undefined, mono?: boolean }) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1.5">{label}</p>
      <p className={`text-sm font-bold text-gray-900 ${mono ? 'font-mono' : ''}`}>{value || '-'}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start space-x-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-800 font-medium leading-relaxed">
          Please confirm your profile details before proceeding. Contact the Registrar if any information is incorrect.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest border-b border-gray-100 pb-2">Student Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Student Name" value={user.name} />
          <ReadOnlyField label="Student ID" value={user.studentId || user.id} mono />
          <ReadOnlyField label="Email Address" value={user.email} />
          <Input
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="+232 88 000 - 000"
            className="h-[58px]" // Match height of ReadOnlyField roughly
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest border-b border-gray-100 pb-2">Academic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Assigned Faculty" value={user.faculty} />
          <ReadOnlyField label="Designated Program" value={user.program || 'Not assigned'} />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Enrollment Intake</label>
            <input
              type="month"
              value={enrollmentMonthYear}
              onChange={e => onEnrollmentMonthYearChange(e.target.value)}
              className="w-full py-2.5 pl-4 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium focus:outline-none"
            />
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Pick the month and year you joined</p>
          </div>
          <Select
            label="Sponsor Type"
            value={sponsorType}
            onChange={(e) => onSponsorTypeChange(e.target.value)}
            options={sponsorOptions}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest border-b border-gray-100 pb-2">Registration Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Academic Semester"
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            options={semesterOptions}
          />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Academic Year</label>
            <div className="relative">
              <select
                className="w-full appearance-none py-2.5 pl-4 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm font-medium focus:outline-none cursor-not-allowed"
                value={academicYear}
                disabled
              >
                <option>Year 1</option>
                <option>Year 2</option>
                <option>Year 3</option>
                <option>Year 4</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} size="lg" className="w-full md:w-auto">
          Continue to Modules
        </Button>
      </div>
    </div>
  );
};

export default ProfileStep;
