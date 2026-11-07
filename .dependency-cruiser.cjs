/** Import rules. Run: npm run deps:graph */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'client-not-to-server',
      comment: 'The browser bundle must never import backend code. Share via @app/shared.',
      severity: 'error',
      from: { path: '^client/' },
      to: { path: '^(server|config)/' },
    },
    {
      name: 'server-not-to-client',
      severity: 'error',
      from: { path: '^server/' },
      to: { path: '^client/' },
    },
    {
      name: 'shared-stays-pure',
      comment: 'shared/ is imported by both sides, so it depends on nothing local.',
      severity: 'error',
      from: { path: '^shared/' },
      to: { path: '^(client|server|config)/' },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: { orphan: true, pathNot: ['\\.d\\.ts$', '(^|/)vite(st)?\\.config\\.ts$'] },
      to: {},
    },
    {
      name: 'not-to-dev-dep',
      comment: 'Runtime code must not import devDependencies.',
      severity: 'error',
      from: { path: '^(client|server|shared|config)/src', pathNot: '\\.test\\.tsx?$' },
      to: {
        dependencyTypes: ['npm-dev'],
        dependencyTypesNot: ['type-only'],
        pathNot: '^node_modules/@types/',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)dist/' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['source', 'import', 'types', 'default'],
      extensions: ['.ts', '.tsx', '.js'],
    },
    combinedDependencies: true,
  },
};
