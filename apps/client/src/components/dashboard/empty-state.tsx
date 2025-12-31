"use client"

import { Button } from "@/components/ui/button"
import { EmptyStateIcon } from "@/components/icons"
import { Plus } from "lucide-react"

interface EmptyStateProps {
  onCreateNew: () => void
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <EmptyStateIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-2">No resumes yet</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Create your first resume and let AI help you craft the perfect application for your dream job.
      </p>
      <Button onClick={onCreateNew} size="lg">
        <Plus className="mr-2 h-4 w-4" />
        Create your first resume
      </Button>
    </div>
  )
}
