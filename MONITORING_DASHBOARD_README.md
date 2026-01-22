# Monitoring Dashboard UI

## Overview
Real-time internal monitoring dashboard for system health visualization. Admin-only access with Supabase authentication.

## Features
- Real-time health data polling every 5 seconds
- Service health status with circuit breaker states
- Queue monitoring with visual indicators
- System overview (uptime, version, database/Redis health)
- Automatic refresh with manual refresh option
- Admin-only access control

## Files Created

### 1. Hook
- `src/hooks/useHealthFeed.ts` - Health data polling hook

### 2. Components
- `src/components/monitor/SystemOverview.tsx` - System overview panel
- `src/components/monitor/ServiceHealthCard.tsx` - Individual service health card
- `src/components/monitor/QueueStatusCard.tsx` - Queue status card

### 3. Page
- `pages/admin/monitor/index.tsx` - Main dashboard page

## Authentication
The dashboard uses Supabase authentication and requires:
1. User must be logged in
2. User must have 'admin' role in the users table

## Usage

### Access the Dashboard
Navigate to: `/admin/monitor`

### API Endpoint
The dashboard fetches data from: `/api/monitor/health`

### Polling Interval
Default: 5 seconds (configurable in the hook)

## Styling
Built with TailwindCSS for lightweight, fast styling.

## Dependencies Used
- `lucide-react` - Icons
- `@supabase/auth-helpers-nextjs` - Authentication
- `react` & `next` - Core framework

## Status Indicators

### Service Status
- 🟢 **OK** - Fully operational
- 🟡 **DEGRADED** - Warning, unstable
- 🔴 **FAILED** - Needs immediate attention
- ⚪ **UNKNOWN** - No data or disabled

### Circuit Breaker States
- **CLOSED** - Normal operation
- **OPEN** - Service unavailable, failing fast
- **HALF_OPEN** - Testing if service recovered

### Queue Status
- **Green** - Empty or low queue
- **Blue** - Moderate queue
- **Yellow** - High queue (>50 items)
- **Red** - Dead items present

## Testing
To test the dashboard:
1. Ensure you're logged in as an admin user
2. Start the development server: `npm run dev`
3. Navigate to `http://localhost:3000/admin/monitor`
4. Verify data loads and refreshes every 5 seconds

## Next Steps (Phase 52)
Consider adding:
- Historical metrics charts
- Alert system integration
- Export functionality
- Additional metrics visualization
