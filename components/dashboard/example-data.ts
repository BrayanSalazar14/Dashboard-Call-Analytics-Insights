// Datos de ejemplo para desarrollo y demostración
export const exampleMetrics = {
  total_calls: 150,
  inbound: 85,
  outbound: 65,
  by_status: {
    ended: 120,
    missed: 15,
    in_progress: 10,
    failed: 5,
  },
  by_disconnection_reason: {
    user_hangup: 60,
    agent_hangup: 45,
    call_transfer: 25,
    technical_issue: 12,
    timeout: 8,
  },
}

export const exampleResponse = {
  data: exampleMetrics,
  cached: false,
  lastUpdate: new Date().toISOString(),
}

