import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CLIPResultsTab } from '@/components/organisms/CLIPResultsTab'
import type { CLIPAnalysisResult } from '@/types/analysis'

interface ResultsTabsProps {
  clipResult: CLIPAnalysisResult
}

export function ResultsTabs({ clipResult }: ResultsTabsProps) {
  return (
    <Tabs defaultValue="clip">
      <TabsList className="rounded-xl bg-gray-100 h-10 p-1 gap-1">
        <TabsTrigger
          value="clip"
          className="rounded-lg text-xs font-semibold uppercase tracking-wider h-full px-5 data-[state=active]:bg-[#004990] data-[state=active]:text-white data-[state=active]:shadow-sm"
        >
          CLIP Model
        </TabsTrigger>
        <TabsTrigger
          value="ai"
          className="rounded-lg text-xs font-semibold uppercase tracking-wider h-full px-5 data-[state=active]:bg-[#004990] data-[state=active]:text-white data-[state=active]:shadow-sm"
        >
          AI API
        </TabsTrigger>
        <TabsTrigger
          value="yolo"
          className="rounded-lg text-xs font-semibold uppercase tracking-wider h-full px-5 data-[state=active]:bg-[#004990] data-[state=active]:text-white data-[state=active]:shadow-sm"
        >
          YOLO+SAM2
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clip" className="mt-4">
        <CLIPResultsTab result={clipResult} />
      </TabsContent>

      <TabsContent value="ai" className="mt-4">
        <div className="flex flex-col items-center justify-center py-16 gap-2 bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
          <span className="text-sm font-semibold">AI API Analysis</span>
          <span className="text-xs">Coming soon</span>
        </div>
      </TabsContent>

      <TabsContent value="yolo" className="mt-4">
        <div className="flex flex-col items-center justify-center py-16 gap-2 bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
          <span className="text-sm font-semibold">YOLO+SAM2 Segmentation</span>
          <span className="text-xs">Coming soon</span>
        </div>
      </TabsContent>
    </Tabs>
  )
}
