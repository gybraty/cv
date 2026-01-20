import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FileText, Database, Eye } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

import { apiService } from "@/_services/apiService"
import { SimpleResumeDataSchema } from "@/types/resume"
import type { Resume, ResumeData } from "@/types/resume"

import { EditorHeader } from "@/components/editor/editor-header"
import { RawInputTab } from "@/components/editor/raw-input-tab"
import { StructuredDataTab } from "@/components/editor/structured-data-tab"
import { PreviewTab } from "@/components/editor/preview-tab"

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
  const [analysisStream, setAnalysisStream] = useState("")
  const analysisStreamQueue = useRef<string[]>([])
  const streamInterval = useRef<any>(null)

  const form = useForm<ResumeData>({
    resolver: zodResolver(SimpleResumeDataSchema) as any,
    defaultValues: {
      personalInfo: { fullName: "", email: "" },
      experience: [],
      education: [],
      skills: [],
    },
  })

  const watchedData = form.watch()
  const debouncedData = useDebounce(watchedData, 1000)

  // Stream processing effect
  useEffect(() => {
    if (streamInterval.current) clearInterval(streamInterval.current)
    
    streamInterval.current = setInterval(() => {
      if (analysisStreamQueue.current.length > 0) {
        // Process up to 2 characters per tick for typing effect
        const charsToProcess = analysisStreamQueue.current.splice(0, 3)
        setAnalysisStream(prev => prev + charsToProcess.join(""))
      }
    }, 15) // Adjust speed here: 15ms * 3 chars ~= 15-20ms per update

    return () => {
       if (streamInterval.current) clearInterval(streamInterval.current)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    const fetchResume = async () => {
      try {
        setLoading(true)
        const data = await apiService.getResumeById(id)
        setResume(data)

        if (data.structuredData) {
          const parsedData = {
              ...data.structuredData,
              experience: data.structuredData.experience || [],
              education: data.structuredData.education || [],
              skills: data.structuredData.skills || [],
          }
          form.reset(parsedData)
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
  }, [id, navigate, form])
  useEffect(() => {
    if (!resume || loading || analyzing || activeTab === "raw") return

    if (JSON.stringify(debouncedData) === JSON.stringify(resume.structuredData)) {
        return
    }

    const saveChanges = async () => {
      try {
        setSaving(true)
        await apiService.updateResume(id!, {
          structuredData: debouncedData,
        })
        setResume((prev) => prev ? { ...prev, structuredData: debouncedData } : null)
      } catch (error) {
        console.error("Auto-save failed", error)
      } finally {
        setSaving(false)
      }
    }

    saveChanges()
    
  }, [debouncedData, id, activeTab, analyzing, loading, resume]) 

  
  const handleUpdateTitle = async (newTitle: string) => {
     if (!resume || !id) return
     try {
       setSaving(true)
       await apiService.updateResume(id, { title: newTitle })
       setResume(prev => prev ? { ...prev, title: newTitle} : null)
     } catch (e) {
        console.error(e)
        toast.error("Failed to save title")
     } finally {
        setSaving(false)
     }
  }

  const handleRawDataChange = (val: string) => {
    if (!resume) return
    setResume({ ...resume, rawData: val })
  }


  const handleAnalyze = async () => {
    if (!resume?.rawData?.trim()) {
      toast.error("Please enter resume text first")
      return
    }
    try {
      setAnalyzing(true)
      setAnalysisStream("") // Reset stream

      await apiService.updateResume(id!, { rawData: resume.rawData })
      
      
      // Start streaming
      const streamResult = await apiService.analyzeResumeStream(id!, (chunk) => {
         // Push characters to queue instead of updating state directly
         const chars = chunk.split('')
         analysisStreamQueue.current.push(...chars)
      })

      // Wait for visualization to catch up
      while (analysisStreamQueue.current.length > 0) {
         await new Promise(r => setTimeout(r, 100))
      }
      
      // Small buffer at the end
      await new Promise(r => setTimeout(r, 500))

      // Parse and save the streamed result
      const cleanJson = streamResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const parsedData = JSON.parse(cleanJson);
      
      // Save structured data to DB
      const updatedResume = await apiService.updateResume(id!, {
         structuredData: parsedData,
         status: 'analyzed'
      })
      
      setResume(updatedResume)
      
      if (updatedResume.structuredData) {
        const formData = {
            ...updatedResume.structuredData,
            experience: updatedResume.structuredData.experience || [],
            education: updatedResume.structuredData.education || [],
            skills: updatedResume.structuredData.skills || [],
        }
        form.reset(formData)
      }
      
      setActiveTab("editor")
      toast.success("Analysis complete!")
    } catch (error) {
      console.error(error)
      toast.error("Analysis failed. Please try again.")
    } finally {
      setAnalyzing(false)
      setAnalysisStream("") 
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border">
          <div className="container flex h-14 items-center px-4 md:px-6">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="container px-4 py-8 md:px-6">
          <Skeleton className="h-10 w-full max-w-md mb-8" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (!resume) return null

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <EditorHeader 
        key={resume.title}
        resume={resume} 
        isSaving={saving} 
        onUpdateTitle={handleUpdateTitle}
      />
      
      <FormProvider {...form}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-border bg-background z-50">
            <div className="">
              <TabsList className="h-12 bg-transparent p-0 gap-4 w-full">
                <TabsTrigger
                  value="raw"
                  className="relative rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  1. Raw Input
                </TabsTrigger>
                <TabsTrigger
                  value="editor"
                  className="relative rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <Database className="mr-2 h-4 w-4" />
                  2. Structured Data
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="relative rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  3. Preview
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="raw" className="flex-1 mt-0 min-h-0 overflow-hidden">
            <div className=" px-4 py-6 md:px-6 h-full">
              <RawInputTab 
                 rawData={resume.rawData || ""} 
                 isAnalyzing={analyzing} 
                 onAnalyze={handleAnalyze} 
                 onRawDataChange={handleRawDataChange}
                 analysisStream={analysisStream}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="editor" className="flex-1 mt-0 min-h-0 overflow-y-auto">
             <StructuredDataTab />
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 mt-0 min-h-0 overflow-y-auto">
             <PreviewTab />
          </TabsContent>
        </Tabs>
      </FormProvider>
    </div>
  )
}

