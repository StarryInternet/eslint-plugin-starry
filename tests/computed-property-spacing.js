'use strict';

const rule       = require('../lib/rules/computed-property-spacing');
const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6
  }
});


const ruleTester = new RuleTester();
ruleTester.run( 'computed-property-spacing', rule, {

  valid: [
    // basic test
    {
      code: 'const t = x[ 1 ]',
      options: [ 'always' ]
    }
  ],

  invalid: [
    {
      code: 'const t = x[ 1]',
      options: [ 'always' ],
      errors: [ {
        message: 'A space is required before \']\'',
        type: 'MemberExpression'
      } ]
    },
    {
      code: 'const t = x[1 ]',
      options: [ 'always' ],
      errors: [ {
        message: 'A space is required after \'[\'',
        type: 'MemberExpression'
      } ]
    },
    {
      code: 'const t = x[1]',
      options: [ 'always' ],
      errors: [ {
        message: 'A space is required after \'[\'',
        type: 'MemberExpression'
      }, {
        message: 'A space is required before \']\'',
        type: 'MemberExpression'
      } ]
    }
  ]
});
