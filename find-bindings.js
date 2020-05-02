import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import _ from 'lodash';
import _glob from 'glob';
import util from 'util';
import fs from 'fs';

const glob = util.promisify(_glob);

const getAllFilesWithName = async nameGlob => {
  return glob(__dirname + nameGlob, {});
};

async function main() {
  let files = await getAllFilesWithName('/src/**/*.component.js');
  const tsFiles = await getAllFilesWithName('/src/**/*.component.ts');
  files = files.concat(tsFiles);

  const allBindings = files.map(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const componentName = _.last(file.split('/'));

    let componentBindings = [];
    try {
      const ast = babelParser.parse(content, {errorRecovery: true, sourceType: 'unambiguous'});
      traverse(ast, {
        enter: path => {
          if (path.type === 'VariableDeclaration') {
            const declarations = path.node.declarations;
            if (
              declarations &&
              declarations[0].id.name === 'bindings'
            ) {
              const bindings = declarations[0].init.properties.map(property => {
                return {
                  name: property.key.name,
                  type: property.value.value,
                };
              });
              componentBindings = componentBindings.concat(bindings);
            }
          }
        },
      });
    } catch (err) {
      console.error('Couldnt parse', file, ':', err);
    }

    return {
      name: componentName,
      bindings: componentBindings,
    };
  });

  return allBindings;
}

const bindingsToCsv = allComponentBindings => {
  const val = _.compact(allComponentBindings.map(componentBinding => {
    return componentBinding.bindings.map(binding => {
      return `${componentBinding.name},${binding.name},${binding.type}`;
    }).join('\n');
  }));
  return val.join('\n');
};

main()
.then(bindingsToCsv)
.then(console.log)
.catch(err => {
  console.error('Failed to run', err);
});

// esprima.parseScript(content)
