export interface ModuleData {
  name: string;
  code: string;
  credits: number;
  semester: number;
  yearLevel: number;
}

// Year 1, Semester 1
const YEAR1_SEMESTER1: ModuleData[] = [
  { name: 'Civic Education', code: 'CE101', credits: 3, semester: 1, yearLevel: 1 },
  { name: 'French Language 1', code: 'FL101', credits: 3, semester: 1, yearLevel: 1 },
  { name: 'Introduction to Communication & Study Skills', code: 'ICSS101', credits: 3, semester: 1, yearLevel: 1 },
  { name: 'Introduction to Computer Skills', code: 'ICS101', credits: 3, semester: 1, yearLevel: 1 },
  { name: 'Creative & Innovation Studies', code: 'CIS101', credits: 3, semester: 1, yearLevel: 1 },
  { name: 'Principles of Programming Logic & Design', code: 'PPLD101', credits: 3, semester: 1, yearLevel: 1 },
];

// Year 1, Semester 2
const YEAR1_SEMESTER2: ModuleData[] = [
  { name: 'Computerised Mathematics', code: 'CM102', credits: 3, semester: 2, yearLevel: 1 },
  { name: 'Principles of Software Engineering', code: 'PSE102', credits: 3, semester: 2, yearLevel: 1 },
  { name: 'Introduction to Data Communication', code: 'IDC102', credits: 3, semester: 2, yearLevel: 1 },
  { name: 'Introduction to Databases', code: 'IDB102', credits: 3, semester: 2, yearLevel: 1 },
  { name: 'Introduction to Multimedia', code: 'IMM102', credits: 3, semester: 2, yearLevel: 1 },
  { name: 'Principles of Structured Programming', code: 'PSP102', credits: 3, semester: 2, yearLevel: 1 },
];

// Year 2, Semester 3
const YEAR2_SEMESTER3: ModuleData[] = [
  { name: 'Communication in the New Economy', code: 'CNE201', credits: 3, semester: 3, yearLevel: 2 },
  { name: 'Database Systems', code: 'DBS201', credits: 3, semester: 3, yearLevel: 2 },
  { name: 'Software Engineering', code: 'SE201', credits: 3, semester: 3, yearLevel: 2 },
  { name: 'Object Oriented Programming Methods 1', code: 'OOPM1201', credits: 3, semester: 3, yearLevel: 2 },
  { name: 'Fundamentals of Computer Systems', code: 'FCS201', credits: 3, semester: 3, yearLevel: 2 },
  { name: 'Introduction to Digital Imaging', code: 'IDI201', credits: 3, semester: 3, yearLevel: 2 },
];

// Year 2, Semester 4
const YEAR2_SEMESTER4: ModuleData[] = [
  { name: 'Object Oriented Programming Methods 2', code: 'OOPM2202', credits: 3, semester: 4, yearLevel: 2 },
  { name: 'Sound Production', code: 'SP202', credits: 3, semester: 4, yearLevel: 2 },
  { name: 'Probability & Statistics', code: 'PS202', credits: 3, semester: 4, yearLevel: 2 },
  { name: 'Multimedia Authoring', code: 'MMA202', credits: 3, semester: 4, yearLevel: 2 },
  { name: 'Web Design 1', code: 'WD1202', credits: 3, semester: 4, yearLevel: 2 },
  { name: 'Introduction to Video Technology', code: 'IVT202', credits: 3, semester: 4, yearLevel: 2 },
];

// Year 3, Semester 5
const YEAR3_SEMESTER5: ModuleData[] = [
  { name: 'System Analysis & Design', code: 'SAD301', credits: 3, semester: 5, yearLevel: 3 },
  { name: 'Data Communications & Networking', code: 'DCN301', credits: 3, semester: 5, yearLevel: 3 },
  { name: 'Computer Graphics 1', code: 'CG1301', credits: 3, semester: 5, yearLevel: 3 },
  { name: 'Web Programming Techniques', code: 'WPT301', credits: 3, semester: 5, yearLevel: 3 },
  { name: 'Human Computer Interaction', code: 'HCI301', credits: 3, semester: 5, yearLevel: 3 },
  { name: 'Data Structures and Algorithm Analysis', code: 'DSAA301', credits: 3, semester: 5, yearLevel: 3 },
];

// Year 3, Semester 6
const YEAR3_SEMESTER6: ModuleData[] = [
  { name: 'Animation Studies 1', code: 'AS1302', credits: 3, semester: 6, yearLevel: 3 },
  { name: 'Interactive Multimedia', code: 'IMM302', credits: 3, semester: 6, yearLevel: 3 },
  { name: 'Research Methodology', code: 'RM302', credits: 3, semester: 6, yearLevel: 3 },
  { name: 'IT Project Management', code: 'ITPM302', credits: 3, semester: 6, yearLevel: 3 },
  { name: 'IT Intellectual Property Rights and Ethics', code: 'ITIPRE302', credits: 3, semester: 6, yearLevel: 3 },
  { name: 'Fundamentals of Entrepreneurship', code: 'FOE302', credits: 3, semester: 6, yearLevel: 3 },
];

// Year 4, Semester 7
const YEAR4_SEMESTER7: ModuleData[] = [
  { name: 'Software Testing & Reliability', code: 'STR401', credits: 3, semester: 7, yearLevel: 4 },
  { name: 'Character Animation', code: 'CA401', credits: 3, semester: 7, yearLevel: 4 },
  { name: 'Virtual Reality', code: 'VR401', credits: 3, semester: 7, yearLevel: 4 },
  { name: 'Digital Production', code: 'DP401', credits: 3, semester: 7, yearLevel: 4 },
  { name: 'Interactive Multimedia', code: 'IMM402', credits: 3, semester: 7, yearLevel: 4 },
  { name: 'Research Project', code: 'RP401', credits: 3, semester: 7, yearLevel: 4 },
];

// Year 4, Semester 8
const YEAR4_SEMESTER8: ModuleData[] = [
  { name: 'Practical Internship', code: 'PI402', credits: 3, semester: 8, yearLevel: 4 },
  { name: 'Internship Report', code: 'IR402', credits: 3, semester: 8, yearLevel: 4 },
];

// Combine all modules
export const ALL_MODULES: ModuleData[] = [
  ...YEAR1_SEMESTER1,
  ...YEAR1_SEMESTER2,
  ...YEAR2_SEMESTER3,
  ...YEAR2_SEMESTER4,
  ...YEAR3_SEMESTER5,
  ...YEAR3_SEMESTER6,
  ...YEAR4_SEMESTER7,
  ...YEAR4_SEMESTER8,
];

// Helper function to get modules by semester
export const getModulesBySemester = (semester: number): ModuleData[] => {
  return ALL_MODULES.filter(module => module.semester === semester);
};

// Helper function to get modules by year level
export const getModulesByYearLevel = (yearLevel: number): ModuleData[] => {
  return ALL_MODULES.filter(module => module.yearLevel === yearLevel);
};

// Helper function to get modules by semester and year level
export const getModulesBySemesterAndYear = (semester: number, yearLevel: number): ModuleData[] => {
  return ALL_MODULES.filter(module => module.semester === semester && module.yearLevel === yearLevel);
};


