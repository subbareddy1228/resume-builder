export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// add to bottom of src/types/auth.ts

export interface ResumeContent {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: {
    id: string;
    company: string;
    role: string;
    start: string;
    end: string;
    bullets: string[];
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    year: string;
  }[];
  skills: string[];
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
}
