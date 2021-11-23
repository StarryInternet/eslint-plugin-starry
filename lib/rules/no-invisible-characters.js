/**
 * @fileoverview Disallows invisible characters.
 */

const isInvisible      = require('../unicode').isInvisible;
const toEscapedUnicode = require('../unicode').toEscapedUnicode;

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {

  meta: {
    fixable: 'code'
  },

  create( context ) {
    const sourceCode = context.getSourceCode();

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    function reportInvisibleCharacter( node, range, instead ) {
      context.report({
        node,
        data: {
          instead
        },
        loc: {
          start: sourceCode.getLocFromIndex( range[ 0 ] ),
          end: sourceCode.getLocFromIndex( range[ 1 ] )
        },
        message: 'Unexpected invisible character. Use {{instead}} instead.',
        fix( fixer ) {
          return fixer.replaceTextRange(
            range,
            instead
          );
        }
      });
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
      Program: function checkInvisibleCharacter( node ) {
        const text = sourceCode.getText( node );

        let index = 0;
        for ( const c of text ) {
          const codePoint = c.codePointAt( 0 );
          if ( isInvisible( codePoint ) ) {
            const range   = [ index, index + c.length ];
            const instead = toEscapedUnicode( codePoint );
            reportInvisibleCharacter( node, range, instead );
          }
          index += c.length;
        }
      }
    };
  }

};
