const rule = name => require( `./lib/rules/${ name }` );

module.exports = {
  rules: {
    'computed-property-spacing': rule('computed-property-spacing'),
    'space-in-parens': rule('space-in-parens'),
    'aligned-requires': rule('aligned-requires'),
    'no-invisible-characters': rule('no-invisible-characters')
  }
};
