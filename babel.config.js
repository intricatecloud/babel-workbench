module.exports = api => {
  if (api) {
    api.cache(true);
  }

  const presets = [
    '@babel/preset-typescript',
  ];

  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-syntax-dynamic-import',
    [
      '@babel/plugin-proposal-object-rest-spread',
      {
        useBuiltIns: true,
      },
    ],
    './transform-angularjs-react',
  ];

  return {
    presets,
    plugins,
    env: {
      debug: {
        sourceMaps: 'inline',
        retainLines: true,
      },
    },
  };
};
