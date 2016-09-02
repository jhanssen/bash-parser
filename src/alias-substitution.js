'use strict';
module.exports = (options, preAliasLexer) => function * aliasSubstitution(tokens) {
	function * tryExpandToken(token, expandingAliases) {
		if (expandingAliases.indexOf(token.WORD) === -1 && token._.maybeSimpleCommandName) {
			// console.log('tryExpandToken', token.WORD);
			const result = options.resolveAlias(token.WORD);
			// console.log('\tresolve to ', result);

			if (result !== undefined) {
				for (const newToken of preAliasLexer(result)) {
					if (!newToken.EOF) {
						yield * tryExpandToken(
							newToken,
							expandingAliases.concat(token.WORD)
						);
					}
				}
				return;
			}
		}

		yield token;
	}

	if (typeof options.resolveAlias === 'function') {
		for (const token of tokens) {
			yield * tryExpandToken(token, []);
		}
	} else {
		for (const token of tokens) {
			yield token;
		}
	}
};