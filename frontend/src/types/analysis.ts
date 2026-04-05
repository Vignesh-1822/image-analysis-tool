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
  extracted_hex: string
  target_hex: string
  target_color_name: string
  delta_e: number
  match_score: number
  match_label: string
}

export interface ColorAnalysisResult {
  dominant_colors: DominantColor[]
  comparison: ColorComparisonResult | null
}

export interface CLIPAnalysisResult {
  similarity_score: number
  product_type_detected: string
  product_type_confidence: number
  quality: QualityResult
  color: ColorAnalysisResult
  verdict: string
  verdict_reason: string
  model_used: string
  processing_time_ms: number
}
