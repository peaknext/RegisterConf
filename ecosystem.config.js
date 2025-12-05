module.exports = {
  apps: [
    {
      name: "registerconf",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      cwd: "a:/RegisterConf",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
        AUTH_TRUST_HOST: "true",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      // Logging
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true,
      // Graceful shutdown
      kill_timeout: 5000,
    },
  ],
};
