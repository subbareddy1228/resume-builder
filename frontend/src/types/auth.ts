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
  photo_url?: string;
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

export type TemplateId =
  | "classic"
  | "modern"
  | "minimal"
  | "bold"
  | "executive"
  | "creative";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;       // hex for thumbnail
  bg: string;           // hex for thumbnail bg
  textColor: string;    // hex for thumbnail text
  tag: string;          // e.g. "Popular", "ATS-safe"
}

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional serif layout. ATS-safe, universally accepted.",
    accent: "#3E5C46",
    bg: "#FBF8F1",
    textColor: "#1F2620",
    tag: "ATS-safe",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Left sidebar with accent bar. Clean and contemporary.",
    accent: "#2563EB",
    bg: "#F8FAFC",
    textColor: "#0F172A",
    tag: "Popular",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Maximum whitespace. Pure typography, zero decoration.",
    accent: "#111827",
    bg: "#FFFFFF",
    textColor: "#111827",
    tag: "Clean",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Dark header, strong contrast. Makes an impression.",
    accent: "#F59E0B",
    bg: "#111827",
    textColor: "#F9FAFB",
    tag: "Striking",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Double rule dividers, condensed type. Senior roles.",
    accent: "#7C3AED",
    bg: "#FAFAF9",
    textColor: "#1C1917",
    tag: "Senior",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Colored left panel, modern grid. Design & tech roles.",
    accent: "#0D9488",
    bg: "#F0FDFA",
    textColor: "#134E4A",
    tag: "Creative",
  },
];
