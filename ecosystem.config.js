module.exports = {
  apps: [{
    name: 'blog-backend',
    script: 'index.js',
    cwd: '/home/thanhtrongvo/projects/BlogMernStack/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5300
    }
  }]
};
