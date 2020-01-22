'use strict';

let astUtils = require('eslint/lib/rules/utils/ast-utils');

const REJECTED_REQUIRE_ALIGN_MSG = 'Require assignment should be aligned.';

module.exports = function( context ) {
  let ENABLED = context.options[ 0 ] === 'always'; // default is "never"

  return {
    Program: node => {
      if (!ENABLED) {
        return;
      }

      const isSingleVariableDecleration = node => ( node.type === 'VariableDeclaration' && node.declarations && node.declarations.length === 1 );
      const isRequireDecleration = node => ( node.init && node.init.callee && node.init.callee.type === 'Identifier' && node.init.callee.name === 'require' );
      const pluckCalleeFromDecleration = node => node.declarations[ 0 ].init.callee;
      const isTopLevelRequireDecleration = node => {
        if ( !isSingleVariableDecleration( node ) ) {
          return false;
        }

        let declaration = node.declarations[ 0 ];
        return isRequireDecleration( declaration );
      }

      const requireDeclerations = node.body.filter( isTopLevelRequireDecleration ).map( pluckCalleeFromDecleration );
      const pluckStartColumn = token => token.loc.start.column;

      if ( requireDeclerations.length === 0 ) {
        return;
      }

      let last = requireDeclerations[ 0 ];
      for ( let index in requireDeclerations ) {
        const current = requireDeclerations[ index ];

        if ( pluckStartColumn( current ) !== pluckStartColumn( last ) ) {
          context.report({
            node: node,
            loc: current.loc.start,
            message: REJECTED_REQUIRE_ALIGN_MSG
          });
          break;
        }

        last = current;
      }
    }
  };
};

module.exports.schema = [
  {
    enum: [ 'always', 'never' ]
  }
];
