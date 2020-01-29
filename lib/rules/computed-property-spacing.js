/**
 * @fileoverview Disallows or enforces spaces inside computed properties.
 * @author Jamund Ferguson
 * @copyright 2015 Jamund Ferguson. All rights reserved.
 * @copyright 2020 Kevin Ennis (Starry mods + refactor)
 */

'use strict';

const astUtils = require('eslint/lib/rules/utils/ast-utils');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    fixable: 'whitespace'
  },

  create( context ) {
    const sourceCode = context.getSourceCode();

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Reports that there shouldn't be a space after the first token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @param {Token} tokenAfter - The token after `token`.
     * @returns {void}
     */

    function reportNoBeginningSpace( node, token, tokenAfter ) {
      context.report({
        node,
        loc: token.loc.start,
        message: 'There should be no space after \'' + token.value + '\'',
        fix( fixer ) {
          return fixer.removeRange([
            token.range[ 1 ],
            tokenAfter.range[ 0 ]
          ]);
        }
      });
    }

    /**
     * Reports that there shouldn't be a space before the last token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @param {Token} tokenBefore - The token before `token`.
     * @returns {void}
     */

    function reportNoEndingSpace( node, token, tokenBefore ) {
      context.report({
        node,
        loc: token.loc.start,
        message: 'There should be no space before \'' + token.value + '\'',
        fix( fixer ) {
          return fixer.removeRange([
            tokenBefore.range[ 1 ],
            token.range[ 0 ]
          ]);
        }
      });
    }

    /**
     * Reports that there should be a space after the first token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */

    function reportRequiredBeginningSpace( node, token ) {
      context.report({
        node,
        loc: token.loc.start,
        message: 'A space is required after \'' + token.value + '\'',
        fix( fixer ) {
          return fixer.insertTextAfter( token, ' ' );
        }
      });
    }

    /**
     * Reports that there should be a space before the last token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */

    function reportRequiredEndingSpace( node, token ) {
      context.report({
        node,
        loc: token.loc.start,
        message: 'A space is required before \'' + token.value + '\'',
        fix( fixer ) {
          return fixer.insertTextBefore( token, ' ' );
        }
      });
    }

    /**
     * Returns a function that checks the spacing of a node on the property name
     * that was passed in.
     * @param {String} propertyName The property to check for spacing
     * @returns {Function} A function that will check spacing on a node
     */

    function checkSpacing( propertyName ) {
      return function( node ) {
        if ( !node.computed ) {
          return;
        }

        const property = node[ propertyName ];

        const before = context.getTokenBefore( property );
        const first = context.getFirstToken( property );
        const last = context.getLastToken( property );
        const after = context.getTokenAfter( property );

        const isString = (
          first === last &&
          ( first.type === 'String' || first.type === 'Template' )
        );

        // idiomatic exceptions
        if ( isString ) {
          if ( sourceCode.isSpaceBetweenTokens( before, first ) ) {
            reportNoBeginningSpace( node, before, first );
          }
          if ( sourceCode.isSpaceBetweenTokens( last, after ) ) {
            reportNoEndingSpace( node, after, last );
          }
          return;
        }

        if ( astUtils.isTokenOnSameLine( before, first ) ) {
          const hasSpace = sourceCode.isSpaceBetweenTokens( before, first );

          if ( !hasSpace && astUtils.isTokenOnSameLine( before, first ) ) {
            reportRequiredBeginningSpace( node, before );
          }
        }

        if ( astUtils.isTokenOnSameLine( last, after ) ) {
          const hasSpace = sourceCode.isSpaceBetweenTokens( last, after );

          if ( !hasSpace && astUtils.isTokenOnSameLine( last, after ) ) {
            reportRequiredEndingSpace( node, after );
          }
        }
      };
    }


    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
      Property: checkSpacing('key'),
      MemberExpression: checkSpacing('property')
    };
  }

};
