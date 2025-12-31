import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { apiService } from "@/_services/apiService"
import type { Resume } from "@/types/resume"

import { ResumeCard } from "@/components/dashboard/resume-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { DeleteDialog } from "@/components/dashboard/delete-dialog"

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null)
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getAllResumes()
      setResumes(data)
    } catch (error) {
      console.error("Failed to fetch resumes:", error)
      toast.error("Failed to load resumes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateResume = async () => {
    try {
      setIsCreating(true)
      const newResume = await apiService.createResume("Untitled Resume")
      toast.success("Resume created successfully")
      navigate(`/resumes/${newResume._id}/edit`)
    } catch (error) {
      console.error("Failed to create resume:", error)
      toast.error("Failed to create resume")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = (id: string) => {
    navigate(`/resumes/${id}/edit`)
  }

  const handleDeleteClick = (id: string) => {
    setResumeToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (resumeToDelete) {
      try {
        await apiService.deleteResume(resumeToDelete)
        setResumes(resumes.filter(r => r._id !== resumeToDelete))
        toast.success("Resume deleted successfully")
      } catch (error) {
        console.error("Failed to delete resume:", error)
        toast.error("Failed to delete resume")
      } finally {
        setResumeToDelete(null)
      }
    }
    setDeleteDialogOpen(false)
  }

  const resumeToDeleteData = resumes.find((r) => r._id === resumeToDelete)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
           <div className="flex items-center justify-between mb-8">
             <Skeleton className="h-9 w-32" />
             <Skeleton className="h-10 w-40" />
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} className="h-48 w-full rounded-xl" />
             ))}
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">My Resumes</h1>
          {resumes.length > 0 && (
            <Button onClick={handleCreateResume} disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Resume
            </Button>
          )}
        </div>

        {/* Content */}
        {resumes.length === 0 ? (
          <EmptyState onCreateNew={handleCreateResume} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resumes.map((resume) => (
              <ResumeCard 
                key={resume._id} 
                resume={resume} 
                onEdit={handleEdit} 
                onDelete={handleDeleteClick} 
              />
            ))}
          </div>
        )}

        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title={resumeToDeleteData?.title}
        />
      </div>
    </div>
  )
}
