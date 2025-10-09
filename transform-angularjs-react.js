const sourceString = (content) => {
  return `const render = () => {
  return <>
    ${content}
    </>
}`;
}

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

<<<<<<< Updated upstream
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
=======
  const getBindingNameAndTypeFromClass = node => {
    console.log(node)
    const constructorNode = node.body.body.filter(classMethod => classMethod.kind === 'constructor')[0]
    return constructorNode.params.map(param => {
      return {name: param.name, value: 'any'}
    })
  }
>>>>>>> Stashed changes

  return {
    name: 'ast-transform', // not required
    visitor: {
      VariableDeclaration(path) {
        if (path.node.declarations[0].id.name === 'bindings') {
          const sibling = path.container.filter(sibling => sibling.type === 'ClassDeclaration')[0];
          const bindings = getBindingNameAndTypeFromBindings(path.node);
          const classBindings = getBindingNameAndTypeFromClass(sibling)

          // set propTypes as a variable
          const properties = bindings.concat(classBindings).map(binding => {
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
<<<<<<< Updated upstream

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
=======
>>>>>>> Stashed changes
        }
      },
      ClassDeclaration(path) {
        // extend react.component
        path.node.superClass = t.memberExpression(t.identifier('React'), t.identifier('Component'));
        path.node.superTypeParameters = t.typeParameterInstantiation([
          t.genericTypeAnnotation(t.identifier('Props')),
          t.objectTypeAnnotation([])
        ])

        // set proptypes for react2angular
        const propTypeExpression = t.classProperty(
          t.identifier('propTypes'), t.identifier('propTypes'), null, null, null, true
        );
        path.get('body').unshiftContainer('body', propTypeExpression);

        // get the bindings
        const propTypesNode = path.container.filter(sibling => {
          return sibling.type === 'VariableDeclaration' && sibling.declarations[0].id.name === 'propTypes';
        })[0];
        const bindings = getBindingNameAndTypeFromPropTypes(propTypesNode);

<<<<<<< Updated upstream
        // get the template node to insert into render()
        const renderBlock = renderBodyBlockStatement(templateNode);
        console.log('render body block statement', renderBlock);

        // move the template into a render method
        const renderFunc = t.classMethod('method', t.identifier('render'), [], t.blockStatement([]));
        renderFunc.body = renderBlock;
        path.get('body').pushContainer('body', renderFunc);
=======
        // get the template
        const templateNode = path.container.filter(sibling => {
          return sibling.type === 'VariableDeclaration' && sibling.declarations[0].id.name === 'template';
        })[0];
        if (templateNode) {
          const renderBodyBlockStatement = templateNode => {
            console.log('template node', templateNode);


            const cookedSourceString = sourceString(templateNode.declarations[0].init.quasis[0].value.cooked)
            const ast = babel.parse(cookedSourceString, {filename: 'file.js', configFile: false, plugins: ['@babel/plugin-syntax-jsx']});
            console.log('ast', ast);
            // return ast.program.body[0].body;
            return ast.program.body[0].declarations[0].init.body;
          };
          const renderBlock = renderBodyBlockStatement(templateNode);
          console.log('render body block statement', renderBlock);

          // move the template into a render method
          const renderFunc = t.classMethod('method', t.identifier('render'), [], t.blockStatement([]));
          console.log('render func');
          console.log(renderFunc);
          renderFunc.body = renderBlock;
          console.log(renderFunc);
          path.get('body').pushContainer('body', renderFunc);
        }

>>>>>>> Stashed changes

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
      ExportDefaultDeclaration(path) {
        // export the class instead
        const sibling = path.container.filter(sibling => sibling.type === 'ClassDeclaration')[0];
        path.node.declaration = t.identifier(sibling.id.name)
      }
    },
  };
};
