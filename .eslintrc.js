module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
    },
    plugins: ["@typescript-eslint", "prettier", "jest"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        // "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
    ],
    rules: {
        "no-empty": "warn",
        "prettier/prettier": 2,
        "no-implicit-coercion": ["warn", { allow: ["!!"] }],
        curly: ["error", "all"],
    },
    env: {
        node: true,
        "jest/globals": true,
    },
}
