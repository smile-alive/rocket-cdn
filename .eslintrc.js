module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  extends: ["@webpack-contrib/eslint-config-webpack", "prettier"],
  rules: {
    "prefer-promise-reject-errors": "off",
    "no-param-reassign": "off",
  },
};
