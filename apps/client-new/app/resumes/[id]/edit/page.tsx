'use client';

import React, { useEffect, useState, use, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, analyzeResumeStream } from '@/lib/api-client';
import { Resume, ResumeData } from '@/types/api';
import { useDebounce } from '@/hooks/use-debounce';
import { ResumeDataSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save, Wand2, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResumeEditorPage({ params }: PageProps) {
  // Unwrap params using React.use() if it's a promise (Next.js 15 pattern) or await it.
  // Since this is a client component, params are passed as props, but in Next 15 they might be promises.
  // To be safe and compatible with 15 (which was in package.json), I'll treat it as a promise.
  const { id } = use(params);

  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('raw');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamProgress, setStreamProgress] = useState('');

  // 1. Fetch Resume
  const { data: resume, isLoading, isError } = useQuery({
    queryKey: ['resume', id],
    queryFn: async () => {
      const response = await apiClient.get<Resume>(`/resumes/${id}`);
      return response.data;
    },
  });

  // 2. Form Setup (Structured Data)
  const form = useForm<ResumeData>({
    resolver: zodResolver(ResumeDataSchema),
    defaultValues: {
      personalInfo: { fullName: '', email: '' },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      languages: [],
      summary: '',
    },
  });

  const { reset, watch, control } = form;

  // 3. Sync Server Data to Local State
  const [rawData, setRawData] = useState('');

  useEffect(() => {
    if (resume) {
      if (resume.rawData) setRawData(resume.rawData);
      if (resume.structuredData) reset(resume.structuredData);
    }
  }, [resume, reset]);

  // 4. Auto-Save Logic
  // A. Raw Data
  const debouncedRawData = useDebounce(rawData, 1000);

  const updateResumeMutation = useMutation({
    mutationFn: async (data: Partial<Resume>) => {
      await apiClient.patch(`/resumes/${id}`, data);
    },
    onSuccess: () => {
       // Optional: invalidate queries if needed, but we don't want to re-fetch and overwrite local state while typing
       // queryClient.invalidateQueries({ queryKey: ['resume', id] });
    },
    onError: () => {
        toast.error('Failed to save changes');
    }
  });

  useEffect(() => {
    if (!resume) return;
    if (debouncedRawData !== resume.rawData) {
      updateResumeMutation.mutate({ rawData: debouncedRawData });
    }
  }, [debouncedRawData, resume]); // Warning: resume dependency might cause loop if we invalidate query. We are NOT invalidating query on auto-save success.

  // B. Structured Data
  const structuredDataValues = watch();
  const debouncedStructuredData = useDebounce(structuredDataValues, 1000);

  // We need a deep comparison or JSON stringify to check equality to avoid loops
  const isStructuredDataChanged = useMemo(() => {
    if (!resume?.structuredData) return true;
    return JSON.stringify(debouncedStructuredData) !== JSON.stringify(resume.structuredData);
  }, [debouncedStructuredData, resume?.structuredData]);

  useEffect(() => {
    if (!resume) return;
    if (isStructuredDataChanged && Object.keys(form.formState.dirtyFields).length > 0) {
       // Only save if dirty and changed
       updateResumeMutation.mutate({ structuredData: debouncedStructuredData });
    }
  }, [debouncedStructuredData, isStructuredDataChanged]); // Removed resume dependency to avoid loop? No, resume.structuredData is needed for comparison.


  // 5. AI Analysis Stream
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStreamProgress('');
    try {
      await analyzeResumeStream(id, (chunk) => {
        setStreamProgress((prev) => prev + chunk);
      });
      toast.success('Analysis complete');
      queryClient.invalidateQueries({ queryKey: ['resume', id] });
      setActiveTab('structured');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[500px] w-full" />
        </div>
    )
  }

  if (isError || !resume) {
    return <div className="p-8 text-red-500">Failed to load resume</div>;
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-theme(spacing.4))] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{resume.title || 'Untitled Resume'}</h1>
          <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-md">
            {updateResumeMutation.isPending ? 'Saving...' : 'Saved'}
          </span>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !rawData} className="gap-2">
          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="raw">Raw Input</TabsTrigger>
          <TabsTrigger value="structured">Structured Data</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4 min-h-0 overflow-hidden">
            <TabsContent value="raw" className="h-full flex flex-col space-y-4 data-[state=inactive]:hidden">
                <Card className="flex-1 flex flex-col">
                    <CardContent className="flex-1 p-4 flex flex-col gap-4 h-full">
                         <div className="space-y-2">
                             <p className="text-sm text-muted-foreground">
                                Paste your resume text here. The AI will analyze this to generate the structured data.
                             </p>
                         </div>
                         <Textarea
                            value={rawData}
                            onChange={(e) => setRawData(e.target.value)}
                            className="flex-1 font-mono text-sm resize-none p-4 min-h-0"
                            placeholder="Paste your resume content here..."
                         />
                         {isAnalyzing && (
                             <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-[200px] border">
                                 <p className="font-bold mb-2">AI Output Stream:</p>
                                 {streamProgress}
                             </div>
                         )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="structured" className="h-full overflow-auto data-[state=inactive]:hidden pb-20">
                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="personalInfo.fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="personalInfo.email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="personalInfo.phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={control}
                                            name="personalInfo.linkedin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>LinkedIn</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={control}
                                        name="summary"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Professional Summary</FormLabel>
                                                <FormControl><Textarea {...field} className="h-24" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {/* Can add other sections (Experience, Education) here using useFieldArray.
                                    For brevity/context limit, I'm setting up the core structure.
                                    I should probably add at least Experience to demonstrate nested forms. */}

                                <ExperienceSection control={control} />
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="preview" className="h-full overflow-auto data-[state=inactive]:hidden">
                <Card className="h-full overflow-auto">
                    <CardContent className="p-8 max-w-4xl mx-auto space-y-6">
                        <div className="text-center border-b pb-6">
                            <h1 className="text-3xl font-bold">{structuredDataValues.personalInfo?.fullName}</h1>
                            <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2">
                                <span>{structuredDataValues.personalInfo?.email}</span>
                                <span>{structuredDataValues.personalInfo?.phone}</span>
                                <span>{structuredDataValues.personalInfo?.location}</span>
                            </div>
                        </div>

                        {structuredDataValues.summary && (
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold border-b pb-1">Professional Summary</h2>
                                <p className="text-sm leading-relaxed">{structuredDataValues.summary}</p>
                            </div>
                        )}

                        {structuredDataValues.experience && structuredDataValues.experience.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold border-b pb-1">Experience</h2>
                                {structuredDataValues.experience.map((exp, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between font-medium">
                                            <span>{exp.position}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {exp.startDate} - {exp.endDate || (exp.isCurrent ? 'Present' : '')}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{exp.company}</div>
                                        {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                         {/* Other sections... */}
                    </CardContent>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Sub-component for Experience List
function ExperienceSection({ control }: { control: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "experience"
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Experience</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ company: '', position: '' })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Experience
                </Button>
            </div>
            {fields.map((field, index) => (
                <Card key={field.id} className="p-4 relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-destructive"
                        onClick={() => remove(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                         <FormField
                            control={control}
                            name={`experience.${index}.company`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`experience.${index}.position`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Position</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`experience.${index}.startDate`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl><Input {...field} placeholder="YYYY-MM" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`experience.${index}.endDate`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl><Input {...field} placeholder="YYYY-MM" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name={`experience.${index}.description`}
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Card>
            ))}
        </div>
    )
}
