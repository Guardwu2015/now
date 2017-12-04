const fs = require('fs');
const path = require('path');

const ignoreFiles = ['index.js', 'index.locale.js'];
const dashReg = /-/;

function listLocales() {
  const locales = fs.readdirSync(path.join(process.cwd(), 'src', 'i18n'));
  return locales
    .filter((file) => !ignoreFiles.includes(file))
    .map(locale => ({
      name: locale.slice(0, locale.length - 3),
      parseName: locale.slice(0, locale.length - 3).replace(dashReg, ''),
    }));
}

const locales = listLocales();

function generateIndex(files) {
  const imports = files.map((file) => `import ${file.parseName} from './${file.name}'`);
  const exports = files.map((file) => {
    if (dashReg.test(file.name)) {
      return `  '${file.name}': ${file.parseName}`;
    }
    return `  ${file.name}`;
  });

  const indexLines = []
    .concat(imports.join(';\n'))
    .concat('\n')
    .concat('export default {')
    .concat(exports.join(',\n'))
    .concat('}')
    .join('\n')

  return `${indexLines};`;
}

fs.writeFileSync(path.join(process.cwd(), 'src', 'i18n', 'index.locale.js'), generateIndex(locales));
