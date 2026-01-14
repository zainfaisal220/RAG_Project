const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting unified server setup...');

// Start Flask backend server
console.log('📡 Starting Flask backend server on port 5000...');
const backendProcess = spawn('python', ['app.py'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

backendProcess.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backendProcess.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
});

backendProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  console.log('🎨 Starting Vite frontend server on port 3000...');
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });

  frontendProcess.stdout.on('data', (data) => {
    console.log(`[Frontend] ${data.toString().trim()}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    console.error(`[Frontend Error] ${data.toString().trim()}`);
  });

  frontendProcess.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit();
  });

}, 2000);

console.log('✅ Both servers starting...');
console.log('🌐 Backend API: http://localhost:5000');
console.log('🎨 Frontend: http://localhost:3000');
console.log('Press Ctrl+C to stop both servers');