module.exports = {
  apps: [
    {
      name: "backend",
      script: "src/server/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_prod: {
        MNEMONIC: "",
        WSS_URL: "ws://127.0.0.1:9944",
      },
    },
    {
      name: "matrix",
      script: "src/matrix/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_prod: {
        MATRIX_ACCESS_TOKEN: "",
        MATRIX_USER_ID: "",
        BACKEND_URL: "",
      },
    },
    {
      name: "discord",
      script: "src/discord/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_prod: {
        TOKEN: "",
        BACKEND_URL: "",
      },
    },
  ],
};
