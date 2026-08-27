/* Generated-style Typert contribution for the Rabi persona RPC. */

import { z } from 'zod'

const Settings = z.object({
  enabled: z.boolean(),
  managerBaseUrl: z.string(),
  roleId: z.string(),
})

const Persona = z.object({
  id: z.string(),
  label: z.string(),
})

const Status = z.object({
  online: z.boolean(),
  message: z.string(),
  personas: z.array(Persona),
  settings: Settings,
})

const Plan = z.object({
  id: z.string(),
  title: z.string(),
  focus: z.string(),
  status: z.string(),
  priority: z.string(),
  currentStep: z.string(),
  nextAction: z.string(),
  waitingFor: z.string(),
  updatedAt: z.string(),
})

const Plans = z.object({
  roleId: z.string(),
  plans: z.array(Plan),
})

export const TYPERT = {
  package: 'dsh-rabi-default-persona',
  face: 'host',
  schemas: [],
  model: { services: [], events: [], objects: [] },
  invocations: [
    {
      id: 'dsh-rabi-default-persona#rabiPersonaCatalog/status',
      service: 'rabiPersonaCatalog',
      namespace: 'rabiPersonaCatalog',
      method: 'status',
      invocation: { kind: 'direct' },
      parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-rabi-default-persona#RabiPersonaStatus', schema: Status },
      sourceLocation: { file: 'plugins/rabi-default-persona/src/index.ts', line: 195, column: 11 },
    },
    {
      id: 'dsh-rabi-default-persona#rabiPersonaCatalog/configure',
      service: 'rabiPersonaCatalog',
      namespace: 'rabiPersonaCatalog',
      method: 'configure',
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'request',
          wire: 'request',
          source: 'json',
          codec: { mode: 'strict', typeSymbol: 'dsh-rabi-default-persona#RabiPersonaBinding', schema: Settings },
        },
      ],
      result: { mode: 'strict', typeSymbol: 'dsh-rabi-default-persona#RabiPersonaStatus', schema: Status },
      sourceLocation: { file: 'plugins/rabi-default-persona/src/index.ts', line: 204, column: 11 },
    },
    {
      id: 'dsh-rabi-default-persona#rabiPersonaCatalog/plans',
      service: 'rabiPersonaCatalog',
      namespace: 'rabiPersonaCatalog',
      method: 'plans',
      invocation: { kind: 'direct' },
      parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-rabi-default-persona#RabiPlansStatus', schema: Plans },
      sourceLocation: { file: 'plugins/rabi-default-persona/src/index.ts', line: 219, column: 11 },
    },
  ],
}
