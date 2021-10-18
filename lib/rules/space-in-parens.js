/**
 * @fileoverview Disallows or enforces spaces inside of parentheses.
 * @author Jonathan Rajavuori
 * @copyright 2014 David Clark. All rights reserved.
 * @copyright 2014 Jonathan Rajavuori. All rights reserved.
 * @copyright 2020 Kevin Ennis (Starry mods + refactor)
 */

const astUtils = require('../ast-utils');

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
    // chars that *may* not require spaces
    const exceptions = { openers: [ '[', '{' ], closers: [ ']', '}' ] };

    // chars that come in pairs
    const openers = [ '(', '[', '{' ];
    const closers = [ ')', ']', '}' ];

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    const sourceCode = context.getSourceCode();

    // Determines if an opener paren should have a missing space after it
    function shouldOpenerHaveSpace( left, right ) {
      return !(
        sourceCode.isSpaceBetweenTokens( left, right ) ||
        astUtils.isClosingParenToken( right )
      );
    }

    // Determines if a closer paren should have a missing space before it
    function shouldCloserHaveSpace( left, right ) {
      return !(
        astUtils.isOpeningParenToken( left ) ||
        sourceCode.isSpaceBetweenTokens( left, right )
      );
    }

    // Get the matching opening/closing character (if any) for the
    // opener/closer at the given index
    function getMatch( tokens, index ) {
      const inc = openers.includes( tokens[ index ].value ) ? 1 : -1;

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
          candidate.value === openers[ typeIdx ] ? inc : (
            candidate.value === closers[ typeIdx ] ? -inc : 0
          )
        );

        if ( depth === 0 ) {
          return candidate;
        }
      }

      return null;
    }

    // is the token a string or template literal
    function isString( token ) {
      return token && ( token.type === 'String' || token.type === 'Template' );
    }

    // are the given tokens on the same line
    function sameLine( first, last ) {
      return first.loc.end.line === last.loc.start.line;
    }

    // fail on rejected space
    function reject( node, token, side, start, end ) {
      context.report({
        node,
        loc: token.loc.end,
        messageId: `rejected${ side === 0 ? 'Opening' : 'Closing' }Space`,
        fix( fixer ) {
          return fixer.removeRange([ start.range[ 1 ], end.range[ 0 ] ]);
        }
      });
    }

    // fail on missing space
    function missing( node, token, side ) {
      context.report({
        node,
        loc: token.loc.end,
        messageId: `missing${ side === 0 ? 'Opening' : 'Closing' }Space`,
        fix( fixer ) {
          return fixer[ `insertText${ side === 0 ? 'After' : 'Before' }` ](
            token,
            ' '
          );
        }
      });
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

          // is the token after the opening paren an exception token?
          // e.g. `{` or `[`
          const afterOpenException = !!(
            afterOpen &&
            exceptions.openers.includes( afterOpen.value )
          );

          // is the token before the closing paren an exception token?
          // e.g. `}` or `]`
          const beforeCloseException = !!(
            beforeClose &&
            exceptions.closers.includes( beforeClose.value )
          );

          // is `token` an open paren followed by an exception character?
          const isOpenException = isOpen && afterOpenException;

          // is `token` a close paren preceeded by an exception character?
          const isCloseException = isClose && beforeCloseException;

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

          // do we have a single string inside the parens?
          const singleString = (
            singleContents &&
            (
              ( isOpen && isString( nextToken ) ) ||
              ( isClose && isString( prevToken ) )
            )
          );

          /**
           * Rules
           */

          // reject space for single string inside parens
          if ( singleString ) {
            const target = isOpen ? nextToken : prevToken;
            const first  = isOpen ? token : prevToken;
            const last   = isOpen ? nextToken : token;

            if ( sourceCode.isSpaceBetweenTokens( token, target ) ) {
              reject( node, token, +!isOpen, first, last );
            }
            return;
          }

          // single object literal or array literal
          if ( singleContents && afterOpenException && beforeCloseException ) {
            const openSpace = sourceCode.isSpaceBetweenTokens(
              openParen,
              afterOpen
            );

            const closeSpace = sourceCode.isSpaceBetweenTokens(
              beforeClose,
              closeParen
            );

            const first = isOpen ? openParen : beforeClose;
            const last  = isOpen ? afterOpen : closeParen;

            if ( ( isOpen && openSpace ) || ( isClose && closeSpace ) ) {
              reject( node, token, +!isOpen, first, last );
            }
            return;
          }

          // reject space between a paren and an exception character ([,{,},])
          // when the matching exception character is on a different line
          if ( isOpenException || isCloseException ) {
            // grab exception character and its matching opener/closer
            const exception = isOpen ? afterOpen : beforeClose;
            const match     = getMatch( tokens, tokens.indexOf( exception ) );

            // the matched pair (in order) of `{}` or `[]`
            const pair = isOpen ? [ exception, match ] : [ match, exception ];

            // the character set to check for spaces, e.g. `({` or `})`
            const chars = isOpen ? [ token, exception ] : [ exception, token ];

            // is the pair split across multiple lines
            const split = match && !sameLine( ...pair );

            if ( split ) {
              const hasSpace = sourceCode.isSpaceBetweenTokens( ...chars );
              if ( hasSpace && sameLine( ...chars ) ) {
                reject( node, token, +!isOpen, ...chars );
              }
              return;
            }
          }

          // require opening spaces
          if ( isOpen && shouldOpenerHaveSpace( token, nextToken ) ) {
            return missing( node, token, 0 );
          }

          // require closing spaces
          if ( isClose && shouldCloserHaveSpace( prevToken, token ) ) {
            return missing( node, token, 1 );
          }
        });
      }
    };
  }
};
