import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CLIPResultsTab } from '@/components/organisms/CLIPResultsTab'
import type { CLIPAnalysisResult } from '@/types/analysis'

interface ResultsTabsProps {
  clipResult: CLIPAnalysisResult
}

export function ResultsTabs({ clipResult }: ResultsTabsProps) {
  return (
    <Tabs defaultValue="clip">
      <TabsList className="rounded-none bg-gray-100 h-10 gap-0 p-0">
        <TabsTrigger
          value="clip"
          className="rounded-none text-xs font-semibold uppercase tracking-wider h-full px-6 data-[state=active]:bg-[#004990] data-[state=active]:text-white"
        >
          CLIP Model
        </TabsTrigger>
        <TabsTrigger
          value="ai"
          className="rounded-none text-xs font-semibold uppercase tracking-wider h-full px-6 data-[state=active]:bg-[#004990] data-[state=active]:text-white"
        >
          AI API
        </TabsTrigger>
        <TabsTrigger
          value="yolo"
          className="rounded-none text-xs font-semibold uppercase tracking-wider h-full px-6 data-[state=active]:bg-[#004990] data-[state=active]:text-white"
        >
          YOLO+SAM2
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clip" className="mt-0 border border-t-0 border-gray-200 px-6 py-4">
        <CLIPResultsTab result={clipResult} />
      </TabsContent>

      <TabsContent value="ai" className="mt-0 border border-t-0 border-gray-200 px-6 py-10">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-sm font-medium">AI API analysis</span>
          <span className="text-xs">Coming soon</span>
        </div>
      </TabsContent>

      <TabsContent value="yolo" className="mt-0 border border-t-0 border-gray-200 px-6 py-10">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-sm font-medium">YOLO+SAM2 segmentation</span>
          <span className="text-xs">Coming soon</span>
        </div>
      </TabsContent>
    </Tabs>
  )
}
