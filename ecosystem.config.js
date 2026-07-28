module.exports = {
  apps: [{
    name: 'sathi-central-platform',
    script: 'src/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'development',
      PORT: 9090
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 9090
    }
  }]
};
