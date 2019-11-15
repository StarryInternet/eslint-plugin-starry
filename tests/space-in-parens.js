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
        {
          code: "foo('bar')",
          options: ['always']
        },
        {
          code: "foo('bar')",
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
            output: "if ( true ) {}",
            options: ['always'],
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        },
        {
            code: "if ( true) {}",
            output: "if ( true ) {}",
            options: ['always'],
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        },
        {
            code: "if (true) {}",
            output: "if ( true ) {}",
            options: ['always'],
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }, {
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        },
        {
            code: "if ( true ) {}",
            output: "if (true) {}",
            options: ['never'],
            errors: [{
                message: 'There should be no spaces inside this paren.',
                type: 'Program'
            }, {
                message: 'There should be no spaces inside this paren.',
                type: 'Program'
            }]
        },
        {
          code: "foo( 'bar')",
          output: "foo('bar')",
          options: ['always'],
          errors: [{
            message: 'There should be no spaces inside this paren.',
            type: 'Program'
          }]
        },
        {
          code: "foo('bar' )",
          output: "foo('bar')",
          options: ['always'],
          errors: [{
            message: 'There should be no spaces inside this paren.',
            type: 'Program'
          }]
        },
        {
          code: "foo('bar', 'baz')",
          output: "foo( 'bar', 'baz' )",
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
