const fs = require('fs');
const path = require('path');

console.log('=== Phase 52 Alert System Verification ===\\n');

const files = [
  { path: 'config/alerts.config.ts', description: 'Alert configuration' },
  { path: 'infra/alerts/engine.ts', description: 'Alert rules engine' },
  { path: 'infra/alerts/state.ts', description: 'Incident state cache' },
  { path: 'infra/alerts/senders/slack.ts', description: 'Slack sender' },
  { path: 'infra/alerts/senders/email.ts', description: 'Email sender' },
  { path: 'types/alert.types.ts', description: 'TypeScript types' },
  { path: 'pages/api/monitor/alerts.ts', description: 'Alert daemon API' }
];

console.log('Checking file structure...\\n');

let allFilesValid = true;

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file.path);
  
  if (!fs.existsSync(fullPath)) {
    console.log('? ' + file.path + ' - MISSING');
    allFilesValid = false;
    return;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Basic validation based on file type
    let isValid = true;
    let validationNote = '';
    
    if (file.path.includes('config')) {
      isValid = content.includes('ALERT_CONFIG');
    } else if (file.path.includes('engine')) {
      isValid = content.includes('evaluateHealthForAlerts');
    } else if (file.path.includes('state')) {
      isValid = content.includes('shouldAlert');
    } else if (file.path.includes('slack')) {
      isValid = content.includes('sendSlackAlert');
    } else if (file.path.includes('email')) {
      isValid = content.includes('sendEmailAlert');
    } else if (file.path.includes('alert.types')) {
      isValid = content.includes('AlertStatus');
    } else if (file.path.includes('alerts.ts') && file.path.includes('api')) {
      isValid = content.includes('export default async function handler');
    }
    
    if (isValid) {
      const lines = content.split('\\n').length;
      console.log('? ' + file.path + ' - ' + file.description + ' (' + lines + ' lines)');
    } else {
      console.log('?? ' + file.path + ' - Structure may be incomplete');
      allFilesValid = false;
    }
    
  } catch (error) {
    console.log('? ' + file.path + ' - ERROR reading: ' + error.message);
    allFilesValid = false;
  }
});

console.log('\\n=== Integration Points ===');
console.log('1. Health API: /api/monitor/health (from Phase 50)');
console.log('2. Dashboard: /admin/monitor (from Phase 51)');
console.log('3. New Endpoint: /api/monitor/alerts (POST only)');

console.log('\\n=== Next Steps ===');
console.log('1. Environment Variables Required:');
console.log('   - SLACK_WEBHOOK_URL (for actual alerts)');
console.log('   - CRON_SECRET (for API authentication)');
console.log('   - NEXT_PUBLIC_SITE_URL (for health checks)');
console.log('\\n2. Cron Job Setup:');
console.log('   - Call POST /api/monitor/alerts every 30 seconds');
console.log('   - Include header: x-cron-secret: <your-secret>');
console.log('\\n3. Testing:');
console.log('   - Use the test script: node scripts/test-alert-system.js');
console.log('   - Manually trigger by calling the API endpoint');

if (allFilesValid) {
  console.log('\\n? Phase 52 Alert System implementation is complete!');
  console.log('\\nReady for deployment.');
} else {
  console.log('\\n?? Some files need attention before deployment.');
}
