import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'src/**/*', 'components/**/*', 'lib/**/*'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
