import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { z } from 'zod';

const ResumeDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    linkedin: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
  }),
  summary: z.string().nullable().optional(),
  experience: z.array(
    z.object({
      company: z.string().nullable().optional(),
      position: z.string().nullable().optional(),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string().nullable().optional(),
      degree: z.string().nullable().optional(),
      fieldOfStudy: z.string().nullable().optional(),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
    }),
  ),
  skills: z.array(z.string()),
  projects: z
    .array(
      z.object({
        name: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        url: z.string().nullable().optional(),
        technologies: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  languages: z.array(z.string()).optional(),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error(
        'GEMINI_API_KEY is not defined in environment variables',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async analyze(text: string): Promise<ResumeData> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestException('Input text is empty');
    }

    const systemPrompt = `You are an expert HR and Resume Writer. Your task is to analyze the unstructured text provided by the user and extract structured data for a professional resume.
    
    CRITICAL: You must output a JSON object that STRICTLY matches the following structure. Do not use snake_case. Use camelCase keys exactly as shown below:

    {
      "personalInfo": {
        "fullName": "String or null",
        "email": "String or null",
        "phone": "String or null",
        "location": "String or null",
        "linkedin": "String or null",
        "website": "String or null"
      },
      "summary": "String or null",
      "experience": [
        {
          "company": "String",
          "position": "String",
          "startDate": "MM/YYYY or null",
          "endDate": "MM/YYYY or Present or null",
          "description": "String or null",
          "highlights": ["String"]
        }
      ],
      "education": [
        {
          "institution": "String",
          "degree": "String",
          "fieldOfStudy": "String or null",
          "startDate": "String or null",
          "endDate": "String or null"
        }
      ],
      "skills": ["String"],
      "projects": [
        {
          "name": "String",
          "description": "String",
          "url": "String or null",
          "technologies": ["String"]
        }
      ],
      "languages": ["String"]
    }

    - Correction: Fix typos and improve the professional tone of descriptions.
    - Formatting: Ensure dates are in MM/YYYY format.
    - Missing Info: If a field is missing, leave it as null or empty string, do not hallucinate.
    - Output: STRICT JSON only.`;

    try {
      const result = await this.model.generateContent([systemPrompt, text]);
      const response = result.response;
      let textResponse = response.text();

      textResponse = textResponse
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');

      const parsedData: unknown = JSON.parse(textResponse);
      const validatedData = ResumeDataSchema.parse(parsedData);

      return validatedData;
    } catch (error) {
      this.logger.error('AI Processing Error:', error);
      if (error instanceof z.ZodError) {
        throw new BadRequestException(
          'AI failed to structure data correctly: Validation Error',
        );
      }
      throw new BadRequestException('AI failed to structure data correctly');
    }
  }
}
