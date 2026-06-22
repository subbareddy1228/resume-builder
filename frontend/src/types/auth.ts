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

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
}

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
  projects: {
    id: string;
    name: string;
    description: string;
    tech: string;
    link: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    year: string;
  }[];
  internships: {
    id: string;
    company: string;
    role: string;
    start: string;
    end: string;
    bullets: string[];
  }[];
}

export type TemplateId = "classic" | "modern" | "minimal" | "bold";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
}

export const TEMPLATES: Template[] = [
  { id: "classic", name: "Classic", description: "Traditional layout, serif headings" },
  { id: "modern", name: "Modern", description: "Clean lines, accent colors" },
  { id: "minimal", name: "Minimal", description: "Ultra clean, maximum whitespace" },
  { id: "bold", name: "Bold", description: "Strong headers, high contrast" },
];
