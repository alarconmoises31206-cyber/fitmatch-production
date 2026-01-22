export declare const seedClients: {
    userId: string;
    userType: "client";
    answers: {
        questionId: string;
        answer: string;
    }[];
    completedAt: Date;
}[];
export declare const seedTrainers: {
    userId: string;
    userType: "trainer";
    answers: {
        questionId: string;
        answer: string;
    }[];
    completedAt: Date;
    metadata: {
        certification: string;
        availability: boolean;
        specialties: string[];
    };
}[];
export declare const edgeCaseTrainers: {
    userId: string;
    userType: "trainer";
    answers: {
        questionId: string;
        answer: string;
    }[];
    completedAt: Date;
    metadata: {
        certification: string;
        availability: boolean;
        specialties: never[];
    };
}[];
export declare const hardFilterTestCases: {
    userId: string;
    userType: "trainer";
    answers: {
        questionId: string;
        answer: string;
    }[];
    completedAt: Date;
    metadata: {
        certification: string;
        availability: boolean;
        specialties: string[];
    };
}[];
declare const _default: {
    seedClients: {
        userId: string;
        userType: "client";
        answers: {
            questionId: string;
            answer: string;
        }[];
        completedAt: Date;
    }[];
    seedTrainers: {
        userId: string;
        userType: "trainer";
        answers: {
            questionId: string;
            answer: string;
        }[];
        completedAt: Date;
        metadata: {
            certification: string;
            availability: boolean;
            specialties: string[];
        };
    }[];
    edgeCaseTrainers: {
        userId: string;
        userType: "trainer";
        answers: {
            questionId: string;
            answer: string;
        }[];
        completedAt: Date;
        metadata: {
            certification: string;
            availability: boolean;
            specialties: never[];
        };
    }[];
    hardFilterTestCases: {
        userId: string;
        userType: "trainer";
        answers: {
            questionId: string;
            answer: string;
        }[];
        completedAt: Date;
        metadata: {
            certification: string;
            availability: boolean;
            specialties: string[];
        };
    }[];
};
export default _default;
//# sourceMappingURL=index.d.ts.map