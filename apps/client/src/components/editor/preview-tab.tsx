
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react"
import type { ResumeData } from "@/types/resume"
import { useRef } from "react"

export function PreviewTab() {
  const { watch } = useFormContext<ResumeData>()
  const data = watch()
  const previewRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = () => {
    window.print()
  }

  const { personalInfo, summary, experience, education, skills, projects, languages } = data

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border p-6 space-y-6 bg-muted/30">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Export Settings</h3>
          <div className="space-y-2">
            <Label htmlFor="template" className="text-xs text-muted-foreground">
              Template
            </Label>
            <Select defaultValue="modern">
              <SelectTrigger id="template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paperSize" className="text-xs text-muted-foreground">
              Paper Size
            </Label>
            <Select defaultValue="letter">
              <SelectTrigger id="paperSize">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">US Letter</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleDownloadPDF} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 p-6 bg-muted/50 overflow-auto">
        <div className="flex justify-center">
          <div
            ref={previewRef}
            className="w-full max-w-[8.5in] bg-card shadow-lg print:shadow-none"
            style={{ minHeight: "11in" }}
          >
            {/* Resume Preview Content */}
            <div className="p-8 md:p-12 space-y-6">
              {/* Header */}
              <header className="text-center space-y-2 pb-4 border-b border-border">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {personalInfo.fullName || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {personalInfo.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {personalInfo.email}
                    </span>
                  )}
                  {personalInfo.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {personalInfo.phone}
                    </span>
                  )}
                  {personalInfo.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {personalInfo.location}
                    </span>
                  )}
                  {personalInfo.linkedin && (
                    <span className="flex items-center gap-1">
                      <Linkedin className="h-3.5 w-3.5" />
                      {personalInfo.linkedin}
                    </span>
                  )}
                  {personalInfo.website && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {personalInfo.website}
                    </span>
                  )}
                </div>
              </header>

              {/* Summary */}
              {summary && (
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Summary</h2>
                  <p className="text-sm leading-relaxed">{summary}</p>
                </section>
              )}

              {/* Experience */}
              {experience && experience.length > 0 && (experience[0].company || experience[0].position) && (
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Experience</h2>
                  <div className="space-y-4">
                    {experience.map((exp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{exp.position}</h3>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                        )}
                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                            {exp.highlights.map((highlight, idx) => (
                              <li key={idx} className="text-sm leading-relaxed">
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {education && education.length > 0 && education[0].institution && (
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Education</h2>
                  <div className="space-y-3">
                    {education.map((edu, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{edu.institution}</h3>
                          <p className="text-sm text-muted-foreground">
                            {edu.degree}
                            {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {edu.startDate} — {edu.endDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {projects && projects.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Projects</h2>
                  <div className="space-y-4">
                    {projects.map((project, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {project.name}
                              {project.url && (
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-xs font-normal text-muted-foreground hover:underline"
                                >
                                  (Link)
                                </a>
                              )}
                            </h3>
                          </div>
                        </div>
                        {project.description && (
                          <p className="text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold font-mono text-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {skills && skills.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills</h2>
                  <p className="text-sm">{skills.join(" • ")}</p>
                </section>
              )}

              {/* Languages */}
              {languages && languages.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Languages</h2>
                  <p className="text-sm">{languages.join(" • ")}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
