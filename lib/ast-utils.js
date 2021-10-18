module.exports = {
  isTokenOnSameLine( left, right ) {
    return left.loc.end.line === right.loc.start.line;
  },
  isOpeningParenToken( token ) {
    return token.value === '(' && token.type === 'Punctuator';
  },
  isClosingParenToken( token ) {
    return token.value === ')' && token.type === 'Punctuator';
  }
};
