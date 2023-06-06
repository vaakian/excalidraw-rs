const html = require("@rspack/plugin-html").default;
const env = process.env.NODE_ENV || "development";
const dotEnvFiles =
  env === "development" ? [".env.development"] : [".env.production"];

dotEnvFiles.forEach((doteEnvFile) => {
  require("dotenv-expand")(require("dotenv").config({ path: doteEnvFile }));
});
const REACT_APP = /^REACT_APP_/i;

const filterEnv = {};
const define = Object.keys(process.env)
  .filter((key) => REACT_APP.test(key))
  .reduce((env, key) => {
    filterEnv[key] = process.env[key];
    env[`process.env.${key}`] = JSON.stringify(process.env[key]);
    return env;
  }, {});
/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  entry: {
    main: "./src/index.tsx",
  },
  module: {
    rules: [
      {
        test: /.svg$/,
        type: "asset",
      },
      {
        test: /.scss$/,
        use: [
          {
            loader: "sass-loader",
          },
        ],
        type: "css",
      },
    ],
  },
  builtins: {
    define: {
      ...define,
      "import.meta.env && import.meta.env.MODE": JSON.stringify(
        process.env.NODE_ENV || "production",
      ),
      "process.env": JSON.stringify(filterEnv),
    },
    copy: {
      patterns: [
        {
          from: "public",
          globOptions: {
            ignore: ["**/index.html"],
          },
        },
      ],
    },
  },
  plugins: [
    new html({
      template: "./public/index.html",
      templateParameters: false,
    }),
  ],
  devServer: {
    open: true,
  },
};
