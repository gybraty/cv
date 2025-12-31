import { z } from 'zod';

export interface Resume {
  _id: string;
  title: string;
  status: 'draft' | 'analyzed' | 'exported';
  rawData?: string;
  structuredData?: ResumeData;
  updatedAt: string;
  userId: string;
}



export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
});

export const ExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const EducationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.string().optional(),
});

export const ResumeDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experience: z.array(ExperienceSchema).optional(),
  education: z.array(EducationSchema).optional(),
  skills: z.array(SkillSchema).optional(),
});

export const SimpleResumeDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experience: z.array(ExperienceSchema).optional().default([]),
  education: z.array(EducationSchema).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  summary: z.string().optional(),
});

export type ResumeData = z.infer<typeof SimpleResumeDataSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
