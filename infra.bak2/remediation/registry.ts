import { RemediationRegistry } from './types';
import { remediationRules, findMatchingRule } from './rules';

export const remediationRegistry: RemediationRegistry = {
  version: '1.1',
  
  getRuleForIncident(incident: any) {
    return findMatchingRule(incident)
  },
  
  getAllRules() {
    return remediationRules;
  },
  
  getPlaybookByName(name: string) {
    const rule = remediationRules.find(r => r.playbook.name === name)
    return rule?.playbook || null;
  }
}
