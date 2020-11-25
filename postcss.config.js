module.exports = {
    plugins: [
        require('autoprefixer')({ grid: true }),
        require('postcss-pxtorem')({
            // rootValue: 16,
            unitPrecision: 5,
            propList: ['*', '!border'],
            selectorBlackList: [],
            replace: true,
            mediaQuery: false,
            minPixelValue: 0,
        }),
        require('css-mqpacker')({
            sort: require('sort-css-media-queries').desktopFirst,
        }),
    ],
}
