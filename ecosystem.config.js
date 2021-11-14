module.exports = {
  apps: [
    {
      name: "server",
      script: "./server.js",
      exec_mode: "cluster",
      instances: 2,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
