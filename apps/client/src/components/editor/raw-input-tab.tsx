
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles } from "lucide-react"

interface RawInputTabProps {
  rawData: string
  isAnalyzing: boolean
  onAnalyze: () => void
  onRawDataChange: (val: string) => void
  analysisStream?: string
}

export function RawInputTab({ rawData, isAnalyzing, onAnalyze, onRawDataChange, analysisStream }: RawInputTabProps) {
  
  return (
    <div className="relative flex flex-col h-full">
      <Textarea
        value={rawData}
        onChange={(e) => onRawDataChange(e.target.value)}
        placeholder="Paste your LinkedIn export or existing resume text here...

Example:
John Doe
john.doe@email.com | (555) 123-4567

Senior Software Engineer with 5+ years of experience..."
        className="overflow-y-auto flex-1 min-h-[400px] resize-none text-base leading-relaxed p-6 border-border focus-visible:ring-1 border-0 shadow-none focus-visible:ring-0"
      />
      {/* Streaming Overlay/Preview */}
      {isAnalyzing && analysisStream && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-10 transition-all duration-300">
           <div className="w-full max-w-2xl bg-card border rounded-xl shadow-2xl p-6 font-mono text-xs md:text-sm overflow-hidden flex flex-col h-[60vh]">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground border-b pb-2">
                 <Loader2 className="w-4 h-4 animate-spin text-primary" />
                 <span className="font-semibold text-foreground">Analyzing Resume Structure...</span>
              </div>
              <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-muted-foreground font-light leading-relaxed">
                 {analysisStream}
                 <span className="animate-pulse inline-block w-2 h-4 bg-primary ml-1 align-middle"></span>
              </div>
           </div>
        </div>
      )}
      <div className="sticky bottom-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent flex justify-end">
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          size="lg"
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Improve with Gemini
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
