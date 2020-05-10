module.exports = {
  extends: [
    "@hacss",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["react", "react-hooks"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
