import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },
  ignores: ['docs/**'],
}, {
  rules: {
    'no-console': 'warn',
    'antfu/no-top-level-await': 'off', // Non serve perché questa è una ESM-only app targeting Node.js >=24
    'prefer-global/process': ['error', 'always'], // Non serve con ESM-only e Typescript. Fastify internamente anche lo usa così
  },
});
