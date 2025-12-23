import { useEffect, useState } from "react"
import { apiService } from "@/_services/apiService"
import type { User, UpdateUserDto } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [fullName, setFullName] = useState("")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiService.getProfile()
        setUser(data)
        setFullName(data.profile?.fullName || "")
        setTheme(data.settings?.theme || "system")
      } catch {
        toast.error("Error", {
          description: "Failed to load profile",
        })
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const updates: UpdateUserDto = {
        profile: {
          fullName,
        },
        settings: {
          theme,
        },
      }

      const updatedUser = await apiService.updateProfile(updates)
      setUser(updatedUser)
      toast.success("Success", {
        description: "Profile updated successfully",
      })
    } catch {
      toast.error("Error", {
        description: "Failed to update profile",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Failed to load profile</p>
      </div>
    )
  }

  const initials = user.email
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>
              This is how others will see you on the site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profile?.avatarUrl} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                 <h3 className="font-medium">Profile Picture</h3>
                 <p className="text-sm text-muted-foreground">To change your avatar, please use Gravatar connected to your email.</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user.email} 
                disabled 
                className="bg-muted"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Email addresses cannot be changed properly.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input 
                id="fullname" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full name"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>
              Manage your application preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Select 
                value={theme} 
                onValueChange={(val: "light" | "dark" | "system") => setTheme(val)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
