const HANGUL_FILLER             = '\u3164'.codePointAt( 0 );
const HANGUL_CHOSEONG_FILLER    = '\u115F'.codePointAt( 0 );
const HANGUL_JUNGSEONG_FILLER   = '\u1160'.codePointAt( 0 );

const invisibleCharacters = [
  HANGUL_FILLER,
  HANGUL_CHOSEONG_FILLER,
  HANGUL_JUNGSEONG_FILLER
];

const isInvisible = ( codePoint ) => {
  return invisibleCharacters.includes( codePoint );
};

const toEscapedUnicode = ( codePoint ) => {
  return `\\u${ codePoint.toString( 16 ).toUpperCase() }`;
};

module.exports = {
  isInvisible,
  toEscapedUnicode
};
