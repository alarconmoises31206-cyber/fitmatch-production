export interface PlaybookResult {
  success: boolean;
  message: string;
  timestamp: string;
  actionsTaken: string[];
  metadata: Record<string, any>;
}

export interface RemediationPlaybook {
  name: string;
  description: string;
  execute(incident: any): Promise<PlaybookResult>;
}

export interface RemediationRule {
  id: string;
  name: string;
  description: string;
  conditions: Array<(incident: any) => boolean>;
  playbook: RemediationPlaybook;
  priority: number;
}

export interface RemediationRegistry {
  version: string;
  getRuleForIncident(incident: any): RemediationRule | null;
  getAllRules(): RemediationRule[];
  getPlaybookByName(name: string): RemediationPlaybook | null;
}
