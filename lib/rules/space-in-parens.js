/* eslint max-len:0 */

/**
 * @fileoverview Disallows or enforces spaces inside of parentheses.
 * @author Jonathan Rajavuori
 * @copyright 2014 David Clark. All rights reserved.
 * @copyright 2014 Jonathan Rajavuori. All rights reserved.
 */
'use strict';

let astUtils = require('eslint/lib/rules/utils/ast-utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'enforce consistent spacing inside parentheses',
      category: 'Stylistic Issues',
      recommended: false,
      url: 'https://eslint.org/docs/rules/space-in-parens'
    },

    fixable: 'whitespace',

    schema: [
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
    ]
  },

  create( context ) {

    const MISSING_SPACE_MESSAGE  = 'There must be a space inside this paren.';
    const REJECTED_SPACE_MESSAGE = 'There should be no spaces inside this paren.';
    const ALWAYS                 = context.options[ 0 ] === 'always';
    const exceptionsArrayOptions = ( context.options[ 1 ] && context.options[ 1 ].exceptions ) || [];
    const options                = {};
    let exceptions;

    if ( exceptionsArrayOptions.length ) {
      options.braceException   = exceptionsArrayOptions.indexOf('{}') !== -1;
      options.bracketException = exceptionsArrayOptions.indexOf('[]') !== -1;
      options.parenException   = exceptionsArrayOptions.indexOf('()') !== -1;
      options.empty            = exceptionsArrayOptions.indexOf('empty') !== -1;
    }

    /**
     * Produces an object with the opener and closer exception values
     * @param {Object} opts The exception options
     * @returns {Object} `openers` and `closers` exception values
     * @private
     */
    function getExceptions() {
      const openers = [];
      const closers = [];

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
        openers,
        closers
      };
    }

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------
    const sourceCode = context.getSourceCode();

    /**
     * Determines if a token is one of the exceptions for the opener paren
     * @param {Object} token The token to check
     * @returns {boolean} True if the token is one of the exceptions for the opener paren
     */
    function isOpenerException( token ) {
      return token.type === 'Punctuator' && exceptions.openers.indexOf( token.value ) >= 0;
    }

    /**
     * Determines if a token is one of the exceptions for the closer paren
     * @param {Object} token The token to check
     * @returns {boolean} True if the token is one of the exceptions for the closer paren
     */
    function isCloserException( token ) {
      return token.type === 'Punctuator' && exceptions.closers.indexOf( token.value ) >= 0;
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
        if ( astUtils.isClosingParenToken( right ) ) {
          return false;
        }
        return !isOpenerException( right );
      }
      return isOpenerException( right );
    }

    /**
     * Determines if an closer paren should have a missing space after it
     * @param {Object} left The token before the paren
     * @param {Object} right The paren token
     * @returns {boolean} True if the paren should have a space
     */
    function shouldCloserHaveSpace( left, right ) {
      if ( astUtils.isOpeningParenToken( left ) ) {
        return false;
      }

      if ( sourceCode.isSpaceBetweenTokens( left, right ) ) {
        return false;
      }

      if ( ALWAYS ) {
        return !isCloserException( left );
      }
      return isCloserException( left );
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

      if ( ALWAYS ) {
        return isOpenerException( right );
      }
      return !isOpenerException( right );
    }

    /**
     * Determines if an closer paren should not have an existing space after it
     * @param {Object} left The token before the paren
     * @param {Object} right The paren token
     * @returns {boolean} True if the paren should reject the space
     */
    function shouldCloserRejectSpace( left, right ) {
      if ( astUtils.isOpeningParenToken( left ) ) {
        return false;
      }

      if ( !astUtils.isTokenOnSameLine( left, right ) ) {
        return false;
      }

      if ( !sourceCode.isSpaceBetweenTokens( left, right ) ) {
        return false;
      }

      if ( ALWAYS ) {
        return isCloserException( left );
      }
      return !isCloserException( left );
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
      Program: function checkParenSpaces( node ) {
        exceptions = getExceptions();
        const tokens = sourceCode.tokensAndComments;

        const enclosers = {
          openers: [ '(', ...exceptions.openers.filter( opener => opener !== ')' ) ],
          closers: [ ')', ...exceptions.closers.filter( closer => closer !== '(' ) ]
        };

        const encloserExceptions = [ '=', ',' ];

        tokens.forEach( ( token, i ) => {
          const prevToken = tokens[ i - 1 ];
          const nextToken = tokens[ i + 1 ];

          if ( !astUtils.isOpeningParenToken( token ) && !astUtils.isClosingParenToken( token ) ) {
            return;
          }

          // idiomatic exceptions...

          // Don't require space before single string literal
          if ( token.value === '(' && ( nextToken.type === 'String' || nextToken.type === 'Template' ) ) {
            let closer = tokens[ i + 2 ];
            if ( closer.value === ')' ) {
              if ( sourceCode.isSpaceBetweenTokens( token, nextToken ) ) {
                context.report({
                  node,
                  loc: token.loc.end,
                  message: REJECTED_SPACE_MESSAGE,
                  fix( fixer ) {
                    return fixer.removeRange([ token.range[ 1 ], nextToken.range[ 0 ] ]);
                  }
                });
              }
              return;
            }
          }

          // Don't require space after single string literal
          if ( token.value === ')' && ( prevToken.type === 'String' || prevToken.type === 'Template' ) ) {
            let opener = tokens[ i - 2 ];
            if ( opener.value === '(' ) {
              if ( sourceCode.isSpaceBetweenTokens( prevToken, token ) ) {
                context.report({
                  node,
                  loc: token.loc.start,
                  message: REJECTED_SPACE_MESSAGE,
                  fix( fixer ) {
                    return fixer.removeRange([ prevToken.range[ 1 ], token.range[ 0 ] ]);
                  }
                });
              }
              return;
            }
          }

          // Require space before function
          if ( token.value === '(' && nextToken.value === 'function' ) {
            if ( !sourceCode.isSpaceBetweenTokens( token, nextToken ) ) {
              context.report({
                node,
                loc: token.loc.end,
                message: MISSING_SPACE_MESSAGE,
                fix( fixer ) {
                  return fixer.insertTextAfter( token, ' ' );
                }
              });
            }
            return;
          }

          // Require a space for multiple object/array literals and default parameters
          const isOpenParenAndNotEmpty = (
            token.value === '(' &&
            !astUtils.isClosingParenToken( nextToken )
          );

          if ( isOpenParenAndNotEmpty ) {
            let nestedLevels = 0;
            for ( let j = i; j < tokens.length; j++ ) {
              let tokenToCheck = tokens[ j ];

              if ( tokenToCheck.type === 'Punctuator' ) {
                if ( enclosers.openers.includes( tokenToCheck.value ) ) {
                  nestedLevels += 1;
                } else if ( enclosers.closers.includes( tokenToCheck.value ) ) {
                  nestedLevels -= 1;
                  if ( nestedLevels === 0 ) {
                    break;
                  }
                } else if ( nestedLevels === 1 && encloserExceptions.includes( tokenToCheck.value ) ) {
                  if ( !sourceCode.isSpaceBetweenTokens( token, nextToken ) ) {
                    context.report({
                      node,
                      loc: token.loc.end,
                      message: MISSING_SPACE_MESSAGE,
                      fix( fixer ) {
                        return fixer.insertTextAfter( token, ' ' );
                      }
                    });
                  }
                  return;
                }
              }
            }
          }

          // Require a space for multiple object/array literals and default parameters
          const isCloseParenAndNotEmpty = (
            token.value === ')' &&
            !astUtils.isOpeningParenToken( prevToken )
          );

          if ( isCloseParenAndNotEmpty ) {
            let nestedLevels = 0;
            for ( let j = i; j > 0; j-- ) {
              let tokenToCheck = tokens[ j ];

              if ( tokenToCheck.type === 'Punctuator' ) {
                if ( enclosers.closers.includes( tokenToCheck.value ) ) {
                  nestedLevels += 1;
                } else if ( enclosers.openers.includes( tokenToCheck.value ) ) {
                  nestedLevels -= 1;
                  if ( nestedLevels === 0 ) {
                    break;
                  }
                } else if ( nestedLevels ===  1 && encloserExceptions.includes( tokenToCheck.value ) ) {
                  if ( !sourceCode.isSpaceBetweenTokens( prevToken, token ) ) {
                    context.report({
                      node,
                      loc: token.loc.start,
                      message: MISSING_SPACE_MESSAGE,
                      fix( fixer ) {
                        return fixer.insertTextBefore( token, ' ' );
                      }
                    });
                  }
                  return;
                }
              }
            }
          }

          // end idiomatic exceptions

          if ( token.value === '(' && shouldOpenerHaveSpace( token, nextToken ) ) {
            context.report({
              node,
              loc: token.loc.end,
              message: MISSING_SPACE_MESSAGE,
              fix( fixer ) {
                return fixer.insertTextAfter( token, ' ' );
              }
            });
          } else if ( token.value === '(' && shouldOpenerRejectSpace( token, nextToken ) ) {
            context.report({
              node,
              loc: token.loc.end,
              message: REJECTED_SPACE_MESSAGE,
              fix( fixer ) {
                return fixer.removeRange([ token.range[ 1 ], nextToken.range[ 0 ] ]);
              }
            });
          } else if ( token.value === ')' && shouldCloserHaveSpace( prevToken, token ) ) {
            context.report({
              node,
              loc: token.loc.start,
              message: MISSING_SPACE_MESSAGE,
              fix( fixer ) {
                return fixer.insertTextBefore( token, ' ' );
              }
            });
          } else if ( token.value === ')' && shouldCloserRejectSpace( prevToken, token ) ) {
            context.report({
              node,
              loc: token.loc.start,
              message: REJECTED_SPACE_MESSAGE,
              fix( fixer ) {
                return fixer.removeRange([ prevToken.range[ 1 ], token.range[ 0 ] ]);
              }
            });
          }
        });
      }
    };
  }
};
