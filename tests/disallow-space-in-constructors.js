const rule       = require('../lib/rules/disallow-space-in-constructors');
const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6
  }
});


const ruleTester = new RuleTester();
ruleTester.run( 'disallow-space-in-constructors', rule, {

  valid: [
    {
      code: 'const p = new Person'
    },
    {
      code: 'const p = new Person()'
    },
    {
      code: 'const p = (new Person)'
    },
    {
      code: 'const p = (new Person)()'
    },
    {
      code: 'const p = new Person(\'Name\')'
    },
    {
      code: 'const p = new Person(\'Name\', \'Age\')'
    }
  ],

  invalid: [
    {
      code: 'const p = new Person( )',
      output: 'const p = new Person()',
      errors: [
        {
          message: 'Unnecessary space in parens ' +
            'when invoking a constructor with no arguments.',
          type: 'NewExpression'
        }
      ]
    },
    {
      code: 'const p = new Person(        )',
      output: 'const p = new Person()',
      errors: [
        {
          message: 'Unnecessary space in parens ' +
              'when invoking a constructor with no arguments.',
          type: 'NewExpression'
        }
      ]
    },
    {
      code: 'const p = new (Person)( )',
      output: 'const p = new (Person)()',
      errors: [
        {
          message: 'Unnecessary space in parens ' +
                'when invoking a constructor with no arguments.',
          type: 'NewExpression'
        }
      ]
    },
    {
      code: 'const p = new (Person)(        )',
      output: 'const p = new (Person)()',
      errors: [
        {
          message: 'Unnecessary space in parens ' +
                  'when invoking a constructor with no arguments.',
          type: 'NewExpression'
        }
      ]
    }
  ]
});
