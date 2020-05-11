const path = require("path");
const terser = require("terser");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const HtmlTagsPlugin = require("html-webpack-tags-plugin");

module.exports = (_, { mode }) => ({
  entry: ["./src/main.js", "@hacss/build"],
  output: {
    path: path.join(__dirname, "public"),
    filename: "bundle.js",
  },
  mode: mode || "development",
  externals: {
    ace: "ace",
    dompurify: "DOMPurify",
    "lz-string": "LZString",
    "prop-types": "PropTypes",
    react: "React",
    "react-ace": "ReactAce",
    "react-dom": "ReactDOM",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new CopyPlugin([
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
      links: [
        "https://fonts.googleapis.com/css?family=Do+Hyeon&display=swap",
        "https://fonts.googleapis.com/css?family=Inter:300,400,500&display=swap",
      ],
      scripts: [
        `https://cdnjs.cloudflare.com/ajax/libs/react/16.13.1/umd/react.${
          mode === "production" ? "production.min" : "development"
        }.js`,
        "https://cdnjs.cloudflare.com/ajax/libs/react-ace/8.1.0/react-ace.min.js",
        `https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.13.1/umd/react-dom.${
          mode === "production" ? "production.min" : "development"
        }.js`,
        "https://cdnjs.cloudflare.com/ajax/libs/prop-types/15.7.2/prop-types.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.0.10/purify.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11/ace.min.js",
        "https://unpkg.com/@hacss/core@1.1.0/dist/hacss.umd.min.js",
        "https://unpkg.com/@hacss/plugin-copy@1.1.1/dist/hacss-plugin-copy.umd.min.js",
        "https://unpkg.com/@hacss/plugin-delete@1.1.2/dist/hacss-plugin-delete.umd.min.js",
        "https://unpkg.com/@hacss/plugin-expand@1.1.1/dist/hacss-plugin-expand.umd.min.js",
        "https://unpkg.com/@hacss/plugin-variables@1.2.0/dist/hacss-plugin-variables.umd.min.js",
        "autoprefixer.js",
      ],
      append: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /@hacss\/build/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "val-loader",
            options: {
              sources: ["src/**/*.js", "src/**/*.jsx"],
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
});
