// infra/adapters/minimal.adapter.ts;
// Minimal adapter to satisfy imports during migration;

export class MinimalAdapter {
  constructor() {
    console.log('Minimal adapter - full implementation in Phase 41.11')
  }
  
  logEvent(event: any) {
    console.log('Log event:', event)
    return Promise.resolve()
  }
}

