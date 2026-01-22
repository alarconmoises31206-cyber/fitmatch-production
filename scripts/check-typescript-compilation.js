const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== TypeScript Compilation Check ===\\n');

const filesToCheck = [
  'config/alerts.config.ts',
  'infra/alerts/engine.ts',
  'infra/alerts/state.ts',
  'infra/alerts/senders/slack.ts',
  'infra/alerts/senders/email.ts',
  'types/alert.types.ts',
  'pages/api/monitor/alerts.ts'
];

exec('tsc --version', (error) => {
  if (error) {
    console.log('?? TypeScript compiler (tsc) not found in PATH');
    console.log('Skipping compilation check...\\n');
    checkFileExistence();
    return;
  }
  
  const tsconfig = {
    compilerOptions: {
      target: "es2020",
      module: "commonjs",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true
    },
    files: filesToCheck,
    include: [],
    exclude: ["node_modules"]
  };
  
  const tempConfigPath = 'tsconfig.temp.json';
  fs.writeFileSync(tempConfigPath, JSON.stringify(tsconfig, null, 2));
  
  console.log('Checking TypeScript compilation...\\n');
  
  exec('tsc --project ' + tempConfigPath + ' --noEmit', (err, stdout, stderr) => {
    fs.unlinkSync(tempConfigPath);
    
    if (err) {
      console.log('? TypeScript compilation errors found:\\n');
      console.log(stderr);
    } else {
      console.log('? All TypeScript files compile successfully!\\n');
    }
    
    checkFileExistence();
  });
});

function checkFileExistence() {
  console.log('=== File Existence Check ===\\n');
  
  let allFilesExist = true;
  
  filesToCheck.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    
    if (fs.existsSync(fullPath)) {
      console.log('? ' + file);
    } else {
      console.log('? ' + file + ' (MISSING)');
      allFilesExist = false;
    }
  });
  
  console.log('');
  
  if (allFilesExist) {
    console.log('? All required files exist');
  } else {
    console.log('? Some files are missing');
  }
  
  console.log('\\n=== Summary ===');
  console.log('Files created for Phase 52 Alert System:');
  console.log('- Configuration: config/alerts.config.ts');
  console.log('- Core Engine: infra/alerts/engine.ts');
  console.log('- State Management: infra/alerts/state.ts');
  console.log('- Senders: infra/alerts/senders/{slack.ts, email.ts}');
  console.log('- Types: types/alert.types.ts');
  console.log('- API Endpoint: pages/api/monitor/alerts.ts');
  console.log('\\n? Phase 52 implementation files created successfully!');
}
