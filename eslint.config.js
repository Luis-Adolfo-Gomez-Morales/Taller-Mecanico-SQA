
module.exports = [
  { ignores: ["build/**", "coverage/**", "reports/**"] },
  {
    files: ["main.js", "src/**/*.js", "scripts/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off",
      "eqeqeq": "warn",
      "no-unreachable": "error"
    }
  }
];
