"use client"

import type { Resume } from "@/types/resume"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ResumeCardProps {
  resume: Resume
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ResumeCard({ resume, onEdit, onDelete }: ResumeCardProps) {
  const statusVariant = {
    draft: "secondary",
    analyzed: "default",
    exported: "secondary", // Mapped 'exported' to secondary as it wasn't in the original map
  } as const

  const statusLabel = {
    draft: "Draft",
    analyzed: "Analyzed",
    exported: "Exported",
  }

  return (
    <Card className="group relative transition-all duration-200 hover:shadow-md hover:border-foreground/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base leading-none tracking-tight line-clamp-1">{resume.title}</h3>
              <Badge variant={statusVariant[resume.status] || "outline"} className="text-xs">
                {statusLabel[resume.status] || resume.status}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(resume._id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(resume._id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Last edited {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
        </p>
      </CardContent>
      <button onClick={() => onEdit(resume._id)} className="absolute inset-0 z-0" aria-label={`Edit ${resume.title}`} />
    </Card>
  )
}
