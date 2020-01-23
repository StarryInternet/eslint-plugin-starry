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
        },

        {
          code: "foo('bar')",
          options: ['always']
        },
        {
          code: "foo('bar')",
          options: ['always']
        },

        // default parameter
        {
            code: "const x = ( l = {} ) => {};",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }]
        },

        // strings
        {
            code: "if ('123') {}",
            options: ['always']
        },

        // function
        {
            code: "[].forEach( function() {} );",
            options: ['always']
        },

        // single function, multiline no closing space
        {
            code: `[].forEach( function() {\n});`,
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] } ],
        },

        // callback function multiline no closing space
        {
            code: `[].forEach( {}, function() {\n});`,
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] } ],
        },

        // multiple object/array literals
        {
            code: "console.log( [ 1, 2, 3 ], { y: 'z' } );",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }]
        },
        // single array literal
        {
            code: "console.log([ 1, 2, 3 ]);",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }]
        },
        // single object literal
        {
            code: "console.log({ y: 'z' });",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }]
        },
        // single multiline object literal
        {
            code: "console.log({ a: 'b',\nc: 'd' });",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }]
        },
        // multiline object literal as last param
        {
            code: "console.log( 123, { a: 'b',\nc: 'd' });",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }]
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

        // function
        {
            code: "[].forEach(function() {} );",
            options: ['always'],
            output: `[].forEach( function() {} );`,
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        },

        // function multiline no closing space
        {
            code: `[].forEach( function() {\n} );`,
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] } ],
            output: `[].forEach( function() {\n});`,
            errors: [{
                message: 'There should be no spaces inside this paren.',
                type: 'Program'
            }]
        },

        // callback function multiline no closing space
        {
            code: `[].forEach( 123, function() {\n} );`,
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] } ],
            output: `[].forEach( 123, function() {\n});`,
            errors: [{
                message: 'There should be no spaces inside this paren.',
                type: 'Program'
            }]
        },

        // default parameter
        {
            code: "const x = ( l = {}) => {};",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }],
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        },

        // strings
        {
            code: "if ('123' ) {}",
            options: ['always'],
            errors: [{
                message: 'There should be no spaces inside this paren.',
                type: 'Program'
            }]
        },

        // multiple object/array literals
        {
            code: "console.log([ 1, 2, 3 ], { y: 'z' } );",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }],
            errors: [{
                message: 'There must be a space inside this paren.',
                type: 'Program'
            }]
        },

        // single object literals
        {
            code: "console.log( { y: 'z' });",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }],
            errors: [{
                message: 'There should be no spaces inside this paren.',
                type: 'Program'
            }]
        },

        // single array literals
        {
            code: "console.log([ 1, 2, 3 ] );",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }],
            errors: [{
                message: 'There should be no spaces inside this paren.',
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
        },

        // single multiline object literal
        {
            code: "console.log({ a: 'b',\nc: 'd' } );",
            output: "console.log({ a: 'b',\nc: 'd' });",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }],
            errors: [{
                message: 'There should be no spaces inside this paren.',
                type: 'Program'
            }]
        },

        // multiline object literal as last param
        {
            code: "console.log( 123, { a: 'b',\nc: 'd' } );",
            output: "console.log( 123, { a: 'b',\nc: 'd' });",
            options: ['always', { 'exceptions': [ '{}', '[]', 'empty' ] }],
            errors: [{
                message: 'There should be no spaces inside this paren.',
                type: 'Program'
            }]
        }
    ]
});
