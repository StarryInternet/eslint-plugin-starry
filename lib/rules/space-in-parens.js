/* eslint max-len:0 */

/**
 * @fileoverview Disallows or enforces spaces inside of parentheses.
 * @author Jonathan Rajavuori
 * @copyright 2014 David Clark. All rights reserved.
 * @copyright 2014 Jonathan Rajavuori. All rights reserved.
 * @copyright 2020 Kevin Ennis. All rights reserved.
 */

'use strict';

const astUtils = require('eslint/lib/rules/utils/ast-utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {

  meta: {
    type: 'layout',
    docs: {
      description: 'enforce consistent spacing inside parentheses',
      category: 'Stylistic Issues',
      recommended: false,
      url: 'https://eslint.org/docs/rules/space-in-parens'
    },
    fixable: 'whitespace',
    messages: {
      missingOpeningSpace: 'There must be a space after this paren.',
      missingClosingSpace: 'There must be a space before this paren.',
      rejectedOpeningSpace: 'There should be no space after this paren.',
      rejectedClosingSpace: 'There should be no space before this paren.'
    }
  },

  create( context ) {
    const exceptions = {
      openers: [ '[', '{' ],
      closers: [ ']', '}' ]
    };

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    const sourceCode = context.getSourceCode();

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

      if ( astUtils.isClosingParenToken( right ) ) {
        return false;
      }

      return true;
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

      return true;
    }

    /**
     * Get the matching opening/closing character (if any) for the
     * opener/closer at the given index
     * @method getMatch
     * @param  {Array<Object>} tokens An array of all tokens
     * @param  {Number}        index  Index of opening or closing token
     * @return {Object|Null}
     */

    function getMatch( tokens, index ) {
      const openers = [ '(', '[', '{' ];
      const closers = [ ')', ']', '}' ];
      const inc     = openers.includes( tokens[ index ].value ) ? 1 : -1;

      const typeIdx = ( inc === 1 ? openers : closers ).indexOf(
        tokens[ index ].value
      );

      // starting index
      const start = inc === 1 ? index + 1 : index - 1;

      // current paren depth
      let depth = 1;

      // find matching token
      for ( let i = start; inc === 1 ? i < tokens.length : i >= 0; i += inc ) {
        const candidate = tokens[ i ];

        depth += (
          candidate.value === openers[ typeIdx ] ? inc :
          candidate.value === closers[ typeIdx ] ? -inc : 0
        );

        if ( depth === 0 ) {
          return candidate;
        }
      }

      return null;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
      Program: function checkParenSpaces( node ) {

        const tokens = sourceCode.tokensAndComments;

        tokens.forEach( ( token, i ) => {

          /**
           * Utility definitions
           */

          const prevToken = tokens[ i - 1 ];
          const nextToken = tokens[ i + 1 ];

          // is the current token an opening or closing paren?
          const isOpen  = astUtils.isOpeningParenToken( token );
          const isClose = astUtils.isClosingParenToken( token );

          // i.e. `()`
          const isEmpty = (
            ( isOpen && nextToken && nextToken.value === ')' ) ||
            ( isClose && prevToken && prevToken.value === '(' )
          );

          // fail fast
          if ( !isOpen && !isClose || isEmpty ) {
            return;
          }

          // get references to the matching set orf parens (if possible)
          const openParen  = isOpen ? token : getMatch( tokens, i );
          const closeParen = isClose ? token : getMatch( tokens, i );

          // token after the opening paren
          // e.g. `{` in `({})`
          const afterOpen = (
            openParen &&
            tokens[ tokens.indexOf( openParen ) + 1 ]
          );

          // token before the closing paren
          // e.g. `}` in `({})`
          const beforeClose = (
            closeParen &&
            tokens[ tokens.indexOf( closeParen ) - 1 ]
          );

          // is the token after opening paren an exception token?
          // e.g. `{` or `[`
          const afterOpenException = !!(
            afterOpen &&
            exceptions.openers.includes( afterOpen.value )
          );

          // is the token after opening paren an exception token?
          // e.g. `}` or `]`
          const beforeCloseException = !!(
            beforeClose &&
            exceptions.closers.includes( beforeClose.value )
          );

          // is there a single expression between open/close parens?
          // e.g. a single string or object/array literal
          const singleContents = (
            // primitive value (single token)
            ( afterOpen === beforeClose ) ||
            // object or array literal
            (
              afterOpenException &&
              beforeCloseException &&
              getMatch( tokens, tokens.indexOf( afterOpen ) ) === beforeClose
            )
          );

          // is the next token a string or template literal?
          const stringNext = (
            nextToken && (
              nextToken.type === 'String' ||
              nextToken.type === 'Template'
            )
          );

          // is the previous token a string or template literal?
          const stringPrev = (
            prevToken && (
              prevToken.type === 'String' ||
              prevToken.type === 'Template'
            )
          );

          /**
           * Rules
           */

          // reject space for single string inside parens
          if (
            singleContents &&
            (
              ( isOpen && stringNext ) ||
              ( isClose && stringPrev )
            )
          ) {
            const target = isOpen ? nextToken : prevToken;
            const first  = isOpen ? token : prevToken;
            const last   = isOpen ? nextToken : token;
            const type   = isOpen ? 'Opening' : 'Closing';

            if ( sourceCode.isSpaceBetweenTokens( token, target ) ) {
              context.report({
                node,
                loc: token.loc.end,
                messageId: `rejected${ type }Space`,
                fix( fixer ) {
                  return fixer.removeRange([
                    first.range[ 1 ],
                    last.range[ 0 ]
                  ]);
                }
              });
            }
            return;
          }

          // single object literal or array literal
          if (
            singleContents &&
            afterOpenException &&
            beforeCloseException
          ) {
            const openSpace = sourceCode.isSpaceBetweenTokens(
              openParen,
              afterOpen
            );

            const closeSpace = sourceCode.isSpaceBetweenTokens(
              beforeClose,
              closeParen
            );

            const type = isOpen ? 'Opening' : 'Closing';

            if ( ( isOpen && openSpace ) || ( isClose && closeSpace ) ) {
              context.report({
                node,
                loc: token.loc.end,
                messageId: `rejected${ type }Space`,
                fix( fixer ) {
                  return fixer.removeRange([
                    ( isOpen ? openParen : beforeClose ).range[ 1 ],
                    ( isOpen ? afterOpen : closeParen ).range[ 0 ]
                  ]);
                }
              });
            }
            return;
          }

          // reject space between open paren and { or [ when the matching
          // } or ] is on a different line
          if ( isOpen && afterOpenException ) {
            const closer = getMatch( tokens, tokens.indexOf( afterOpen ) );

            const split = (
              closer &&
              afterOpen.loc.end.line !== closer.loc.start.line
            );

            if ( split ) {
              const hasSpace = sourceCode.isSpaceBetweenTokens(
                openParen,
                afterOpen
              );

              if ( hasSpace ) {
                context.report({
                  node,
                  loc: token.loc.end,
                  messageId: 'rejectedOpeningSpace',
                  fix( fixer ) {
                    return fixer.removeRange([
                      openParen.range[ 1 ],
                      afterOpen.range[ 0 ]
                    ]);
                  }
                });
              }
              return;
            }
          }

          // reject space between close paren and } or ] when the matching
          // { or [ is on a different line
          if ( isClose && beforeCloseException ) {
            const opener = getMatch( tokens, tokens.indexOf( beforeClose ) );

            const split = (
              opener &&
              opener.loc.end.line !== beforeClose.loc.start.line
            );

            if ( split ) {
              const hasSpace = sourceCode.isSpaceBetweenTokens(
                beforeClose,
                closeParen
              );

              if ( hasSpace ) {
                context.report({
                  node,
                  loc: token.loc.end,
                  messageId: 'rejectedClosingSpace',
                  fix( fixer ) {
                    return fixer.removeRange([
                      beforeClose.range[ 1 ],
                      closeParen.range[ 0 ]
                    ]);
                  }
                });
              }
              return;
            }
          }

          // require opening spaces
          if ( isOpen && shouldOpenerHaveSpace( token, nextToken ) ) {
            context.report({
              node,
              loc: token.loc.end,
              messageId: 'missingOpeningSpace',
              fix( fixer ) {
                return fixer.insertTextAfter( token, ' ' );
              }
            });
            return;
          }

          // require closing spaces
          if ( isClose && shouldCloserHaveSpace( prevToken, token ) ) {
            context.report({
              node,
              loc: token.loc.start,
              messageId: 'missingClosingSpace',
              fix( fixer ) {
                return fixer.insertTextBefore( token, ' ' );
              }
            });
            return;
          }
        });
      }
    };
  }
};
