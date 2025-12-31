
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Resume } from "@/types/resume"

interface EditorHeaderProps {
  resume: Resume | null
  isSaving: boolean
  onUpdateTitle: (newTitle: string) => void
}

export function EditorHeader({ resume, isSaving, onUpdateTitle }: EditorHeaderProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(resume?.title || "Untitled Resume")
  
  const handleTitleBlur = () => {
    if (resume && title !== resume.title) {
        onUpdateTitle(title)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="h-9 w-auto max-w-[200px] sm:max-w-[300px] border-transparent bg-transparent font-semibold hover:border-input focus:border-input"
          />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity",
              !isSaving && "opacity-50" // Dim when saved
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Saved
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
