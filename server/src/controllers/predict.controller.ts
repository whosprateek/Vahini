import { Request, Response } from 'express'

// Simple rule-based classifier based on user's step-by-step plan
// Labels: Healthy, Overloaded, Short Circuit, Break (Open Circuit)
// Inputs: current_start, current_end (optionally voltage_* unused for now)
// Derived: current_difference = current_start - current_end

import { env } from '../config/env'

export function predictFault(req: Request, res: Response) {
  const { current_start, current_end } = req.body || {}

  const cs = Number(current_start)
  const ce = Number(current_end)
  if (!Number.isFinite(cs) || !Number.isFinite(ce)) {
    return res.status(400).json({ error: 'current_start and current_end must be numbers' })
  }

  const diff = cs - ce
  const abs = Math.abs
  const maxCur = Math.max(abs(cs), abs(ce), 1)

  // Thresholds (adjustable via env)
  const OVERLOAD_THRESHOLD = env.PREDICT_OVERLOAD_THRESHOLD
  const SHORT_CCT_THRESHOLD = env.PREDICT_SHORT_CCT_THRESHOLD
  const BREAK_MIN_START = env.PREDICT_BREAK_MIN_START
  const BALANCE_TOLERANCE = env.PREDICT_BALANCE_TOLERANCE

  let label: 'Healthy'|'Overloaded'|'Short Circuit'|'Break' = 'Healthy'
  let color: 'green'|'yellow'|'red'|'grey' = 'green'
  let reason = ''

  // Short Circuit: sudden abnormal surge
  if (cs >= SHORT_CCT_THRESHOLD || ce >= SHORT_CCT_THRESHOLD) {
    label = 'Short Circuit'
    color = 'red'
    reason = `Detected surge (cs=${cs}A, ce=${ce}A ≥ ${SHORT_CCT_THRESHOLD}A)`
  }
  // Break: start normal but end ~ 0
  else if (cs >= BREAK_MIN_START && abs(ce) <= 1) {
    label = 'Break'
    color = 'grey'
    reason = `Open circuit signature (start=${cs}A, end≈0A)`
  }
  // Overloaded: both ends high but flowing
  else if (cs >= OVERLOAD_THRESHOLD && ce >= OVERLOAD_THRESHOLD) {
    label = 'Overloaded'
    color = 'yellow'
    reason = `Both currents high (start=${cs}A, end=${ce}A ≥ ${OVERLOAD_THRESHOLD}A)`
  }
  // Healthy: balanced within tolerance
  else if (abs(diff) <= BALANCE_TOLERANCE * maxCur) {
    label = 'Healthy'
    color = 'green'
    reason = `Balanced currents within ${(BALANCE_TOLERANCE*100).toFixed(0)}% (Δ=${diff.toFixed(2)}A)`
  } else {
    // Slight imbalance; treat as healthy for now
    label = 'Healthy'
    color = 'green'
    reason = `Slight imbalance (Δ=${diff.toFixed(2)}A) under thresholds`
  }

  return res.json({
    input: { current_start: cs, current_end: ce },
    derived: { current_difference: diff },
    result: { label, color, reason },
    thresholds: {
      OVERLOAD_THRESHOLD,
      SHORT_CCT_THRESHOLD,
      BREAK_MIN_START,
      BALANCE_TOLERANCE,
    }
  })
}

export function getPredictConfig(req: Request, res: Response) {
  return res.json({
    thresholds: {
      OVERLOAD_THRESHOLD: env.PREDICT_OVERLOAD_THRESHOLD,
      SHORT_CCT_THRESHOLD: env.PREDICT_SHORT_CCT_THRESHOLD,
      BREAK_MIN_START: env.PREDICT_BREAK_MIN_START,
      BALANCE_TOLERANCE: env.PREDICT_BALANCE_TOLERANCE,
    }
  })
}
