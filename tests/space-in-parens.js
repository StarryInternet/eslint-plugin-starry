"use strict";

var rule = require('../lib/rules/space-in-parens'),
    RuleTester = require("eslint").RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6
  }
});


var ruleTester = new RuleTester();
ruleTester.run('space-in-parens', rule, {

    valid: [
        // basic test
        {
          code: "if ( true ) {}",
          options: ['always']
        },

        // invalid w/option off
        {
            code: "if (true) {}",
            options: ['never']
        }
    ],

    invalid: [
        {
            code: "if (true ) {}",
            options: ['always'],
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        },
        {
            code: "if ( true) {}",
            options: ['always'],
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        },
        {
            code: "if (true) {}",
            options: ['always'],
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }, {
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        }
    ]
});
