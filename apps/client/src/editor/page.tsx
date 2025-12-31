import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Sparkles, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"

import { apiService } from "@/_services/apiService"
import { SimpleResumeDataSchema } from "@/types/resume"
import type { Resume, ResumeData } from "@/types/resume"

// --- Helper for Debounce ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function ResumeEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("raw")

  // --- Form Setup ---
  const form = useForm<ResumeData>({
    resolver: zodResolver(SimpleResumeDataSchema) as any, // Type assertion to bypass strict optional vs undefined checks
    defaultValues: {
      personalInfo: { fullName: "", email: "" },
      experience: [],
      education: [],
      skills: [],
    },
  })

  const { control, register, reset, watch } = form
  
  const { fields: experienceFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience",
  })

  // Watch for changes to auto-save
  const watchedData = watch()
  const debouncedData = useDebounce(watchedData, 1000)

  // --- Fetch Resume ---
  useEffect(() => {
    if (!id) return
    const fetchResume = async () => {
      try {
        setLoading(true)
        const data = await apiService.getResumeById(id)
        setResume(data)
        
        // Populate form if structured data exists
        if (data.structuredData) {
          // Ensure arrays are initialized even if null from backend
          const parsedData = {
              ...data.structuredData,
              experience: data.structuredData.experience || [],
              education: data.structuredData.education || [],
              skills: data.structuredData.skills || [],
          }
          reset(parsedData)
          // If analyzed, default to editor tab
          if (data.status === 'analyzed') setActiveTab("editor")
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load resume")
        navigate("/")
      } finally {
        setLoading(false)
      }
    }
    fetchResume()
  }, [id, navigate, reset])

  // --- Auto-Save Logic (Structured Data) ---
  useEffect(() => {
    // Only proceed if we have a resume and aren't analyzing or loading
    if (!resume || loading || analyzing || activeTab === "raw") return
    
    // Check if form is dirty by comparing JSON string (naive but effective for this depth)
    // Avoid saving if identical to what we think is on server
    if (JSON.stringify(debouncedData) === JSON.stringify(resume.structuredData)) {
        return
    }

    const saveChanges = async () => {
      try {
        setSaving(true)
        // We update structuredData
        await apiService.updateResume(id!, {
          structuredData: debouncedData,
        })
        // Update local resume state silently
        setResume((prev) => prev ? { ...prev, structuredData: debouncedData } : null)
      } catch (error) {
        console.error("Auto-save failed", error)
      } finally {
        setSaving(false)
      }
    }

    saveChanges()
    
  }, [debouncedData, id, activeTab, analyzing, loading, resume]) // Included 'resume' in deps, careful about loops. 
  // 'resume' changes on save, but 'debouncedData' shouldn't change immediately if user stopped typing.
  // The check `JSON.stringify` prevents loop.

  // --- Handlers ---
  
  const saveTitle = async () => {
     if (!resume || !id) return
     try {
       await apiService.updateResume(id, { title: resume.title })
     } catch (e) {
        console.error(e)
        // toast.error("Failed to save title")
     }
  }

  const handleRawDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!resume) return
    setResume({ ...resume, rawData: e.target.value })
  }
  
  const saveRawData = async () => {
    if (!resume || !id) return
    try {
      setSaving(true)
      await apiService.updateResume(id, { rawData: resume.rawData })
      setSaving(false)
    } catch (e) {
      setSaving(false)
      console.error(e)
    }
  }

  const handleAnalyze = async () => {
    if (!resume?.rawData?.trim()) {
      toast.error("Please enter resume text first")
      return
    }
    try {
      setAnalyzing(true)
      
      // First ensure raw data is saved
      await apiService.updateResume(id!, { rawData: resume.rawData })
      
      const analyzedResume = await apiService.analyzeResume(id!)
      setResume(analyzedResume)
      if (analyzedResume.structuredData) {
        const parsedData = {
          ...analyzedResume.structuredData,
          experience: analyzedResume.structuredData.experience || [],
          education: analyzedResume.structuredData.education || [],
          skills: analyzedResume.structuredData.skills || [],
        }
        reset(parsedData)
      }
      setActiveTab("editor")
      toast.success("Analysis complete!")
    } catch (error) {
      console.error(error)
      toast.error("Analysis failed. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!resume) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <div className="flex gap-4 w-[80%] mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-4">
            <Input 
                className="h-8 font-semibold text-lg border-transparent hover:border-input focus:border-input px-2 -ml-2 w-[300px]" 
                value={resume.title}
                onChange={(e) => setResume({...resume, title: e.target.value})}
                onBlur={saveTitle}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-0">
               <Badge variant={resume.status === 'analyzed' ? 'default' : 'outline'} className="text-[10px] h-5">
                 {resume.status}
               </Badge>
               {saving && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Saving...</span>}
               {!saving && <span>Saved</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 mb-4">
            <TabsTrigger value="raw" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2">
              Raw Data
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2" disabled={!resume.structuredData}>
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2" disabled={!resume.structuredData}>
              Preview JSON
            </TabsTrigger>
          </TabsList>

          {/* Raw Data Tab */}
          <TabsContent value="raw" className="flex-1 h-full overflow-hidden data-[state=inactive]:hidden">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-center">
                <Label>Paste your resume text here (Ctrl+V)</Label>
                <Button onClick={handleAnalyze} disabled={analyzing}>
                   {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4 text-yellow-400"/>}
                   Analyze with AI
                </Button>
              </div>
              <Textarea 
                className="flex-1 resize-none font-mono text-sm leading-relaxed" 
                placeholder="Paste full resume content..."
                value={resume.rawData || ''}
                onChange={handleRawDataChange}
                onBlur={saveRawData}
              />
            </div>
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
             <ScrollArea className="h-full pr-4">
                <div className="space-y-8 pb-20 max-w-4xl mx-auto">
                    
                    {/* Personal Info */}
                    <Card>
                      <CardContent className="pt-6 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input {...register("personalInfo.fullName")} />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input {...register("personalInfo.email")} />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input {...register("personalInfo.phone")} />
                        </div>
                        <div className="space-y-2">
                          <Label>LinkedIn</Label>
                          <Input {...register("personalInfo.linkedin")} />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>Location</Label>
                          <Input {...register("personalInfo.location")} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <Label>Skills (Comma separated)</Label>
                            <Controller
                                control={control}
                                name="skills"
                                render={({ field }) => (
                                    <Textarea 
                                        {...field} 
                                        value={Array.isArray(field.value) ? field.value.join(", ") : field.value} 
                                        onChange={(e) => {
                                            const val = e.target.value.split(",").map(s => s.trim())
                                            field.onChange(val)
                                        }}
                                        placeholder="React, TypeScript, Node.js..."
                                    />
                                )}
                            />
                            <p className="text-xs text-muted-foreground">Separate skills with commas.</p>
                        </CardContent>
                    </Card>

                    {/* Experience */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Experience</h3>
                            <Button size="sm" variant="outline" onClick={() => appendExp({ company: "", position: "", highlights: [] })}>
                                <Plus className="h-4 w-4 mr-2"/> Add Job
                            </Button>
                        </div>
                        
                        <Accordion type="multiple" className="space-y-4">
                            {experienceFields.map((field, index) => (
                                <AccordionItem key={field.id} value={field.id} className="border rounded-md px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex gap-4 text-left">
                                            <span className="font-bold">{watch(`experience.${index}.company`) || "New Company"}</span>
                                            <span className="text-muted-foreground">{watch(`experience.${index}.position`)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Company</Label>
                                                <Input {...register(`experience.${index}.company`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Position</Label>
                                                <Input {...register(`experience.${index}.position`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Start Date</Label>
                                                <Input {...register(`experience.${index}.startDate`)} placeholder="YYYY-MM" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>End Date</Label>
                                                <Input {...register(`experience.${index}.endDate`)} placeholder="Present" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description / Highlights</Label>
                                            <Controller 
                                                control={control}
                                                name={`experience.${index}.highlights`}
                                                render={({ field }) => (
                                                    <Textarea 
                                                        value={Array.isArray(field.value) ? field.value.join("\\n") : field.value}
                                                        onChange={(e) => field.onChange(e.target.value.split("\\n"))}
                                                        placeholder="Achievements..."
                                                        className="min-h-[100px]"
                                                    />
                                                )}
                                            />
                                            <p className="text-xs text-muted-foreground">One bullet point per line.</p>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <Button variant="destructive" size="sm" onClick={() => removeExp(index)}>
                                                <Trash2 className="h-4 w-4 mr-2"/> Remove Position
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                     </div>

                </div>
             </ScrollArea>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
             <ScrollArea className="h-full bg-muted/50 p-4 rounded-md">
                <pre className="font-mono text-xs">
                    {JSON.stringify(watch(), null, 2)}
                </pre>
             </ScrollArea>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
