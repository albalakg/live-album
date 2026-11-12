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
  // Deep links (/event, /login, …) should fall back to index.html in local WDS.
  // If a given Node/WDS build still 404s these paths, open / then client-navigate,
  // or use a reverse proxy that rewrites SPA routes to index.html.
  devServer: {
    port: 8080,
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [{ from: /./, to: "/index.html" }],
    },
  },
};
