import { useEffect, useState } from "react"
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
    resolver: zodResolver(SimpleResumeDataSchema) as any,
    defaultValues: {
      personalInfo: { fullName: "", email: "" },
      experience: [],
      education: [],
      skills: [],
    },
  })

  // Watch for changes to auto-save
  const watchedData = form.watch()
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
          const parsedData = {
              ...data.structuredData,
              experience: data.structuredData.experience || [],
              education: data.structuredData.education || [],
              skills: data.structuredData.skills || [],
          }
          form.reset(parsedData)
          // If analyzed (or has data), default to editor tab, unless just landed
          // Matching target UI logic usually starts at raw input or last state. 
          // For now, if analyzed, show editor.
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
  }, [id, navigate, form]) // Added form to deps carefully

  // --- Auto-Save Logic (Structured Data) ---
  useEffect(() => {
    if (!resume || loading || analyzing || activeTab === "raw") return
    
    // Avoid saving if identical to what we think is on server
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

  // --- Handlers ---
  
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
  
  // Save raw data on blur or before analyze? 
  // We can save raw data when it changes (debounced) or just rely on 'Analyze' saving it.
  // Let's rely on Analyze saving it for now to match 'Analyze' flow, 
  // OR add a separate effect for rawData auto-save if needed. 
  // Given existing logic had `saveRawData` on blur, let's keep it simple or implement if needed.
  // The new RawInputTab doesn't explicitly have onBlur, but we can update state. 

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
        form.reset(parsedData)
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
    <div className="min-h-screen bg-background flex flex-col">
      <EditorHeader 
        key={resume.title}
        resume={resume} 
        isSaving={saving} 
        onUpdateTitle={handleUpdateTitle}
      />
      
      <FormProvider {...form}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-border bg-background">
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
                  // disabled={!resume.structuredData} // Optional: disable if no data? Target UI didn't seem to enforce strictly
                >
                  <Database className="mr-2 h-4 w-4" />
                  2. Structured Data
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="relative rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  // disabled={!resume.structuredData}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  3. Preview
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="raw" className="flex-1 mt-0">
            <div className="container px-4 py-6 md:px-6 h-full">
              <RawInputTab 
                 rawData={resume.rawData || ""} 
                 isAnalyzing={analyzing} 
                 onAnalyze={handleAnalyze} 
                 onRawDataChange={handleRawDataChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="editor" className="flex-1 mt-0 overflow-auto">
             <StructuredDataTab />
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 mt-0">
             <PreviewTab />
          </TabsContent>
        </Tabs>
      </FormProvider>
    </div>
  )
}

