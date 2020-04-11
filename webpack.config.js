const path = require("path");
const terser = require("terser");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const HtmlTagsPlugin = require("html-webpack-tags-plugin");

module.exports = {
  entry: ["hacss/output", "./src/app.js"],
  output: {
    path: path.join(__dirname, "public"),
    filename: "app.js",
  },
  mode: "production",
  plugins: [
    new CopyPlugin([
      {
        from: "node_modules/ace-builds/src-min/**/*",
        to: "ace",
        flatten: true,
      },
      {
        from: "lib/autoprefixer.js",
        transform: content => terser.minify(content.toString()).code,
      },
      {
        from: "CNAME",
      },
    ]),
    new HtmlPlugin({
      title: "Basement Hacss",
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
      },
    }),
    new HtmlTagsPlugin({
      tags: ["ace/ace.js", "autoprefixer.js"],
      append: false,
    }),
  ],
  externals: ["ace", "autoprefixer"],
  module: {
    rules: [
      {
        test: /hacss\/output/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "val-loader",
            options: {
              sources: "./src/app.js",
            },
          },
        ],
      },
      {
        test: /test/,
        use: [
          {
            loader: "raw-loader",
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\/test\/index\.html$/,
        use: [
          {
            loader: "string-replace-loader",
            options: {
              search: `<link rel="stylesheet" href="styles.css" />\n`,
              replace: "",
            },
          },
        ],
      },
    ],
  },
};
