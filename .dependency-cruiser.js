// .dependency-cruiser.js - Phase 43 Architecture Rules
module.exports = {
  forbidden: [
    // =============================================
    // PHASE 41 ARCHITECTURE RULES
    // =============================================

    // RULE 1: Domain layer purity
    {
      name: 'no-domain-to-infra',
      severity: 'error',
      comment: 'Domain layer must not depend on infrastructure layer',
      from: { path: '^domain/' },
      to: {
        path: '^infra/',
        dependencyTypesNot: ['type-only']
      }
    },
    {
      name: 'no-domain-to-app',
      severity: 'error',
      comment: 'Domain layer must not depend on application layer',
      from: { path: '^domain/' },
      to: {
        path: '^app/',
        dependencyTypesNot: ['type-only']
      }
    },

    // RULE 2: Infrastructure independence
    {
      name: 'no-infra-to-app',
      severity: 'error',
      comment: 'Infrastructure should not depend on application layer',
      from: { path: '^infra/' },
      to: {
        path: '^app/',
        dependencyTypesNot: ['type-only']
      }
    },

    // =============================================
    // PHASE 43 ENFORCEMENT: DOMAIN ENERGY GRID
    // =============================================
    {
      name: 'no-infra-in-domain',
      severity: 'error',
      comment: 'DOMAIN ENERGY GRID: Domain must not import from Infra',
      from: { path: '^domain' },
      to: { path: '^infra' }
    },
    {
      name: 'no-api-direct-infra',
      severity: 'error',
      comment: 'DOMAIN ENERGY GRID: API must not call Infra directly',
      from: { path: '^pages/api' },
      to: { 
        path: '^(infra/(adapters|stripe|db))',
        pathNot: '^infra/observability' // Allow observability
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: [
        'npm',
        'npm-dev',
        'npm-optional',
        'npm-peer',
        'npm-bundled',
      ]
    },
    includeOnly: {
      path: '^(domain|infra|pages/api|app)'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    }
  }
}
