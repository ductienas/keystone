module.exports = {
	Field: require('../RelationshipCustomField'),
	Filter: require('../RelationshipCustomFilter'),
	readme: require('fs').readFileSync('./fields/types/relationshipcustom/Readme.md', 'utf8'),
	section: 'Miscellaneous',
	spec: [{
		label: 'Single Relationship Custom',
		path: 'relationshipcustom',
		// createInline isn't available in the explorer because it depends on
		// real list definitions and the FieldTypes bundle
		// createInline: true,
		refList: {
			key: 'Flavour',
			path: 'flavours',
			plural: 'Flavours',
			singular: 'Flavour',
		},
		value: '',
	}, {
		label: 'Many Relationship Custom',
		path: 'manyrelationshipcustom',
		many: true,
		// createInline: true,
		refList: {
			key: 'Flavour',
			path: 'flavours',
			plural: 'Flavours',
			singular: 'Flavour',
		},
		value: '',
	}],
};
