import createRule, {
	messageIds,
} from './no-relative-imports-when-same-folder/createRule';

const RULE_NAME = 'no-relative-imports-when-same-folder';

const rule = {
	[RULE_NAME]: {
		meta: {
			type: 'layout',
			fixable: 'code',
			hasSuggestions: true,
			messages: {
				[messageIds.importCanBeRelative]:
					'Import path can be relative since a file is imported from within the same folder \n \n' +
					'Replace with {{fixedImportPath}}',
			},
		},
		create: createRule,
	},
};

export default rule;
