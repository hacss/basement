const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");
const HtmlDeployPlugin = require("html-webpack-deploy-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const HtmlTagsPlugin = require("html-webpack-tags-plugin");
const VirtualModulePlugin = require("webpack-virtual-modules");
const path = require("path");

module.exports = (env, argv) => {
  const production = env === "production";
  return {
    mode: production ? "production" : "development",
    entry: {
      autoprefixer: "./lib/autoprefixer.js",
      app: "./app.js",
    },
    output: {
      path: path.join(__dirname, "public"),
      filename: production ? "[name].[contenthash].bundle.js" : "[name].bundle.js",
    },
    externals: {
      "ace-builds": "ace",
      autoprefixer: "autoprefixer",
      "css.escape": "CSS.escape",
      dompurify: "DOMPurify",
      "lz-string": "LZString",
    },
    resolve: {
      fallback: {
        path: false,
      },
      alias: {
        "core-js": "core-js-pure",
      },
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "CNAME" },
        ],
      }),
      new DefinePlugin({
        "process.argv": [],
        "process.env": {},
        "process.platform": "null",
        "process.stdout": {},
      }),
      new HtmlPlugin({ title: "Hacss Basement" }),
      new HtmlDeployPlugin({
        packages: {
          "ace-builds": {
            copy: [
              { from: "src-min-noconflict/ace.js", to: "ace.js" },
              { from: "src-min-noconflict/mode-html.js", to: "mode-html.js" },
              { from: "src-min-noconflict/theme-chrome.js", to: "theme-chrome.js" },
              { from: "src-min-noconflict/worker-html.js", to: "worker-html.js" },
            ],
            scripts: [
              {
                path: "ace.js", 
                cdnPath: "src-min-noconflict/ace.js",
              },
              {
                path: "mode-html.js", 
                cdnPath: "src-min-noconflict/mode-html.js",
              },
              {
                path: "theme-chrome.js", 
                cdnPath: "src-min-noconflict/theme-chrome.js",
              },
            ],
          },
          dompurify: {
            copy: [
              { from: "dist/purify.min.js", to: "purify.min.js" },
            ],
            scripts: {
              path: "purify.min.js",
              cdnPath: "dist/purify.min.js",
            },
          },
          "lz-string": {
            copy: [
              { from: "libs/lz-string.min.js", to: "lz-string.min.js" },
            ],
            scripts: {
              path: "lz-string.min.js",
              cdnPath: "libs/lz-string.min.js",
            },
          },
          "typeface-dohyeon": {
            copy: [
              { from: "BMDOHYEONttf.eot", to: "BMDOHYEONttf.eot" },
              { from: "BMDOHYEONttf.woff", to: "BMDOHYEONttf.woff" },
              { from: "BMDOHYEONttf.woff2", to: "BMDOHYEONttf.woff2" },
              { from: "dohyeon.css", to: "dohyeon.css" },
            ],
            links: {
              path: "dohyeon.css",
            },
          },
          "typeface-inter": {
            copy: [
              { from: "files", to: "files" },
              { from: "index.css", to: "index.css" },
            ],
            links: {
              path: "index.css",
            },
          },
        },
        append: false,
        useCdn: production,
      }),
      new VirtualModulePlugin({
        "./app.js": "require('@hacss/build');require('./src/Main.purs').main()",
      }),
    ],
    module: {
      rules: [
        {
          test: /@hacss\/build/,
          use: [
            "style-loader",
            "css-loader",
            "postcss-loader",
            { loader: "val-loader", options: { sources: "src/**/*.purs" } },
          ]
        },
        {
          test: /\.js$/,
          include: /node_modules\/postcss/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  [
                    "@babel/env",
                    {
                      useBuiltIns: "usage",
                      corejs: "3.8",
                      targets: "last 2 versions, not dead",
                    },
                  ],
                ],
                plugins: [
                  "@babel/plugin-transform-modules-commonjs",
                ],
              },
            },
          ],
        },
        {
          test: /lib\/autoprefixer\.js$/,
          use: [
            {
              loader: "string-replace-loader",
              options: {
                search: /^var\sautoprefixer/,
                replace: "window.autoprefixer",
              },
            },
          ],
        },
        {
          test: /\.purs$/,
          use: [
            {
              loader: "purs-loader",
              options: {
                spago: true,
                watch: argv.liveReload,
                src: ["src/**/*.purs"],
              },
            },
          ],
        },
      ],
    },
  };
};
