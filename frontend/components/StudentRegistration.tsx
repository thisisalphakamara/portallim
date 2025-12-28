import React, { useState, useEffect } from 'react';
import { User, Module, RegistrationStatus, RegistrationSubmission } from '../types';
import { getModulesByFaculty } from '../services/admin.service';
import ApprovalTimeline from './ApprovalTimeline';
import {
  StepIndicator,
  ProfileStep,
  ModuleSelectionStep,
  ReviewStep,
  RegistrationConfirmation,
  RegistrationPending
} from './features/registration';
import { getYearForSemester, generateSubmissionId } from '../utils';

interface StudentRegistrationProps {
  user: User;
  onSubmitted: (submission: RegistrationSubmission) => void;
  existingSubmission: RegistrationSubmission | null;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({
  user,
  onSubmitted,
  existingSubmission
}) => {
  const [step, setStep] = useState(1);
  const [semester, setSemester] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('Year 1');
  const [selectedModules, setSelectedModules] = useState<Module[]>([]);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [sponsorType, setSponsorType] = useState(user.sponsorType || 'Self');
  const [facultyModules, setFacultyModules] = useState<Module[]>([]);

  useEffect(() => {
    if (user.facultyId) {
      loadModules(user.facultyId);
    }
  }, [user.facultyId]);

  const loadModules = async (facultyId: string) => {
    try {
      const result = await getModulesByFaculty(facultyId);
      if (result.success && result.modules) {
        setFacultyModules(result.modules);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  useEffect(() => {
    setAcademicYear(getYearForSemester(semester));
  }, [semester]);

  if (existingSubmission) {
    const isFullyApproved = existingSubmission.status === RegistrationStatus.APPROVED;

    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <ApprovalTimeline submission={existingSubmission} />
        </div>

        {isFullyApproved ? (
          <RegistrationConfirmation submission={existingSubmission} />
        ) : (
          <RegistrationPending />
        )}
      </div>
    );
  }

  const handleToggleModule = (mod: Module) => {
    if (selectedModules.find(m => m.id === mod.id)) {
      setSelectedModules(selectedModules.filter(m => m.id !== mod.id));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const handleSubmit = () => {
    const submission: RegistrationSubmission = {
      id: generateSubmissionId(),
      studentId: user.id,
      studentName: user.name,
      faculty: user.faculty!,
      semester,
      academicYear,
      modules: selectedModules,
      status: RegistrationStatus.PENDING_YEAR_LEADER,
      submittedAt: new Date().toISOString(),
      approvalHistory: []
    };
    onSubmitted(submission);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">
          Semester Registration
        </h2>
        <div className="flex items-center space-x-3">
          <StepIndicator current={step} step={1} label="Profile" />
          <StepIndicator current={step} step={2} label="Modules" />
          <StepIndicator current={step} step={3} label="Confirm" />
        </div>
      </div>

      <div className="bg-white border border-black p-4 md:p-6">
        {step === 1 && (
          <ProfileStep
            user={user}
            semester={semester}
            academicYear={academicYear}
            phoneNumber={phoneNumber}
            sponsorType={sponsorType}
            onSemesterChange={setSemester}
            onPhoneNumberChange={setPhoneNumber}
            onSponsorTypeChange={setSponsorType}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <ModuleSelectionStep
            modules={facultyModules}
            selectedModules={selectedModules}
            onToggleModule={handleToggleModule}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <ReviewStep
            user={user}
            semester={semester}
            academicYear={academicYear}
            phoneNumber={phoneNumber}
            sponsorType={sponsorType}
            selectedModules={selectedModules}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default StudentRegistration;
