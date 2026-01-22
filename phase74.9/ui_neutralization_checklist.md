# Phase 74.9.4 — Visual Neutralization Checklist

## Color & Branding Neutralization
- [ ] Remove oversized icons that imply meaning beyond their function
- [ ] Ensure all primary action buttons use consistent, neutral colors
- [ ] Remove any persuasive marketing language from functional screens
- [ ] Replace branded gradients with solid colors where appropriate

## Layout & Hierarchy Neutralization  
- [ ] Ensure system outputs visually dominate navigation elements
- [ ] Make clickable elements clearly distinct from informational elements
- [ ] Remove decorative elements that don't serve functional purpose
- [ ] Ensure information density matches actual functionality

## Placeholder Treatment
- [ ] Replace all "??" placeholders with explicit status indicators
- [ ] Ensure placeholder content is visually distinct from real content
- [ ] Add "[Demo]" or "[Sample]" labels to mock data displays
- [ ] Remove animation from placeholder elements

## Navigation Neutralization
- [ ] Disable or clearly mark unimplemented navigation items
- [ ] Ensure breadcrumbs reflect actual available paths
- [ ] Remove "dead end" navigation that goes nowhere
- [ ] Add explanatory text for limited navigation scope

## Button & Control Neutralization
- [ ] Disable buttons that promise unimplemented functionality
- [ ] Add tooltips explaining why buttons are disabled
- [ ] Ensure all interactive elements have consistent disabled states
- [ ] Remove "hover" effects from non-functional elements

## Data Display Neutralization
- [ ] Clearly label localStorage-persisted data as "Session Only"
- [ ] Add timestamps to generated content to show recency
- [ ] Remove fake statistics or replace with actual counts
- [ ] Ensure all percentages reflect actual calculated values

## Error State Neutralization
- [ ] Replace browser-native alerts with styled system messages
- [ ] Ensure error messages don't expose system internals
- [ ] Add helpful guidance for recoverable errors
- [ ] Remove "debug" information from production view

## Mobile & Responsive Neutralization
- [ ] Ensure boundary notices are visible on all screen sizes
- [ ] Test disabled states on touch devices
- [ ] Verify placeholder treatment works in responsive layouts
- [ ] Check navigation constraints on mobile

## Priority Fixes (Based on Inventory)
1. Fix "??" placeholders on Home and Dashboard pages
2. Add "[Demo]" labels to matches page mock data
3. Disable "Purchase Spin" button with tooltip
4. Add boundary notice to all pages
5. Fix broken trainer-dashboard component reference
6. Add "Session Only" notice to localStorage features
