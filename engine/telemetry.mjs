/** Seeded live-telemetry events (illustrative until a real feed exists). */

export const SEED_EVENTS = [
  {
    time: "09:42:18",
    agent: "Finance Copilot",
    tool: "send_to_workspace",
    path: "PDF → Decision → External API",
    status: "blocked",
    label: "INTERVENE",
    confidence: "94%",
  },
  {
    time: "09:41:05",
    agent: "HR Assistant",
    tool: "read_employee_file",
    path: "User → HR DB → Summary",
    status: "allowed",
    label: "ALLOW",
    confidence: "99%",
  },
  {
    time: "09:38:44",
    agent: "Operations Agent",
    tool: "export_document",
    path: "Email → Agent → Unknown Drive",
    status: "verify",
    label: "VERIFY",
    confidence: "81%",
  },
  {
    time: "09:35:12",
    agent: "Support Agent",
    tool: "search_knowledge",
    path: "Ticket → KB → Response",
    status: "allowed",
    label: "ALLOW",
    confidence: "98%",
  },
  {
    time: "09:31:27",
    agent: "Procurement AI",
    tool: "invoke_vendor_api",
    path: "Web → Tool → Vendor API",
    status: "blocked",
    label: "RESTRICT",
    confidence: "89%",
  },
  {
    time: "09:28:09",
    agent: "Finance Copilot",
    tool: "query_database",
    path: "User → Finance DB → Chart",
    status: "allowed",
    label: "ALLOW",
    confidence: "97%",
  },
  {
    time: "09:22:33",
    agent: "Legal Reviewer",
    tool: "share_document",
    path: "Contract → Agent → Team Space",
    status: "verify",
    label: "VERIFY",
    confidence: "76%",
  },
]

/**
 * @param {{ status?: string, q?: string }} [filter]
 */
export function listEvents(filter = {}) {
  let events = [...SEED_EVENTS]
  if (filter.status && filter.status !== "all") {
    events = events.filter((e) => e.status === filter.status)
  }
  if (filter.q) {
    const q = filter.q.toLowerCase()
    events = events.filter((e) => Object.values(e).join(" ").toLowerCase().includes(q))
  }
  return events
}
