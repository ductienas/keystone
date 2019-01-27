import React from 'react';
import ItemsTableCell from '../../components/ItemsTableCell';
import ItemsTableValue from '../../components/ItemsTableValue';

var ObjectColumn = React.createClass({
	displayName: 'ObjectColumn',
	propTypes: {
		col: React.PropTypes.object,
		data: React.PropTypes.object,
	},
	render () {
		const value = 'object';
		return (
			<ItemsTableCell>
				<ItemsTableValue padded interior field={this.props.col.type}>
					{value}
				</ItemsTableValue>
			</ItemsTableCell>
		);
	},
});

module.exports = ObjectColumn;
