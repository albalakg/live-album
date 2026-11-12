const path = require("path");

module.exports = {
  transpileDependencies: ["@snapshare/design"],
  configureWebpack: {
    resolve: {
      alias: {
        "@snapshare/design": path.resolve(__dirname, "../../packages/design/src"),
      },
    },
  },
};
