import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Camera, Monitor, Moon, Sun, Trash2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { logoutUser } from "@/_actions/authActions"
import { apiService } from "@/_services/apiService"
import type { Resume } from "@/types/resume"
import type { Theme } from "@/types/global"


export default function ProfilePage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [fullName, setFullName] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "")
      setAvatar(user.avatar || null)
    }
  }, [user])

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await apiService.getAllResumes()
        setResumes(data)
      } catch (error) {
        console.error("Failed to fetch resumes", error)
      } finally {
        setIsLoadingResumes(false)
      }
    }
    fetchResumes()
  }, [])

  const isLoading = authLoading || isLoadingResumes

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
  }

  const handleNameBlur = async () => {
      try {
        await apiService.updateProfile({ profile: { fullName: fullName.trim() } })
        dispatch({ type: 'auth/checkSession/fulfilled', payload: { ...user, fullName: fullName.trim() } }) // Optimistic update or re-fetch
      } catch (error) {
        console.error("Failed to update profile", error)
      }
    }


  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        setAvatar(result) // Optimistic update
        try {
           await apiService.updateProfile({ profile: { avatarUrl: result } })
        } catch (error) {
          console.error("Failed to update avatar", error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteAccount = async () => {
    try {
        await dispatch(logoutUser())
        navigate("/login")
    } catch (error) {
        console.error("Failed to delete account", error)
    }
  }

  const getInitials = (email: string) => {
    return email[0].toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container max-w-2xl px-4 py-8 md:px-6">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-[400px] w-full" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-2xl px-4 py-8 md:px-6 space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatar || ""} alt={fullName} />
                  <AvatarFallback className="text-xl bg-muted">
                    {fullName ? getInitials(fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-muted-foreground">Click the camera icon to upload a new photo</p>
              </div>
            </div>

            <Separator />
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>
          </CardContent>
        </Card>

           <Card className="bg-background">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks on your device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Theme</Label>
              <ToggleGroup
                type="single"
                value={theme}
                onValueChange={(value) => value && setTheme(value as Theme)}
                className="justify-start"
              >
                <ToggleGroupItem value="light" aria-label="Light mode" className="gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark mode" className="gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="System default" className="gap-2">
                  <Monitor className="h-4 w-4" />
                  System
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>

           <Card className="bg-background">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Overview of your resume building activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-bold">{resumes.length}</p>
                <p className="text-xs text-muted-foreground">Total Resumes</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{resumes.filter((r) => r.status === "analyzed").length}</p>
                <p className="text-xs text-muted-foreground">Analyzed</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{resumes.filter((r) => r.status === "draft").length}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your resumes
                    from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
