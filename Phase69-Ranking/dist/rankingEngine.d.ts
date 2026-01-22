import { TrainerCandidate, ClientData, HardFilterRule, WeightClass, RankedTrainer } from './types';
export declare class RankingEngine {
    private clientData;
    private allTrainers;
    private hardFilterRules;
    private weightClasses;
    constructor(clientData: ClientData, allTrainers: TrainerCandidate[], hardFilterRules: HardFilterRule[], weightClasses: WeightClass[]);
    private assembleCandidatePool;
    private applyHardFilters;
    private checkHardFilter;
    private calculateDeterministicScore;
    private calculateQuestionSimilarity;
    private calculateVaguenessPenalty;
    private calculateConfidence;
    private sortTrainersByScore;
    private generateExplanation;
    private handleFailureModes;
    rankTrainers(): {
        rankedTrainers: RankedTrainer[];
        metadata: any;
    };
}
//# sourceMappingURL=rankingEngine.d.ts.map