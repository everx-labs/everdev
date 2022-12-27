module.exports = {
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.json",
        },
    },
    moduleFileExtensions: ["ts", "js"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    modulePathIgnorePatterns: [".*\\.d\\.ts"],
    testMatch: ["**/test/**/*.+(ts)", "**/__tests__/**/*.+(ts|tsx)"],
    testEnvironment: "node",
}
