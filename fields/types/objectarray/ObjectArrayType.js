// var async = require('async');
var FieldType = require('../Type');
var util = require('util');
var utils = require('keystone-utils');
var q = require('q');
var _ = require('lodash');

var isReserved = require('../../../lib/list/isReserved');

/**
 * List FieldType Constructor
 * @extends Field
 * @api public
 */
function objectarray (keystoneList, path, options) {
	this._underscoreMethods = ['format'];
	objectarray.super_.call(this, keystoneList, path, options);
}
objectarray.properName = 'ObjectArray';
util.inherits(objectarray, FieldType);

function validateFieldType (field, path, type) {
	var Field = field.list.keystone.Field;
	if (!(type.prototype instanceof Field)) {
		// Convert native field types to their default Keystone counterpart
		if (type === String) {
			type = Field.Types.Text;
		} else if (type === Number) {
			type = Field.Types.Number;
		} else if (type === Boolean) {
			type = Field.Types.Boolean;
		} else if (type === Date) {
			type = Field.Types.Datetime;
		} else {
			throw new Error(
				'Unrecognised field constructor for nested schema path `' + path + '` in `' + field.list.key + '.' + field.path + '`: ' + type
			);
		}
	}
	return type;
}

/**
 * Registers the field on the List's Mongoose Schema.
 *
 * @api public
 */
objectarray.prototype.addToSchema = function (schema) {
	var field = this;

	var fields = this.fields = {};
	var fieldsArray = this.fieldsArray = [];
	var fieldsSpec = this.options.fields;
	var itemSchema = {};

	if (typeof fieldsSpec !== 'object' || !Object.keys(fieldsSpec).length) {
		throw new Error(
			'List field ' + field.list.key + '.' + field.path
			+ ' must be configured with `fields`.'
		);
	}

	function createField (path, options) {
		if (typeof options === 'function') {
			options = { type: options };
		}
		if (field.list.get('noedit') || field.noedit) {
			options.noedit = true;
		}
		if (typeof options.type !== 'function') {
			throw new Error(
				'Invalid type for nested schema path `' + path + '` in `'
				+ field.list.key + '.' + field.path + '`.\n'
				+ 'Did you misspell the field type?\n'
			);
		}
		options.type = validateFieldType(field, path, options.type);
		// We need to tell the Keystone List that this field type is in use
		field.list.fieldTypes[options.type.name] = options.type.properName;
		// WYSIWYG HTML fields are special-cased
		if (options.type.name === 'html' && options.wysiwyg) {
			field.list.fieldTypes.wysiwyg = true;
		}
		// Tell the Field that it is nested, this changes the constructor slightly
		options._isNested = true;
		options._nestedSchema = itemSchema;
		return new options.type(field.list, path, options);
	}

	Object.keys(fieldsSpec).forEach(function (path) {
		if (!fieldsSpec[path]) {
			throw new Error(
				'Invalid value for nested schema path `' + path + '` in `'
				+ field.list.key + '.' + field.path + '`.\n'
				+ 'Did you misspell the field type?\n'
			);
		}
		if (isReserved(path)) {
			throw new Error(
				'Nested schema path ' + path + ' on field '
				+ field.list.key + '.' + field.path + ' is a reserved path'
			);
		}
		var newField = createField(path, fieldsSpec[path]);
		fields[path] = newField;
		fieldsArray.push(newField);
	});

	if (this.options.decorateSchema) {
		this.options.decorateSchema(itemSchema);
	}

	schema.add(this._path.addTo({}, [itemSchema]));
	this.bindUnderscoreMethods();
};

/**
 * Provides additional properties for the Admin UI
 */
objectarray.prototype.getProperties = function (item, separator) {
	var fields = {};
	this.fieldsArray.forEach(function (field) {
		fields[field.path] = field.getOptions();
	});
	return {
		fields: fields,
	};
};

/**
 * Formats the field value
 */
objectarray.prototype.format = function (item, separator) {
	// TODO: How should we format nested items? Returning length for now.
	var items = item.get(this.path) || [];
	return utils.plural(items.length, '* Value', '* Values');
};

// TODO: How should we filter list values?
/*
list.prototype.addFilterToQuery = function (filter) { };
*/

/**
 * Asynchronously confirms that the provided value is valid
 */
objectarray.prototype.validateInput = function (data, callback) {

	var field = this;
	var value = this.getValueFromData(data);
	var fieldsToValidate = [];
	// var result = true;

	if (!!value && value.length) {
		value.forEach(function (item) {
			field.fieldsArray.forEach(function (f) {
				var deferred = q.defer();
				fieldsToValidate.push(deferred.promise);
				f.validateInput(item, function (result) {
					deferred.resolve(result);
				});
			});
		});
	}

	q.allSettled(fieldsToValidate)
		.then(function (results) {
			var valid = !_.filter(results, function (result) { return !result.value; }).length;
			utils.defer(callback, valid);
		});
};

/**
 * Asynchronously confirms that the a value is present
 */
objectarray.prototype.validateRequiredInput = function (item, data, callback) {
	// TODO
	// var value = this.getValueFromData(data);
	var result = true;
	utils.defer(callback, result);
};

objectarray.prototype.getData = function (item) {
	var items = item.get(this.path) || [];

	return items.filter(el => {
		return !!el;
	}).map((el, i) => {
		return { ...el, id: i };
	});
};

/**
 * Updates the value for this field in the item from a data object.
 * If the data object does not contain the value, then the value is set to empty array.
 */

objectarray.prototype.updateItem = function (item, data, files, callback) {
	if (typeof files === 'function') {
		callback = files;
		files = {};
	}

	var field = this;
	var values = this.getValueFromData(data);

	// Reset the value when undefined, null, or an empty string is provided
	if (values === undefined || values === null || values === '') {
		values = [];
	}

	// Wrap non-array values in an array
	if (!Array.isArray(values)) {
		if (typeof values === 'object') {
			values.length = Object.keys(values).length;
			values = Array.prototype.slice.call(values);
		} else {
			values = [values];
		}
	}

	item.set(field.path, values.filter(el => {
		return !!el;
	}));
	callback();
};

/* Export Field Type */
module.exports = objectarray;
