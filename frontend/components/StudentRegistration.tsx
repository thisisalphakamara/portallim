import React, { useState, useEffect } from 'react';
import { User, Module, RegistrationStatus, RegistrationSubmission } from '../types';
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

const defaultModules: Module[] = [
  { id: 'mod1', name: 'Fundamental of Computer Systems', code: 'FCS101', credits: 3 },
  { id: 'mod2', name: 'Mathematics for Computing', code: 'MFC102', credits: 3 },
  { id: 'mod3', name: 'Introduction to Programming', code: 'ITP103', credits: 3 },
  { id: 'mod4', name: 'Multimedia Technology', code: 'MMT104', credits: 3 },
  { id: 'mod5', name: 'Communication Skills', code: 'CS105', credits: 3 },
  { id: 'mod6', name: 'Creative Studies', code: 'CRS106', credits: 3 }
];

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
  const [enrollmentMonthYear, setEnrollmentMonthYear] = useState(
    user.enrollmentIntake || new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    if (user.enrollmentIntake) {
      setEnrollmentMonthYear(user.enrollmentIntake);
    }
  }, [user.enrollmentIntake]);

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
      studentEmail: user.email,
      faculty: user.faculty!,
      program: user.program || 'Not assigned',
      semester,
      academicYear,
      yearLevel: parseInt(academicYear.replace('Year ', ''), 10) || 1,
      enrollmentIntake: enrollmentMonthYear,
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
            enrollmentMonthYear={enrollmentMonthYear}
            onEnrollmentMonthYearChange={setEnrollmentMonthYear}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <ModuleSelectionStep
            modules={defaultModules}
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
            enrollmentMonthYear={enrollmentMonthYear}
          />
        )}
      </div>
    </div>
  );
};

export default StudentRegistration;
