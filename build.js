const commandLineArgs = require('command-line-args');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');
const pkg = require('./package.json');

const input = './src/index.js';
const inputLocale = './src/index.locale.js';
const name = 'Now';
const watchOutputDefault = './example/nowjs.locale.js';
const outputDefault = './dist/nowjs.js';
const outputMinify = './dist/nowjs.min.js';
const outputLocale = './dist/nowjs.locale.js';
const outputLocaleMinify = './dist/nowjs.locale.min.js';
const pluginsDefault = [babel({
  plugins: ['external-helpers'],
  exclude: 'node_modules/**'
})];
const external = Object.keys(pkg.dependencies);
const format = 'umd';

const inputDefaultOptions = {
  input: input,
  external: external,
  plugins: pluginsDefault
};

const inputLocaleOptions = {
  input: inputLocale,
  external: external,
  plugins: pluginsDefault
};

const inputMinifyOptions = Object.assign({}, inputDefaultOptions, {
  plugins: [...pluginsDefault, uglify({}, minify)]
});

const inputLocaleMinifyOptions = Object.assign({}, inputLocaleOptions, {
  plugins: [...pluginsDefault, uglify({}, minify)]
});

const outputDefaultOptions = {
  file: outputDefault,
  format: format,
  name: name,
  sourcemap: true
};

const outputLocaleOptions = {
  file: outputLocale,
  format: format,
  name: name,
  sourcemap: true
};

const outputMinifyOptions = Object.assign({}, outputDefaultOptions, {
  file: outputMinify
});

const outputLocaleMinifyOptions = Object.assign({}, outputLocaleOptions, {
  file: outputLocaleMinify
});

const optionDefs = [{
  name: 'watch',
  alias: 'w',
  type: Boolean
}];

const options = commandLineArgs(optionDefs);

if (options.watch) {
  const config = (file, plugins) => {
    return {
      input: inputLocale,
      output: {
        file,
        format,
        name,
        sourcemap: true
      },
      plugins
    };
  };

  const configDefault = config(watchOutputDefault, pluginsDefault);
  const watcherDefault = rollup.watch(configDefault);

  const stderr = console.error.bind(console);

  const eventHandler = (event, filename) => {
    switch (event.code) {
      case 'START':
        stderr('start bundling...');
        break;
      case 'BUNDLE_START':
        stderr(`bundling ${filename}...`);
        break;
      case 'BUNDLE_END':
        stderr(
          `${filename} bundled in ${event.duration}ms. Watching for changes...`
        );
        break;
      case 'END':
        stderr(
          'finished building all bundles'
        );
        break;
      case 'ERROR':
        stderr(`error: ${event.error}`);
        break;
      default:
        stderr(`unknown event: ${event}`);
    }
  };

  watcherDefault.on('event', event => eventHandler(event, watchOutputDefault));
} else {
  // default
  rollup
    .rollup(inputDefaultOptions)
    .then(bundle => {
      bundle.write(outputDefaultOptions);
    });

  rollup
    .rollup(inputMinifyOptions)
    .then(bundle => {
      bundle.write(outputMinifyOptions);
    });

  // with locale
  rollup
    .rollup(inputLocaleOptions)
    .then(bundle => {
      bundle.write(outputLocaleOptions);
    });

  rollup
    .rollup(inputLocaleMinifyOptions)
    .then(bundle => {
      bundle.write(outputLocaleMinifyOptions);
    });
}
