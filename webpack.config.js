// webpack.config.js
const Encore = require('@symfony/webpack-encore');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const DotenvPlugin = require('webpack-dotenv-plugin');

Encore
// the project directory where all compiled assets will be stored
    .setOutputPath('build/')

    // the public path used by the web server to access the previous directory
    .setPublicPath('/')

    // will create public/build/app.js and public/build/app.css
    .addEntry('app', './assets/js/app.js')

    .enablePostCssLoader()

    .configureBabel(function (babelConfig) {
        // add additional presets
        babelConfig.presets.push('es2017');

        // no plugins are added by default, but you can add some
        // babelConfig.plugins.push('styled-jsx/babel');
    })

    // allow legacy applications to use $/jQuery as a global variable
    //.autoProvidejQuery()

    // enable source maps during development
    .enableSourceMaps(!Encore.isProduction())

    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()

    // show OS notifications when builds finish/fail
    .enableBuildNotifications()

    // create hashed filenames (e.g. app.abc123.css)
    // .enableVersioning()

    // allow sass/scss files to be processed
    .enableSassLoader((options) => {
        return {
            data: `$beta: ${process.env.BETA};`,
        };
    })

    .addPlugin(new DotenvPlugin({
        sample: './.env.dist',
        path: './.env'
    }))

    .addPlugin(new HtmlWebpackPlugin({
        inlineSource: '.(js|css)$',
        template: './assets/index.html',
        filename: './index.html', //relative to root of the application
        templateParameters: {
            beta: process.env.BETA,
        }
    }))

    .addPlugin(new FaviconsWebpackPlugin({
        logo: './assets/img/icon.png',
        persistentCache: true,
        title: 'PixIOTA',
        icons: {
            android: true,
            appleIcon: true,
            appleStartup: false,
            coast: false,
            favicons: true,
            firefox: false,
            opengraph: false,
            twitter: false,
            yandex: false,
            windows: false
        }
    }))
;

if (Encore.isProduction()) {
    Encore
        .addPlugin(new HtmlWebpackInlineSourcePlugin())
    ;
}

// export the final configuration
module.exports = Encore.getWebpackConfig();

console.log("http://localhost:8081/");