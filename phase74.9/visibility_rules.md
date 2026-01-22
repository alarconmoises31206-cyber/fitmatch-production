# Phase 74.9.2 — Visibility Gating Rules

## Rule 1: Unimplemented Page Disclosure
- Any page with status "placeholder" or "partially_implemented" must display explicit boundary notice
- No page should appear fully functional if core functionality is missing
- Placeholder indicators (??) must be replaced with explicit status labels

## Rule 2: Navigation Constraints
- Unimplemented pages must not be linked from primary navigation without disclosure
- Dead-end navigation paths must include explanatory text
- No "Coming soon" language allowed - use "Out of scope for current evaluation"

## Rule 3: Functional Promise Disclosure
- Buttons promising functionality (e.g., "Purchase Spin") must disclose implementation status
- If functionality is not fully implemented, button must be disabled with tooltip explanation
- Mock data must be clearly labeled as "Sample Data" or "Demonstration Only"

## Rule 4: System Boundary Labels
- Every page must include system boundary notice if not fully implemented
- Notice must be visible but not intrusive (footer or sidebar placement)
- Consistent wording across all surfaces

## Rule 5: Data Persistence Disclosure
- Features using localStorage instead of backend must include notice
- Notice must explain data is session-only or device-specific
- Clear indication of what will and won't persist

## Rule 6: Error Prevention
- Broken component references (e.g., missing TrainerDashboard) must be caught at build time
- Placeholder pages must render without errors
- Graceful degradation for missing functionality

## Rule 7: Reviewer Safety
- No exposed 404 errors during reviewer sessions
- All navigation paths must either work or explain why they don't
- Authentication walls must be clearly labeled

## Implementation Priority
1. Fix broken trainer-dashboard reference (highest risk)
2. Add boundary notices to all partially_implemented pages
3. Replace ?? placeholders with explicit status indicators
4. Add localStorage persistence notices
5. Update navigation with disclosure for unimplemented sections
