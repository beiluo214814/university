module.exports = {
  apps : [{
    name: 'myServer',
    script: 'npm start 119.45.220.76',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
        NODE_ENV: 'development'
    },
    env_production: {
        NODE_ENV: 'production'
    }
  }]
};
