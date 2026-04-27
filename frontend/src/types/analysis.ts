export interface ParsedDescription {
  brand: string | null
  product_line: string | null
  color: string | null
  style: string | null
  features: string[]
  product_type: string
  quantity_info: string | null
  quantity_info_note: string
}

export interface BlurResult {
  score: number
  is_blurry: boolean
  label: string
}

export interface ResolutionResult {
  width: number
  height: number
  dpi: number | null
  is_sufficient: boolean
  label: string
}

export interface FramingResult {
  centroid_offset: number
  is_centered: boolean
  label: string
}

export interface QualityResult {
  blur: BlurResult
  resolution: ResolutionResult
  framing: FramingResult
  overall_score: number
  overall_label: string
}

export interface DominantColor {
  hex: string
  percentage: number
  color_name: string
}

export interface ColorComparisonResult {
  status: 'matched' | 'no_data' | 'not_applicable' | 'multicolored' | 'transparent' | 'unknown_color'
  extracted_hex: string | null
  target_hex: string | null
  target_color_name: string | null
  delta_e: number | null
  match_score: number | null
  match_label: string | null
  resolution_method: string
  tolerance_used: number | null
  cluster_scores: object[]
}

export interface ColorAnalysisResult {
  dominant_colors: DominantColor[]
  comparison: ColorComparisonResult | null
}

export interface ScoreComponent {
  score: number
  weight: number
  contribution: number
}

export interface ScoreBreakdown {
  product_type: ScoreComponent
  color_match: ScoreComponent | null
  image_quality: ScoreComponent
}

export interface AIScoreBreakdown {
  ai_analysis: ScoreComponent
  color_match: ScoreComponent | null
  image_quality: ScoreComponent
}

export interface AIModelAnalysisResult {
  composite_score: number
  score_breakdown: AIScoreBreakdown
  product_type_match: boolean
  product_type_detected: string
  color_match: boolean
  color_detected: string
  is_correct_product: boolean
  overall_match_score: number
  reasoning: string
  issues: string[]
  quality: QualityResult
  color: ColorAnalysisResult
  verdict: string
  verdict_reason: string
  verdict_note: string
  model_used: string
  processing_time_ms: number
}

export interface CLIPAnalysisResult {
  composite_score: number
  score_breakdown: ScoreBreakdown
  product_type_detected: string
  product_type_match: boolean
  quality: QualityResult | null
  color: ColorAnalysisResult | null
  verdict: string
  verdict_note: string
  model_used: string
  processing_time_ms: number
}

export interface CombinedAnalysisResult {
  item_number: string
  sku_id: string | null
  hierarchy: string | null
  primary_color: string | null
  long_description: string | null
  image_url: string | null
  clip: CLIPAnalysisResult
  ai: AIModelAnalysisResult
}
