const rule       = require('../lib/rules/aligned-requires');
const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  languageOptions: {
    ecmaVersion: 6
  }
});


const ruleTester = new RuleTester();
ruleTester.run( 'aligned-requires', rule, {

  valid: [
    // basic test
    {
      code: 'var t        = require(\'fs\');\n' +
                'var longname = require(\'fs\');',
      options: []
    },

    // only require certain properties
    {
      code: 'const foo = require(\'foo\');\n' +
                'const baz = require(\'bar\').baz;',
      options: []
    },
    {
      code: 'const foo     = require(\'foo\');\n' +
                'const { baz } = require(\'bar\');',
      options: []
    },

    // no specified behavior for multiple declerations
    {
      code: 'var t = require(\'fs\'), a = require(\'fs\');',
      options: []
    }
  ],

  invalid: [
    {
      code: '\n' +
                  'var t = require(\'fs\');\n' +
                  'var longname = require(\'fs\');\n' +
                  'var med   =  require(\'fs\')\n' +
                  'const { foo: bar }  =  require(\'fs\')',
      output: '\n' +
                    'var t              = require(\'fs\');\n' +
                    'var longname       = require(\'fs\');\n' +
                    'var med            = require(\'fs\')\n' +
                    'const { foo: bar } = require(\'fs\')',
      options: [],
      errors: [ {
        message: 'This group of assignments is not aligned.'
      } ]
    }
  ]
});
