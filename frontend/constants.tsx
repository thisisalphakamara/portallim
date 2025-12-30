
import { Faculty, Module, UserRole, RegistrationStatus } from './types';

export const FACULTIES: Faculty[] = [
  'Faculty of Information & Communication Technology (FICT)',
  'Faculty of Architecture & The Built Environment (FABE)',
  'Faculty of Communication, Media & Broadcasting (FCMB)'
];

export const PROGRAMS_BY_FACULTY: Record<Faculty, string[]> = {
  'Faculty of Information & Communication Technology (FICT)': [
    'Information Technology (BIT)',
    'Software Engineering with Multimedia (BSEM)',
    'Business Information Technology (BBIT)',
    'Information and Communication Technology (BICT)',
    'Mobile Computing',
    'Cloud Computing Technology'
  ],
  'Faculty of Architecture & The Built Environment (FABE)': [
    'Architectural Studies',
    'Interior Architecture',
    'Landscape Architecture',
    'Construction Management',
    'Architectural Technology',
    'Interior Design'
  ],
  'Faculty of Communication, Media & Broadcasting (FCMB)': [
    'Broadcasting and Journalism',
    'Professional Communication',
    'Digital Film and Television',
    'Event Management',
    'Public Relations',
    'Journalism and Media',
    'Broadcasting (Radio & TV)'
  ]
};



export const LOGO_URL = "https://static.wixstatic.com/media/07817b_8109d949479b441f9d5018610332881a~mv2.png/v1/fill/w_1000,h_1000,al_c,q_90/07817b_8109d949479b441f9d5018610332881a~mv2.png";
