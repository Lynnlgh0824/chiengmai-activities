const { exec } = require('child_process');

// Find and kill the process running on port 3000
exec('lsof -ti:3000 | xargs kill -9', (error) => {
  if (error) {
    console.log('No server running on port 3000 or error occurred:', error.message);
  } else {
    console.log('Server stopped successfully');
  }
});
