/* eslint-disable react/jsx-no-bind */

import assign from 'object-assign';
import { css, StyleSheet } from 'aphrodite/no-important';
import React from 'react';
import Field from '../Field';
import Domify from 'react-domify';

import { Fields } from 'FieldTypes';
import { Button, GlyphButton } from '../../../admin/client/App/elemental';
import InvalidFieldType from '../../../admin/client/App/shared/InvalidFieldType';

const ItemDom = ({ name, id, onRemove, children }) => (
	<div style={{
		borderTop: '2px solid #c5c5c5',
		paddingTop: 15,
	}}>
		{name && <input type="hidden" name={name} value={id} />}
		{children}
		<div style={{ textAlign: 'right', paddingBottom: 10 }}>
			<Button size="xsmall" color="danger" onClick={onRemove}>
				Remove
			</Button>
		</div>
	</div>
);

module.exports = Field.create({
	displayName: 'ObjectArrayField',
	statics: {
		type: 'ObjectArray',
	},
	propTypes: {
		fields: React.PropTypes.object.isRequired,
		label: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired,
		path: React.PropTypes.string.isRequired,
		value: React.PropTypes.array,
	},
	addItem () {
		const { path, value = [], onChange } = this.props;
		onChange({
			path,
			value: [
				...value,
				{
					id: value.length,
					_isNew: true,
				},
			],
		});
	},
	removeItem (index) {
		const { value: oldValue, path, onChange } = this.props;
		const value = oldValue.slice(0, index).concat(oldValue.slice(index + 1));
		onChange({ path, value });
	},
	handleFieldChange (index, event) {
		const { value: oldValue, path, onChange } = this.props;
		const head = oldValue.slice(0, index);
		const item = {
			...oldValue[index],
			[event.path]: event.value,
		};
		const tail = oldValue.slice(index + 1);
		const value = [...head, item, ...tail];
		onChange({ path, value });
	},
	renderFieldsForItem (index, value) {
		return Object.keys(this.props.fields).map((path) => {
			const field = this.props.fields[path];
			if (typeof Fields[field.type] !== 'function') {
				return React.createElement(InvalidFieldType, { type: field.type, path: field.path, key: field.path });
			}
			const props = assign({}, field);
			props.value = value[field.path];
			props.values = value;
			props.onChange = this.handleFieldChange.bind(this, index);
			props.mode = 'edit';
			props.key = field.path;

			// Set the current prefix to <path of current list> + index.
			props.inputNamePrefix = `${this.props.inputNamePrefix || this.props.path}[${index}]`;

			// TODO ?
			// if (props.dependsOn) {
			// 	props.currentDependencies = {};
			// 	Object.keys(props.dependsOn).forEach(dep => {
			// 		props.currentDependencies[dep] = this.state.values[dep];
			// 	});
			// }
			return React.createElement(Fields[field.type], props);
		}, this);
	},
	renderItems () {
		const { value = [], path, inputNamePrefix } = this.props;
		const onAdd = this.addItem;
		// Initialize inputNamePrefix for this list.
		this.props.inputNamePrefix = ((a, b) => a ? `${a}[${b}]` : b)(inputNamePrefix, path);
		return (
			<div>
				{value && value.map((value, index) => {
					const { id, _isNew } = value;
					const name = !_isNew && `${path}[${index}][id]`;
					const onRemove = e => this.removeItem(index);
					return (
						<ItemDom key={id} {...{ id, name, onRemove }}>
							{this.renderFieldsForItem(index, value)}
						</ItemDom>
					);
				})}
				<div style={{ textAlign: 'right', padding: '10px 0', borderTop: '2px solid #c5c5c5' }}>
					<GlyphButton color="success" glyph="plus" position="left" onClick={onAdd}>
						Add
					</GlyphButton>
				</div>
			</div>
		);
	},
	renderUI () {
		const { label, value } = this.props;
		return (
			<div className={css(classes.container)}>
				<h3 data-things="whatever">{label}</h3>
				{this.shouldRenderField() ? (
					this.renderItems()
				) : (
					<Domify value={value} />
				)}
				{this.renderNote()}
			</div>
		);
	},
});

const classes = StyleSheet.create({
	container: {
		marginTop: '3em',
		background: '#ececec',
		padding: '20px',
		// paddingLeft: '2em',
		// boxShadow: '-3px 0 0 rgba(0, 0, 0, 0.1)',
	},
});