'use strict';

const rule = require('../lib/rules/space-in-parens');
const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6
  }
});


const ruleTester = new RuleTester();
ruleTester.run('space-in-parens', rule, {

  valid: [

    // basic test
    {
      code: 'if ( true ) {}'
    },

    // single string
    {
      code: 'foo(\'bar\')'
    },

    // default parameter
    {
      code: 'const x = ( l = {} ) => {};'
    },

    // strings
    {
      code: 'if ( \'123\', \'456\' ) {}'
    },

    // function
    {
      code: '[].forEach( function() {} );'
    },

    // single function, multiline no closing space
    {
      code: `[].forEach( function() {\n});`
    },

    // callback function multiline no closing space
    {
      code: `[].forEach( {}, function() {\n});`
    },

    // multiple object/array literals
    {
      code: 'console.log( [ 1, 2, 3 ], { y: \'z\' } );'
    },

    // single array literal
    {
      code: 'console.log([ 1, 2, 3 ]);'
    },

    // single object literal
    {
      code: 'console.log({ y: \'z\' });'
    },

    // single multiline object literal
    {
      code: 'console.log({ a: \'b\',\nc: \'d\' });'
    },

    // multiline object literal as last param
    {
      code: 'console.log( 123, { a: \'b\',\nc: \'d\' });'
    },

    // multiline multiple args
    {
      code: 'console.log( 123,\n 456\n);'
    },

    // multiline multiple args, w/ exception
    {
      code: 'console.log( 123,\n []\n);'
    },

    // multiline multiple args, w/ ending single-line exception
    {
      code: 'console.log( function() {\n}, {} );'
    },

    // multiline multiple args, w/ starting single-line exception
    {
      code: 'console.log( {},\nfunction() {} );'
    },

    // unmatched starting exception char
    {
      code: 'console.log( [].forEach( x => x ) );'
    },

    // unmatched ending exception char
    {
      code: 'console.log( arr[ 0 ] );'
    },

    // opener exceptions on separate line
    {
      code: `
        Object.assign(
          { foo: 'bar' },
          someOtherObject
        );
      `
    },

    // closer exceptions on separate line
    {
      code: `
        Object.defineProperty(
          foo,
          'bar',
          {
            get() {
              return 'lol'
            }
          }
        );
      `
    }
  ],

  invalid: [

    // boolean end
    {
      code: 'if (true ) {}',
      output: 'if ( true ) {}',
      errors: [
        {
          message: 'There must be a space after this paren.',
          type: 'Program'
        }
      ]
    },

    // boolean start
    {
      code: 'if ( true) {}',
      output: 'if ( true ) {}',
      errors: [
        {
          message: 'There must be a space before this paren.',
          type: 'Program'
        }
      ]
    },

    // boolean start + end
    {
      code: 'if (true) {}',
      output: 'if ( true ) {}',
      errors: [
        {
          message: 'There must be a space after this paren.',
          type: 'Program'
        },
        {
          message: 'There must be a space before this paren.',
          type: 'Program'
        }
      ]
    },

    // function
    {
      code: '[].forEach(function() {} );',
      output: `[].forEach( function() {} );`,
      errors: [
        {
          message: 'There must be a space after this paren.',
          type: 'Program'
        }
      ]
    },

    // function multiline no closing space
    {
      code: `[].forEach( function() {\n} );`,
      output: `[].forEach( function() {\n});`,
      errors: [
        {
          message: 'There should be no space before this paren.',
          type: 'Program'
        }
      ]
    },

    // callback function multiline no closing space
    {
      code: `[].forEach( 123, function() {\n} );`,
      output: `[].forEach( 123, function() {\n});`,
      errors: [
        {
          message: 'There should be no space before this paren.',
          type: 'Program'
        }
      ]
    },

    // default parameter
    {
      code: 'const x = ( l = {}) => {};',
      errors: [
        {
          message: 'There must be a space before this paren.',
          type: 'Program'
        }
      ]
    },

    // strings
    {
      code: 'if (\'123\' ) {}',
      errors: [
        {
          message: 'There should be no space before this paren.',
          type: 'Program'
        }
      ]
    },

    // multiple object/array literals
    {
      code: 'console.log([ 1, 2, 3 ], { y: \'z\' } );',
      errors: [
        {
          message: 'There must be a space after this paren.',
          type: 'Program'
        }
      ]
    },

    // single object literals
    {
      code: 'console.log( { y: \'z\' });',
      errors: [
        {
          message: 'There should be no space after this paren.',
          type: 'Program'
        }
      ]
    },

    // single array literals
    {
      code: 'console.log([ 1, 2, 3 ] );',
      errors: [
        {
          message: 'There should be no space before this paren.',
          type: 'Program'
        }
      ]
    },

    // single string literal start
    {
      code: 'foo( \'bar\')',
      output: 'foo(\'bar\')',
      errors: [
        {
          message: 'There should be no space after this paren.',
          type: 'Program'
        }
      ]
    },

    // single string literal end
    {
      code: 'foo(\'bar\' )',
      output: 'foo(\'bar\')',
      errors: [
        {
          message: 'There should be no space before this paren.',
          type: 'Program'
        }
      ]
    },

    // multiple strings
    {
      code: 'foo(\'bar\', \'baz\')',
      output: 'foo( \'bar\', \'baz\' )',
      errors: [
        {
          message: 'There must be a space after this paren.',
          type: 'Program'
        },
        {
          message: 'There must be a space before this paren.',
          type: 'Program'
        }
      ]
    },

    // single multiline object literal
    {
      code: 'console.log({ a: \'b\',\nc: \'d\' } );',
      output: 'console.log({ a: \'b\',\nc: \'d\' });',
      errors: [
        {
          message: 'There should be no space before this paren.',
          type: 'Program'
        }
      ]
    },

    // multiline object literal as last param
    {
      code: 'console.log( 123, { a: \'b\',\nc: \'d\' } );',
      output: 'console.log( 123, { a: \'b\',\nc: \'d\' });',
      errors: [
        {
          message: 'There should be no space before this paren.',
          type: 'Program'
        }
      ]
    },

    // multiline multiple args
    {
      code: 'console.log( 123,\n456);',
      output: 'console.log( 123,\n456 );',
      errors: [
        {
          message: 'There must be a space before this paren.',
          type: 'Program'
        }
      ]
    },

    // multiline multiple args, w/ ending single-line exception
    {
      code: 'console.log( function() {\n\n}, {});',
      output: 'console.log( function() {\n\n}, {} );',
      errors: [
        {
          message: 'There must be a space before this paren.',
          type: 'Program'
        }
      ]
    },

    // unmatched starting exception char
    {
      code: 'console.log([].forEach( x => x ));',
      output: 'console.log( [].forEach( x => x ) );',
      errors: [
        {
          message: 'There must be a space after this paren.',
          type: 'Program'
        },
        {
          message: 'There must be a space before this paren.',
          type: 'Program'
        }
      ]
    },

    // unmatched ending exception char
    {
      code: 'console.log(arr[ 0 ]);',
      output: 'console.log( arr[ 0 ] );',
      errors: [
        {
          message: 'There must be a space after this paren.',
          type: 'Program'
        },
        {
          message: 'There must be a space before this paren.',
          type: 'Program'
        }
      ]
    }
  ]
});
