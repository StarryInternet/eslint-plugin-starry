/**
 * @fileoverview Rule to flag when using constructor without parentheses
 * @author Ilya Volodin
 * @copyright 2022 Saahil Kumar (Starry mods + refactor)
 */



//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const astUtils = require('../ast-utils');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
  meta: {
    type: 'layout',
    fixable: 'code',
    messages: {
      unnecessary:  'Unnecessary space in parens when ' +
                    'invoking a constructor with no arguments.'
    }
  },

  create( context ) {

    const sourceCode = context.getSourceCode();

    return {
      NewExpression( node ) {
        if ( node.arguments.length !== 0 ) {
          return; // if there are arguments, there have to be parens
        }

        const lastToken         = sourceCode.getLastToken( node );
        const beforeLastToken   = sourceCode.getTokenBefore( lastToken );
        const hasLastParen      = lastToken &&
                                astUtils.isClosingParenToken( lastToken );

        // `hasParens` is true only if the new expression ends with
        // its own parens, e.g., new new foo() does not end with its own parens
        const hasParens         = hasLastParen &&
                                astUtils.isOpeningParenToken(
                                  beforeLastToken ) &&
                                node.callee.range[ 1 ] < node.range[ 1 ];

        const spaceBetweenParens    = hasParens &&
                                    sourceCode.isSpaceBetweenTokens(
                                      beforeLastToken,
                                      lastToken );


        if ( spaceBetweenParens ) {
          context.report({
            node,
            messageId: 'unnecessary',
            fix: fixer => [
              fixer.removeRange([
                beforeLastToken.range[ 1 ],
                lastToken.range[ 0 ]
              ])
            ]
          });
        }


      }
    };
  }
};
