module.exports = function(babel) {
  const { types: t } = babel;
  let templateNode;

  const getBindingNameAndTypeFromBindings = node => {
    return node.declarations[0].init.properties.map(property => {
      let value = 'any';
      if (property.value.value === '&') {
        value = 'func';
      }
      return { name: property.key.name, value: value };
    });
  };

  const getBindingNameAndTypeFromPropTypes = node => {
    return node.declarations[0].init.properties.map(property => {
      return { name: property.key.name, value: property.value.property.name };
    });
  };

  const renderBodyBlockStatement = templateNode => {
    console.log('template node', templateNode);
    // ${templateNode.declarations[0].init.quasis[0].value.cooked}
    const sourceString = `
    const render = () => {
      return ${templateNode.declarations[0].init.quasis[0].value.cooked};
    }
      `;
    const ast = babel.parse(sourceString, {filename: 'file.js', configFile: false, plugins: ['@babel/plugin-syntax-jsx']});
    console.log('ast', ast);
    // return ast.program.body[0].body;
    return ast.program.body[0].declarations[0].init.body;
  };

  return {
    name: 'ast-transform', // not required
    visitor: {
      VariableDeclaration(path) {
        if (path.node.declarations[0].id.name === 'bindings') {
          const sibling = path.container.filter(sibling => sibling.type === 'ClassDeclaration')[0];
          const bindings = getBindingNameAndTypeFromBindings(path.node);

          // set propTypes as a variable
          const properties = bindings.map(binding => {
            return t.objectProperty(t.identifier(binding.name), t.memberExpression(t.identifier('PropTypes'), t.identifier(binding.value)));
          });
          const rightExpression = t.objectExpression(properties);
          const propTypesDeclaration = t.variableDeclaration('const', [t.variableDeclarator(t.identifier('propTypes'), rightExpression)]);
          path.replaceWith(propTypesDeclaration);

          // add props type annotation
          const typeAnnotation = t.genericTypeAnnotation(
            t.identifier('PropTypes.InferProps'),
            t.typeParameterInstantiation([t.typeofTypeAnnotation(t.genericTypeAnnotation(t.identifier('propTypes')))])
          );
          const typeAlias = t.typeAlias(t.identifier('Props'), null, typeAnnotation);
          path.insertAfter(typeAlias);

          // set proptypes for react2angular
          const propTypeExpression = t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(t.identifier(sibling.id.name), t.identifier('propTypes')),
              t.identifier('propTypes')
            )
          );
          path.container.splice(path.key + 3, 0, propTypeExpression);
        } else if (path.node.declarations[0].id.name === 'template') {
          templateNode = path.node;
          console.log('saving template node', templateNode);
          path.remove();
        }
      },
      ClassDeclaration(path) {
        // extend react.component
        path.node.superClass = t.memberExpression(t.identifier('React'), t.identifier('Component'));

        // get the bindings
        const propTypesNode = path.container.filter(sibling => {
          return sibling.type === 'VariableDeclaration' && sibling.declarations[0].id.name === 'propTypes';
        })[0];
        const bindings = getBindingNameAndTypeFromPropTypes(propTypesNode);

        // get the template node to insert into render()
        const renderBlock = renderBodyBlockStatement(templateNode);
        console.log('render body block statement', renderBlock);

        // move the template into a render method
        const renderFunc = t.classMethod('method', t.identifier('render'), [], t.blockStatement([]));
        renderFunc.body = renderBlock;
        path.get('body').pushContainer('body', renderFunc);

        path.traverse({
          // rename this. to this.props for all func props
          MemberExpression(path) {
            if (path.node.object.type === 'ThisExpression') {
              const propFuncNames = bindings.filter(b => b.value === 'func').map(b => b.name);

              if (propFuncNames.includes(path.node.property.name)) {
                path.node.property = t.identifier('props.' + path.node.property.name);
                console.log(path.node);
              }
            }
          },
          // rename onInit to componentDidMount
          ClassMethod(path) {
            if (path.node.key.name === '$onInit') {
              path.node.key.name = 'componentDidMount';
            }
          },
        });
      },
    },
  };
};
