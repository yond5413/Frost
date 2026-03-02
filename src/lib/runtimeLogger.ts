interface RuntimeLogContext {
  sceneId?: string;
  phase?: string;
  source?: string;
  mode?: 'deterministic' | 'ai';
  details?: Record<string, unknown>;
}

function serializeContext(context: RuntimeLogContext): string {
  const payload = {
    sceneId: context.sceneId,
    phase: context.phase,
    source: context.source,
    mode: context.mode,
    ...context.details,
  };

  return JSON.stringify(payload);
}

export function logRuntimeInfo(event: string, context: RuntimeLogContext = {}): void {
  console.info(`[FROST_RUNTIME] ${event} ${serializeContext(context)}`);
}

export function logRuntimeWarn(event: string, context: RuntimeLogContext = {}): void {
  console.warn(`[FROST_RUNTIME] ${event} ${serializeContext(context)}`);
}

export function logRuntimeError(event: string, context: RuntimeLogContext = {}): void {
  console.error(`[FROST_RUNTIME] ${event} ${serializeContext(context)}`);
}
