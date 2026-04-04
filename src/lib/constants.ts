// src/lib/constants.ts
export const DEPARTMENTS = ['Publicity', 'Software', 'Inspire', 'Connectors', 'Monthly Meet-ups']
export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const
export const PILLAR_STATUSES = ['New', 'In Progress', 'In Review', 'Done'] as const
export const DEADLINE_THRESHOLDS = { urgent: 7, inView: 14, new : 30 } // days
export const DEPT_COLOURS = { Publicity: '#...', Tech: '#...' }