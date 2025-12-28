
import { Faculty, Module, UserRole, RegistrationStatus } from './types';

export const FACULTIES: Faculty[] = [
  'Faculty of Design Innovation',
  'Faculty of Multimedia Creativity',
  'Faculty of Information Technology',
  'Faculty of Business Management'
];

export const PROGRAMS_BY_FACULTY: Record<Faculty, string[]> = {
  'Faculty of Information Technology': [
    'BSc Software Engineering with Multimedia',
    'BSc Computer Science',
    'BSc Information Systems',
    'BSc Cybersecurity',
    'BSc Data Science and Analytics',
    'BSc Network Engineering',
    'BSc Mobile Computing'
  ],
  'Faculty of Design Innovation': [
    'BA Industrial Design',
    'BA Graphic Design',
    'BA Interior Architecture',
    'BA Product Design',
    'BA Fashion Design',
    'BA Visual Communication Design'
  ],
  'Faculty of Multimedia Creativity': [
    'BA Digital Film and Television',
    'BA Animation',
    'BA Game Design',
    'BA Interactive Multimedia',
    'BA Sound Design',
    'BA Broadcasting and Journalism'
  ],
  'Faculty of Business Management': [
    'BA Business Administration',
    'BA Marketing',
    'BA Finance and Banking',
    'BA International Business',
    'BA Entrepreneurship',
    'BA Human Resource Management',
    'BA Accounting'
  ]
};



export const LOGO_URL = "https://static.wixstatic.com/media/07817b_8109d949479b441f9d5018610332881a~mv2.png/v1/fill/w_1000,h_1000,al_c,q_90/07817b_8109d949479b441f9d5018610332881a~mv2.png";
