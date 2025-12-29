import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Plus, FileText, Calendar, Clock, LogOut } from "lucide-react" // Icons
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { apiService } from "@/_services/apiService"
import { logoutUser } from "@/_actions/authActions"
import type { AppDispatch, RootState } from "@/store"
import type { Resume } from "@/types/resume"

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

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

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate("/login")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed':
        return 'default' // Primary color
      case 'exported':
        return 'secondary'
      case 'draft':
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your resumes and AI analyses.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user?.email}
            </span>
             <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={handleCreateResume} disabled={isCreating}>
            {isCreating ? (
              <Clock className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create New Resume
          </Button>
        </div>

        {/* Resumes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : resumes.length === 0 ? (
            // Empty State
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No resumes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first resume to get started with AI analysis.
              </p>
              <Button onClick={handleCreateResume} variant="secondary">
                Create Now
              </Button>
            </div>
          ) : (
            // Resume Cards
            resumes.map((resume) => (
              <Card 
                key={resume._id} 
                className="group hover:border-primary/50 transition-colors cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/resumes/${resume._id}/edit`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="truncate" title={resume.title}>
                      {resume.title}
                    </CardTitle>
                    <Badge variant={getStatusColor(resume.status) as any}>
                      {resume.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    Updated {format(new Date(resume.updatedAt), "PP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {resume.rawData 
                      ? resume.rawData.slice(0, 150) + "..."
                      : "No content yet. Open editor to start."}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-primary group-hover:bg-primary/5">
                    Open Editor
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
