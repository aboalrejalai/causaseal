import { z } from "zod"

export const IncidentInputSchema = z.object({
  prompt: z.string(),
  untrustedContent: z.string(),
  agent: z.string(),
  tool: z.string(),
  trustedDestination: z.boolean(),
  elevatedPrivilege: z.boolean(),
  sensitiveData: z.boolean(),
})

export const CausalNodeSchema = z.object({
  label: z.string(),
  value: z.string(),
  risk: z.boolean(),
})

export const AnalysisResultSchema = z.object({
  decision: z.enum(["ALLOW", "VERIFY", "INTERVENE"]),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  matchedSignature: z.string(),
  evidenceStrength: z.number().min(0).max(1),
  nodes: z.array(CausalNodeSchema).min(4).max(4),
  mode: z.enum(["rules", "ai"]),
  warning: z.string().optional(),
})

export const FingerprintSchema = z.object({
  id: z.string(),
  title: z.string(),
  desc: z.string(),
  tags: z.array(z.string()),
  matches: z.number(),
  confidence: z.string(),
  date: z.string(),
})

export const AgentEventSchema = z.object({
  time: z.string(),
  agent: z.string(),
  tool: z.string(),
  path: z.string(),
  status: z.enum(["blocked", "verify", "allowed"]),
  label: z.string(),
  confidence: z.string(),
})

export const MutationOptionSchema = z.object({
  signatureId: z.string(),
  count: z.number().min(1).max(24).default(6),
  changePrompt: z.boolean().default(true),
  changeTool: z.boolean().default(true),
  changeData: z.boolean().default(true),
  changePrivilege: z.boolean().default(false),
})

export const MutationResultSchema = z.object({
  index: z.number(),
  title: z.string(),
  similarity: z.number(),
  outcome: z.enum(["ALLOW", "DETECTED"]),
})

export const MutationRunSchema = z.object({
  signatureId: z.string(),
  score: z.number(),
  results: z.array(MutationResultSchema),
  illustrative: z.literal(true).default(true),
})

export const ComplianceControlSchema = z.object({
  id: z.string(),
  framework: z.enum(["NCA", "OWASP"]),
  title: z.string(),
  status: z.enum(["mapped", "partial", "planned"]),
  notes: z.string(),
})

export const XcfsReduceResultSchema = z.object({
  signature: z.string(),
  reductionRatio: z.number(),
  invariants: z.array(z.string()),
  illustrative: z.literal(true).default(true),
})
