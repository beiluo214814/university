module.exports = {
  apps : [{
    name: 'myServer',
    script: 'npm start 118.195.233.117',
    instances: 4,
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
