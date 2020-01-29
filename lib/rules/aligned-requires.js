/**
 * @fileoverview align-assignments
 * @author Lucas Florio (original)
 * @copyright 2020 Kevin Ennis (Starry mods + refactor)
 */

'use strict';

// -----------------------------------------------------------------------------
// Rule Definition
// -----------------------------------------------------------------------------

const hasRequire   = /require\(/;
const spaceMatcher = /(\s*)((?:\+|-|\*|\/|%|&|\^|\||<<|>>|\*\*|>>>)?=)/;
const assigners    = '=:+=:-=:*=:/=:%=:&=:^=:|=:<<=:>>=:**=:>>>='.split(':');

module.exports = {
  meta: {
    fixable: 'code'
  },

  create( context ) {
    const { options } = context;
    const enabled     = options && options[ 0 ] === 'always';
    const sourceCode  = context.getSourceCode();
    const groups      = [];

    let previousNode;

    // public API
    return {
      VariableDeclaration( node ) {
        const source = sourceCode.getText( node );

        if ( !hasRequire.test( source ) || !enabled ) {
          return;
        }

        addNode( node, node );
      },
      'Program:exit': checkAll
    };

    function checkAll() {
      groups.forEach( check );
    }

    function isAssignmentExpression( node ) {
      return node.type === 'AssignmentExpression';
    }

    function addNode( groupNode, node ) {
      if ( shouldStartNewGroup( groupNode, previousNode ) ) {
        groups.push([ node ]);
      } else {
        getLast( groups ).push( node );
      }

      previousNode = groupNode;
    }

    function shouldStartNewGroup( node ) {
      // first line of all
      if ( !previousNode ) {
        return true;
      }

      // switching parent nodes
      if ( node.parent !== previousNode.parent ) {
        return true;
      }

      // If previous node was a for and included the declarations, new group
      if (
        previousNode.parent.type === 'ForStatement' &&
        previousNode.declarations
      ) {
        return true;
      }

      // previous line was blank.
      const lineOfNode = sourceCode.getFirstToken( node ).loc.start.line;
      const lineOfPrev = sourceCode.getLastToken( previousNode ).loc.start.line;

      return lineOfNode - lineOfPrev !== 1;
    }

    function check( group ) {
      const maxPos = getMaxPos( group );

      if ( !areAligned( maxPos, group ) ) {
        context.report({
          loc: {
            start: group[ 0 ].loc.start,
            end: getLast( group ).loc.end
          },
          message: 'This group of assignments is not aligned.',
          fix: fixer =>  {
            const fixings = group.map( node => {
              const tokens        = sourceCode.getTokens( node );
              const firstToken    = tokens[ 0 ];
              const line          = sourceCode.getText( node );
              const lineIsAligned = line.charAt( maxPos ) === '=';

              const assignmentToken = tokens.find(
                token => assigners.includes( token.value )
              );

              const isMulti = isMultiline( firstToken, assignmentToken );

              if ( lineIsAligned || !assignmentToken || isMulti ) {
                return fixer.replaceText( node, line );
              } else {
                // source line may include spaces, need to accomodate for that.

                const spacePrefix   = firstToken.loc.start.column;
                const assignmentLoc = assignmentToken.loc;
                const startPos      = assignmentLoc.start.column - spacePrefix;
                const endPos        = assignmentLoc.end.column - spacePrefix;

                const start  = line.slice( 0, startPos ).replace( /\s+$/m, '' );
                const ending = line.slice( endPos ).replace( /^\s+/m, '' );

                const spacesRequired = (
                  maxPos - start.length - assignmentToken.value.length + 1
                );

                const spaces = ' '.repeat( spacesRequired );

                const fixedText = [
                  start,
                  spaces,
                  assignmentToken.value,
                  ' ',
                  ending
                ].join('');

                return fixer.replaceText( node, fixedText );
              }
            });

            return fixings.filter( Boolean );
          }
        });
      }
    }

    function isMultiline( firstToken, assignmentToken ) {
      return firstToken.loc.start.line !== assignmentToken.loc.start.line;
    }

    function findAssigment( node ) {
      const prefix   = getPrefix( node );
      const source   = sourceCode.getText( node );
      const match    = source.substr( prefix ).match( spaceMatcher );
      const position = match ? match.index + prefix + match[ 2 ].length : null;
      return position;
    }

    function getPrefix( node ) {
      const nodeBefore = isAssignmentExpression( node ) ?
        node.left :
        node.declarations.find( dcl => dcl.type === 'VariableDeclarator' ).id;

      const prefix = nodeBefore.loc.end.column - nodeBefore.loc.start.column;
      return prefix;
    }

    function areAligned( maxPos, nodes ) {
      return nodes
      .filter( assignmentOnFirstLine )
      .map( node => sourceCode.getText( node ) )
      .every( source => source.charAt( maxPos ) === '=' );
    }

    function getMaxPos( nodes ) {
      return nodes
      .filter( assignmentOnFirstLine )
      .map( findAssigment )
      .reduce( ( last, current ) => Math.max( last, current ), [] );
    }

    function assignmentOnFirstLine( node ) {
      if ( isAssignmentExpression( node ) ) {
        const onFirstLine = (
          node.left.loc.start.line === node.right.loc.start.line
        );
        return onFirstLine;
      } else {
        const source = sourceCode.getText( node );
        const lines  = source.split('\n');
        return lines[ 0 ].includes('=');
      }
    }

    function getLast( ary ) {
      return ary[ ary.length - 1 ];
    }
  }
};
