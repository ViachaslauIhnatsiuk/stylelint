// NOTICE: This file is generated by Rollup. To modify it,
// please instead edit the ESM counterpart and rebuild with Rollup (npm run build).
'use strict';

const cssTokenizer = require('@csstools/css-tokenizer');
const cssTree = require('css-tree');
const regexes = require('../../utils/regexes.cjs');
const nodeFieldIndices = require('../../utils/nodeFieldIndices.cjs');
const report = require('../../utils/report.cjs');
const ruleMessages = require('../../utils/ruleMessages.cjs');
const validateOptions = require('../../utils/validateOptions.cjs');

const ruleName = 'syntax-string-no-invalid';

const messages = ruleMessages(ruleName, {
	rejected: (syntaxString) => `Unexpected invalid syntax string "${syntaxString}"`,
});

const meta = {
	url: 'https://stylelint.io/user-guide/rules/syntax-string-no-invalid',
};

/** @type {import('stylelint').CoreRules[ruleName]} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual: primary });

		if (!validOptions) {
			return;
		}

		const forkedLexer = cssTree.fork({
			properties: {
				'-stylelint-syntax': "'*' | <syntax-component> [ <syntax-combinator> <syntax-component> ]*",
			},
			types: {
				'syntax-component':
					"<syntax-single-component> <syntax-multiplier>? | '<' transform-list '>'",
				'syntax-single-component': "'<' <syntax-type-name> '>' | <ident>",
				'syntax-type-name':
					'angle | color | custom-ident | image | integer | length | length-percentage | number | percentage | resolution | string | time | url | transform-function',
				'syntax-combinator': "'|'",
				'syntax-multiplier': "[ '#' | '+' ]",
			},
		}).lexer;

		root.walkAtRules(regexes.atRuleRegexes.propertyName, (atRule) => {
			atRule.walkDecls(regexes.descriptorRegexes.syntaxName, (decl) => {
				const tokens = cssTokenizer.tokenize({ css: decl.value }).filter((token) => cssTokenizer.isTokenString(token));

				tokens.forEach((token) => {
					const { error } = forkedLexer.matchProperty('-stylelint-syntax', token[4].value);

					if (!error) return;

					if (!('mismatchLength' in error)) return;

					const { name, rawMessage } = error;

					if (name !== 'SyntaxMatchError') return;

					if (rawMessage !== 'Mismatch') return;

					const valueIndex = nodeFieldIndices.declarationValueIndex(decl);

					report({
						message: messages.rejected,
						messageArgs: [token[1]],
						node: decl,
						index: valueIndex + token[2],
						endIndex: valueIndex + token[3] + 1,
						result,
						ruleName,
					});
				});
			});
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

module.exports = rule;
