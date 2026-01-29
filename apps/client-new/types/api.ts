import { z } from 'zod';

export interface UserProfile {
  fullName?: string;
  avatarUrl?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  onboardingCompleted: boolean;
}

export interface User {
  _id: string;
  supabaseId: string;
  email: string;
  profile: UserProfile;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  profile?: UserProfile;
  settings?: Partial<UserSettings>;
}

export interface CreateResumeDto {
  title: string;
}

// Importing ResumeData from schemas to avoid circular dependency if I put schemas here,
// but usually schemas go in lib/schemas.ts and types here.
// I will define the ResumeData interface here manually or import it if I can.
// Better: define the interface here matching the Zod schema structure.

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  location?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  highlights?: string[];
}

export interface Education {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Project {
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
  languages?: string[];
  summary?: string;
}

// In the old code, there were two schemas. I'll define ResumeData to match the `SimpleResumeDataSchema` as that seemed to be the main one or at least widely used.
// Actually, let's look at `apps/client/src/types/resume.ts` again.
// It exports `ResumeData` as `z.infer<typeof SimpleResumeDataSchema>`.
// And `SimpleResumeDataSchema` has `skills: z.array(z.string())`.
// So `skills` is `string[]`.

export interface Resume {
  _id: string;
  title: string;
  status: 'draft' | 'analyzed' | 'exported';
  rawData?: string;
  structuredData?: ResumeData;
  updatedAt: string;
  userId: string;
  createdAt?: string; // Often present
}

export interface UpdateResumeDto {
  title?: string;
  rawData?: string;
  structuredData?: ResumeData;
  status?: 'draft' | 'analyzed' | 'exported';
}
