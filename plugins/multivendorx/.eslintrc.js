module.exports = {
    extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    globals: {
        wp: true,
        wpApiSettings: true,
        wcSettings: true,
        es6: true,
    },
    rules: {
    },
    parserOptions: {
        ecmaVersion: 8,
        ecmaFeatures: {
            modules: true,
            experimentalObjectRestSpread: true,
            jsx: true,
        },
    },
};
