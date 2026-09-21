import { z } from "zod"

import {
  AgentEventSchema,
  AnalysisResultSchema,
  CausalNodeSchema,
  ComplianceControlSchema,
  FingerprintSchema,
  IncidentInputSchema,
  MutationOptionSchema,
  MutationResultSchema,
  MutationRunSchema,
  XcfsReduceResultSchema,
} from "../engine/contracts.mjs"

export {
  AgentEventSchema,
  AnalysisResultSchema,
  CausalNodeSchema,
  ComplianceControlSchema,
  FingerprintSchema,
  IncidentInputSchema,
  MutationOptionSchema,
  MutationResultSchema,
  MutationRunSchema,
  XcfsReduceResultSchema,
}

export type IncidentInput = z.infer<typeof IncidentInputSchema>
export type CausalNode = z.infer<typeof CausalNodeSchema>
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>
export type Fingerprint = z.infer<typeof FingerprintSchema>
export type AgentEvent = z.infer<typeof AgentEventSchema>
export type MutationOption = z.infer<typeof MutationOptionSchema>
export type MutationResult = z.infer<typeof MutationResultSchema>
export type MutationRun = z.infer<typeof MutationRunSchema>
export type ComplianceControl = z.infer<typeof ComplianceControlSchema>
export type XcfsReduceResult = z.infer<typeof XcfsReduceResultSchema>
