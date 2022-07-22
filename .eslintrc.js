module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        "plugin:node/recommended",
    ],
    rules: {
        '@typescript-eslint/no-var-requires': 0,
        "node/no-unsupported-features/es-syntax": ["error", {ignores: ["modules"]}],
        "@typescript-eslint/no-explicit-any": ["off"]
    },
    settings: {
        node: {
            tryExtensions: [".js", ".json", ".node", ".ts"],
        },
    },
};
