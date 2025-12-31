
import { useFormContext, useFieldArray, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, X } from "lucide-react"
import type { ResumeData } from "@/types/resume"
import { useState } from "react"

export function StructuredDataTab() {
  const { register, control, watch, setValue } = useFormContext<ResumeData>()
  
  const { fields: experienceFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience",
  })
  
  const { fields: educationFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: "education",
  })

  const skills = watch("skills") || []
  const [newSkill, setNewSkill] = useState("")

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setValue("skills", [...skills, newSkill.trim()], { shouldDirty: true, shouldTouch: true, shouldValidate: true })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setValue(
      "skills", 
      skills.filter((s) => s !== skillToRemove),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    )
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      {/* Personal Information */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register("personalInfo.fullName")} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("personalInfo.email")} placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("personalInfo.phone")} placeholder="(555) 123-4567" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("personalInfo.location")} placeholder="San Francisco, CA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" {...register("personalInfo.linkedin")} placeholder="linkedin.com/in/johndoe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("personalInfo.website")} placeholder="johndoe.com" />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Professional Summary</h2>
        <Textarea
           {...register("summary")}
          placeholder="A brief summary of your professional background and career objectives..."
          className="min-h-[100px] resize-none"
        />
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Experience</h2>
          <Button variant="outline" size="sm" onClick={() => appendExp({ company: "", position: "", highlights: [] })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        </div>
        <Accordion type="multiple" className="space-y-2">
          {experienceFields.map((field, index) => {
             // Watch nested values for title display in accordion header
             // We can't use `watch` in a map easily without performance hit or separate component, 
             // but `useFieldArray` fields might NOT reflect realtime value if we just use `field.company`. 
             // Actually React Hook Form advises `useWatch` or creating a sub-component. 
             // For simplicity, we'll assume `watch` at top level covers it or we accept non-realtime header updates till collapse/expand 
             // OR we render a sub-component. To keep it simple and performant enough for <10 items:
             const company = watch(`experience.${index}.company`)
             const position = watch(`experience.${index}.position`)
             
             return (
            <AccordionItem key={field.id} value={field.id} className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-left">
                  {company || `Experience ${index + 1}`}
                  {position && <span className="text-muted-foreground ml-2">— {position}</span>}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input {...register(`experience.${index}.company`)} placeholder="Company Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input {...register(`experience.${index}.position`)} placeholder="Job Title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input {...register(`experience.${index}.startDate`)} placeholder="Jan 2020" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input {...register(`experience.${index}.endDate`)} placeholder="Present" />
                  </div>
                </div>
                
                <div className="space-y-2">
                   <div className="flex items-center space-x-2">
                      <Controller
                        control={control}
                        name={`experience.${index}.isCurrent`}
                        render={({ field }) => (
                            <Checkbox 
                                id={`current-${index}`} 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                            />
                        )}
                      />
                      <Label htmlFor={`current-${index}`} className="text-sm font-normal">I currently work here</Label>
                   </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input {...register(`experience.${index}.description`)} placeholder="Short description..." className="hidden" /> 
                  {/* Note: Original UI had simple description, but also highlights array. 
                      Our Schema has `description` string AND `highlights` array. 
                      The Target UI used `description` as a Textarea.
                      Existing `page.tsx` mapped text array to highlights. 
                      Let's stick to Target UI `description` textarea for now and map it to `description` field in schema.
                  */}
                   <Controller
                    control={control}
                    name={`experience.${index}.description`}
                    render={({ field }) => (
                         <Textarea 
                            {...field} 
                            placeholder="Describe your responsibilities, achievements, and impact..."
                            className="min-h-[120px] resize-none"
                         />
                    )}
                   />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExp(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </AccordionContent>
            </AccordionItem>
          )})}
        </Accordion>
      </section>
      
      {/* Education */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Education</h2>
          <Button variant="outline" size="sm" onClick={() => appendEdu({ institution: "", degree: "" })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        </div>
        <Accordion type="multiple" className="space-y-2">
          {educationFields.map((field, index) => {
             const institution = watch(`education.${index}.institution`)
             const degree = watch(`education.${index}.degree`)
             return (
            <AccordionItem key={field.id} value={field.id} className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-left">
                  {institution || `Education ${index + 1}`}
                  {degree && <span className="text-muted-foreground ml-2">— {degree}</span>}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>School / University</Label>
                    <Input {...register(`education.${index}.institution`)} placeholder="University Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input {...register(`education.${index}.degree`)} placeholder="Bachelor's" />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input {...register(`education.${index}.fieldOfStudy`)} placeholder="Computer Science" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input {...register(`education.${index}.startDate`)} placeholder="Sep 2016" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input {...register(`education.${index}.endDate`)} placeholder="May 2020" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEdu(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </AccordionContent>
            </AccordionItem>
          )})}
        </Accordion>
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-border rounded-lg bg-background">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pr-1 text-sm font-normal">
              {skill}
              <button
                type="button" // Prevent submitting form
                onClick={() => removeSkill(skill)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Type a skill and press Enter..."
            className="flex-1 min-w-[150px] border-0 bg-transparent h-7 p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <p className="text-xs text-muted-foreground">Press Enter to add each skill</p>
      </section>
    </div>
  )
}
