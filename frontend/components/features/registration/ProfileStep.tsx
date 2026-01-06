import React, { useRef, useState } from 'react';
import { User } from '../../../types';
import { Input, Select, Button } from '../../ui';
import LoadingSpinner from '../../LoadingSpinner';

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
  studentClass: string;
  onStudentClassChange: (value: string) => void;
  onNext: () => void;
  profilePhoto?: string;
  onProfilePhotoChange?: (url: string) => void;
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
  studentClass,
  onStudentClassChange,
  onNext,
  profilePhoto,
  onProfilePhotoChange
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width !== 600 || img.height !== 600) {
        setUploadError(`Invalid dimensions: ${img.width}x${img.height}px. Image must be exactly 600x600px.`);
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('photo', file);

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/users/upload-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Upload failed');
        }

        if (onProfilePhotoChange) {
          onProfilePhotoChange(data.profilePhoto);
        }
      } catch (err: any) {
        console.error(err);
        setUploadError(err.message || 'Failed to upload photo');
      } finally {
        setUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setUploadError('Invalid image file.');
    };
  };

  const handleNext = () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      alert('Phone number is required. Please enter your phone number before proceeding.');
      return;
    }
    if (!studentClass || studentClass.trim() === '') {
      alert('Class is required. Please enter your class before proceeding.');
      return;
    }
    if (!profilePhoto) {
      alert('Profile photo is required. Please upload a 600x600 photo.');
      return;
    }
    onNext();
  };

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

      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Photo Section (Left or Top) */}
        <div className="flex-shrink-0 flex flex-col items-center space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-center">Profile Photo</h3>
          <div
            className={`relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed ${uploadError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-500'} transition-colors flex items-center justify-center cursor-pointer group`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <LoadingSpinner size="md" />
            ) : profilePhoto ? (
              <img src={profilePhoto} alt="Profile Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-xs text-gray-500 group-hover:text-blue-600 font-medium">Click to Upload</p>
                <p className="mt-1 text-[10px] text-gray-400">600x600px <br /> Max 5MB</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
          {uploadError && (
            <p className="text-xs text-red-600 font-bold max-w-[200px] text-center bg-red-50 p-2 rounded">
              {uploadError}
            </p>
          )}
          {profilePhoto && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider"
              disabled={uploading}
            >
              Change Photo
            </button>
          )}
        </div>

        {/* Info Form */}
        <div className="flex-grow space-y-6">
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest border-b border-gray-100 pb-2">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField label="Student Name" value={user.name} />
              <ReadOnlyField label="Student ID" value={user.studentId || user.id} mono />
              <ReadOnlyField label="Email Address" value={user.email} />
              <Input
                label="Phone Number *"
                type="tel"
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value)}
                placeholder="+232 88 000 - 000"
                className="h-[58px]"
                required
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
              <Input
                label="Class *"
                value={studentClass}
                onChange={(e) => onStudentClassChange(e.target.value)}
                placeholder="BSEM1101"
                required
                className="h-[48px]"
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
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} size="lg" className="w-full md:w-auto">
          Continue to Modules
        </Button>
      </div>
    </div>
  );
};

export default ProfileStep;
