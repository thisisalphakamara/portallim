
import { Faculty, Module, UserRole, RegistrationStatus } from './types';

export const FACULTIES: Faculty[] = [
  'Faculty of Design Innovation',
  'Faculty of Information & Communication Technology',
  'Faculty of Business Management & Globalisation',
  'Faculty of Communication, Media & Broadcasting',
  'Faculty of Architecture & The Built Environment',
  'Faculty of Multimedia Creativity',
  'Faculty of Fashion & Lifestyle Creativity'
];

export const PROGRAMS_BY_FACULTY: Record<Faculty, string[]> = {
  'Faculty of Design Innovation': [
    'Professional Design (Visual Communication)',
    'Industrial Design',
    'Brand Packaging Design',
    'Product Design & Innovation',
    'Graphic Design',
    'Product Design',
    'Packaging Design & Technology'
  ],
  'Faculty of Information & Communication Technology': [
    'Information Technology (BIT)',
    'Software Engineering with Multimedia (BSEM)',
    'Business Information Technology (BBIT)',
    'Information and Communication Technology (BICT)',
    'Mobile Computing',
    'Cloud Computing Technology'
  ],
  'Faculty of Business Management & Globalisation': [
    'Business Administration',
    'International Business',
    'Accounting',
    'Marketing',
    'Human Resource Management',
    'Entrepreneurship'
  ],
  'Faculty of Communication, Media & Broadcasting': [
    'Broadcasting and Journalism',
    'Professional Communication',
    'Digital Film and Television',
    'Event Management',
    'Public Relations',
    'Journalism and Media',
    'Broadcasting (Radio & TV)'
  ],
  'Faculty of Architecture & The Built Environment': [
    'Architectural Studies',
    'Interior Architecture',
    'Landscape Architecture',
    'Construction Management',
    'Architectural Technology',
    'Interior Design'
  ],
  'Faculty of Multimedia Creativity': [
    'Creative Multimedia',
    'Games Design',
    'Animation',
    'Games Art Development',
    'Animation & Multimedia Design',
    'Games Art'
  ],
  'Faculty of Fashion & Lifestyle Creativity': [
    'Fashion and Retailing',
    'Fashion Design',
    'Fashion and Apparel Design',
    'Hair Design',
    'Batik Design'
  ]
};



export const LOGO_URL = "https://static.wixstatic.com/media/07817b_8109d949479b441f9d5018610332881a~mv2.png/v1/fill/w_1000,h_1000,al_c,q_90/07817b_8109d949479b441f9d5018610332881a~mv2.png";
