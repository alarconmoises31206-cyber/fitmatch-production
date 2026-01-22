import { HardFilterRule, WeightClass } from '../Phase69-Ranking/src/types';
export interface QuestionnaireAnswer {
    questionId: string;
    answer: string;
    weightClass?: 'primary' | 'secondary' | 'exclusion';
}
export interface Questionnaire {
    userId: string;
    userType: 'client' | 'trainer';
    answers: QuestionnaireAnswer[];
    completedAt: Date;
}
export declare function generateQuestionEmbeddings(questionnaire: Questionnaire): Record<string, number[]>;
export declare class Phase71IntegrationPipeline {
    private hardFilterRules;
    private weightClasses;
    constructor(hardFilterRules: HardFilterRule[], weightClasses: WeightClass[]);
    executePipeline(clientQuestionnaire: Questionnaire, trainerQuestionnaires: Questionnaire[]): Promise<{
        rankedTrainers: any[];
        explanations: any[];
        logs: string[];
        intermediateStates: any;
    }>;
    private logIntermediateStates;
    testGracefulDegradation(): {
        withEmbeddings: any;
        withoutEmbeddings: any;
    };
}
export declare function runFounderTest(): Promise<void>;
export default Phase71IntegrationPipeline;
//# sourceMappingURL=phase71_integration.d.ts.map