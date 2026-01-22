"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_1 = require("./api");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        phase: '69 - Ranking & Selection',
        timestamp: new Date().toISOString()
    });
});
// API routes
app.use('/api/match', (0, api_1.createRankingAPI)());
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        phase: '69',
        invariant: 'System failed gracefully'
    });
});
// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Phase 69 Ranking API running on port ${PORT}`);
        console.log('Phase Thesis: "FitMatch does not discover the best trainer.');
        console.log('              It orders viable trainers according to declared human intent."');
        console.log('\nNon-negotiable invariants:');
        console.log('1. Hard filters eliminate before ranking');
        console.log('2. Weights remain human-set');
        console.log('3. Cosine similarity never overrides exclusions');
        console.log('4. Ranking is deterministic');
        console.log('5. Explainability survives ordering');
        console.log('6. System works with embeddings disabled');
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map