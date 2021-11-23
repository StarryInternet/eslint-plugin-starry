const rule       = require('../lib/rules/no-invisible-characters');
const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6
  }
});

const ruleTester = new RuleTester();
ruleTester.run( 'no-invisible-characters', rule, {

  valid: [
    {
      code: 'const t = x[ 0 ]',
      options: [ 'always' ]
    }
  ],

  invalid: [
    {
      // HANGUL FILLER
      code: 'const ㅤ = x[ 0 ]',
      output: 'const \\u3164 = x[ 0 ]',
      options: [ 'always' ],
      errors: [
        {
          message: 'Unexpected invisible character. Use \\u3164 instead.'
        }
      ]
    },
    {
      // HANGUL CHOSEONG FILLER
      code: 'const ᅟ = x[ 1 ]',
      output: 'const \\u115F = x[ 1 ]',
      options: [ 'always' ],
      errors: [
        {
          message: 'Unexpected invisible character. Use \\u115F instead.'
        }
      ]
    },
    {
      // HANGUL JUNGSEONG FILLER
      code: 'const ᅠ = x[ 2 ]',
      output: 'const \\u1160 = x[ 2 ]',
      options: [ 'always' ],
      errors: [
        {
          message: 'Unexpected invisible character. Use \\u1160 instead.'
        }
      ]
    }
  ]

});
