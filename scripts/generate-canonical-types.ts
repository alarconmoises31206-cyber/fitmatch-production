// scripts/generate-canonical-types.ts
import yaml from 'js-yaml';
import fs from 'fs';

const truthMap = yaml.load(fs.readFileSync('./docs/canonical/truth-map.yaml', 'utf8'));
const output = `// AUTO-GENERATED FROM truth-map.yaml
export interface TruthField {
  id: string;
  mode: 'client' | 'trainer';
  question_text: string;
  response_type: string;
  used_now: 'yes' | 'no';
  usage_type: 'filter' | 'constraint' | 'similarity' | 'display' | 'none';
  visible_to_other_party: 'yes' | 'no' | 'conditional';
  stored_for_future: 'yes' | 'no';
  future_use_note: string;
  risk_note: string;
  justification: string;
  origin_uncertain: boolean;
}

export const ClientFields: TruthField[] = ${JSON.stringify(truthMap.client_questionnaire.fields, null, 2)};
export const TrainerFields: TruthField[] = ${JSON.stringify(truthMap.trainer_questionnaire.fields, null, 2)};
`;

fs.writeFileSync('./src/canonical/truth-map.gen.ts', output);
