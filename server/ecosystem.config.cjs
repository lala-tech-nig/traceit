module.exports = {
  apps: [{
    name: "traceit-server",
    script: "./index.js",
    watch: true,
    ignore_watch: [
      "node_modules",
      "upload",
      "db.json"
    ],
    env: {
      NODE_ENV: "production",
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G"
  }]
}
