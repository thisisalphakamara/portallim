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
import { getModulesByFaculty } from '../services/admin.service';

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
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
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

  // Fetch modules when semester or academic year changes
  useEffect(() => {
    const fetchModules = async () => {
      const semesterNumber = parseInt(semester.replace('Semester ', ''));
      const yearLevel = parseInt(academicYear.replace('Year ', ''));

      if (isNaN(semesterNumber) || isNaN(yearLevel)) {
        console.warn('Invalid semester or year level');
        return;
      }

      setModulesLoading(true);
      try {
        // Modules are shared across all faculties in this MVP, so we don't
        // need to filter by faculty when fetching them.
        const result = await getModulesByFaculty('', semesterNumber, yearLevel);
        if (result.success && result.modules) {
          setAvailableModules(result.modules);
          // Clear selected modules if they're not in the new list
          setSelectedModules(prev => 
            prev.filter(selected => 
              result.modules.some((m: Module) => m.id === selected.id)
            )
          );
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setModulesLoading(false);
      }
    };

    // Only fetch if we're on step 2 or about to go to step 2
    if (step >= 2) {
      fetchModules();
    }
  }, [semester, academicYear, step]);

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
            modules={availableModules}
            selectedModules={selectedModules}
            onToggleModule={handleToggleModule}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            loading={modulesLoading}
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
