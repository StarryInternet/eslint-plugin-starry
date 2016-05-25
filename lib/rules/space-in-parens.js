/* eslint max-len:0 */

/**
 * @fileoverview Disallows or enforces spaces inside of parentheses.
 * @author Jonathan Rajavuori
 * @copyright 2014 David Clark. All rights reserved.
 * @copyright 2014 Jonathan Rajavuori. All rights reserved.
 */

'use strict';

let astUtils = require('eslint/lib/ast-utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function( context ) {

  let MISSING_SPACE_MESSAGE = 'There must be a space inside this paren.';
  let REJECTED_SPACE_MESSAGE = 'There should be no spaces inside this paren.';
  let ALWAYS = context.options[ 0 ] === 'always';

  let exceptionsArrayOptions = ( context.options.length === 2 ) ? context.options[ 1 ].exceptions : [];
  let options = {};
  let exceptions;

  if ( exceptionsArrayOptions.length ) {
    options.braceException = exceptionsArrayOptions.indexOf('{}') !== -1;
    options.bracketException = exceptionsArrayOptions.indexOf('[]') !== -1;
    options.parenException = exceptionsArrayOptions.indexOf('()') !== -1;
    options.empty = exceptionsArrayOptions.indexOf('empty') !== -1;
  }

  /**
   * Produces an object with the opener and closer exception values
   * @param {Object} opts The exception options
   * @returns {Object} `openers` and `closers` exception values
   * @private
   */

  function getExceptions() {
    let openers = [];
    let closers = [];

    if ( options.braceException ) {
      openers.push('{');
      closers.push('}');
    }

    if ( options.bracketException ) {
      openers.push('[');
      closers.push(']');
    }

    if ( options.parenException ) {
      openers.push('(');
      closers.push(')');
    }

    if ( options.empty ) {
      openers.push(')');
      closers.push('(');
    }

    return {
      openers: openers,
      closers: closers
    };
  }

  //--------------------------------------------------------------------------
  // Helpers
  //--------------------------------------------------------------------------
  let sourceCode = context.getSourceCode();

  /**
   * Determines if a token is one of the exceptions for the opener paren
   * @param {Object} token The token to check
   * @returns {boolean} True if the token is one of the exceptions for the opener paren
   */

  function isOpenerException( token ) {
    return ( token.type === 'Punctuator' ) && exceptions.openers.indexOf( token.value ) >= 0;
  }

  /**
   * Determines if a token is one of the exceptions for the closer paren
   * @param {Object} token The token to check
   * @returns {boolean} True if the token is one of the exceptions for the closer paren
   */

  function isCloserException( token ) {
    return ( token.type === 'Punctuator' || token.type === 'String' ) && exceptions.closers.indexOf( token.value ) >= 0;
  }

  /**
   * Determines if an opener paren should have a missing space after it
   * @param {Object} left The paren token
   * @param {Object} right The token after it
   * @returns {boolean} True if the paren should have a space
   */

  function shouldOpenerHaveSpace( left, right ) {
    if ( sourceCode.isSpaceBetweenTokens( left, right ) ) {
      return false;
    }

    if ( ALWAYS ) {
      if ( right.type === 'Punctuator' && right.value === ')' ) {
        return false;
      }
      return !isOpenerException( right );
    } else {
      return isOpenerException( right );
    }
  }

  /**
   * Determines if an closer paren should have a missing space after it
   * @param {Object} left The token before the paren
   * @param {Object} right The paren token
   * @returns {boolean} True if the paren should have a space
   */

  function shouldCloserHaveSpace( left, right ) {
    if ( left.type === 'Punctuator' && left.value === '(' ) {
      return false;
    }

    if ( sourceCode.isSpaceBetweenTokens( left, right ) ) {
      return false;
    }

    if ( ALWAYS ) {
      return !isCloserException( left );
    } else {
      return isCloserException( left );
    }
  }

  /**
   * Determines if an opener paren should not have an existing space after it
   * @param {Object} left The paren token
   * @param {Object} right The token after it
   * @returns {boolean} True if the paren should reject the space
   */

  function shouldOpenerRejectSpace( left, right ) {
    if ( right.type === 'Line' ) {
      return false;
    }

    if ( !astUtils.isTokenOnSameLine( left, right ) ) {
      return false;
    }

    if ( !sourceCode.isSpaceBetweenTokens( left, right ) ) {
      return false;
    }

    return !ALWAYS;
  }

  /**
   * Determines if an closer paren should not have an existing space after it
   * @param {Object} left The token before the paren
   * @param {Object} right The paren token
   * @returns {boolean} True if the paren should reject the space
   */

  function shouldCloserRejectSpace( left, right ) {
    if ( left.type === 'Punctuator' && left.value === '(' ) {
      return false;
    }

    if ( !astUtils.isTokenOnSameLine( left, right ) ) {
      return false;
    }

    if ( !sourceCode.isSpaceBetweenTokens( left, right ) ) {
      return false;
    }

    return !ALWAYS;
  }

  //--------------------------------------------------------------------------
  // Public
  //--------------------------------------------------------------------------

  return {
    Program: function checkParenSpaces( node ) {
      let tokens;
      let prevToken;
      let nextToken;

      exceptions = getExceptions();

      tokens = sourceCode.tokensAndComments;

      tokens.forEach(function( token, i ) {
        prevToken = tokens[ i - 1 ];
        nextToken = tokens[ i + 1 ];

        if ( token.type !== 'Punctuator' ) {
          return;
        }

        if ( token.value !== '(' && token.value !== ')' ) {
          return;
        }

        // idiomatic exceptions...

        // don't require space before single string literal
        if ( token.value === '(' && nextToken.type === 'String' ) {
          let closer = tokens[ i + 2 ];
          if ( closer.value === ')' ) {
            if ( sourceCode.isSpaceBetweenTokens( token, nextToken ) ) {
              context.report( node, token.loc.end, REJECTED_SPACE_MESSAGE );
            }
            return;
          }
        }

        // don't require space after single string literal
        if ( token.value === ')' && prevToken.type === 'String' ) {
          let opener = tokens[ i - 2 ];
          if ( opener.value === '(' ) {
            if ( sourceCode.isSpaceBetweenTokens( prevToken, token ) ) {
              context.report( node, token.loc.end, REJECTED_SPACE_MESSAGE );
            }
            return;
          }
        }

        // don't require space before function
        if ( token.value === '(' && nextToken.value === 'function' ) {
          return;
        }

        // end idiomatic exceptions

        if ( token.value === '(' && shouldOpenerHaveSpace( token, nextToken ) ) {
          context.report( node, token.loc.end, MISSING_SPACE_MESSAGE );
        } else if ( token.value === '(' && shouldOpenerRejectSpace( token, nextToken ) ) {
          context.report( node, token.loc.end, REJECTED_SPACE_MESSAGE );
        } else if ( token.value === ')' && shouldCloserHaveSpace( prevToken, token ) ) {
          context.report( node, token.loc.end, MISSING_SPACE_MESSAGE );
        } else if ( token.value === ')' && shouldCloserRejectSpace( prevToken, token ) ) {
          context.report( node, token.loc.end, REJECTED_SPACE_MESSAGE );
        }
      });
    }
  };

};

module.exports.schema = [
  {
    enum: [ 'always', 'never' ]
  },
  {
    type: 'object',
    properties: {
      exceptions: {
        type: 'array',
        items: {
          enum: [ '{}', '[]', '()', 'empty' ]
        },
        uniqueItems: true
      }
    },
    additionalProperties: false
  }
];
