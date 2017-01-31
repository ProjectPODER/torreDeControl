import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';

class ContractItem extends React.Component {
	static propTypes = {
		title: PropTypes.string
	}

	render() {
		const title = this.props.title;
		return (
			<li className="contracts-item">{title}</li>
		);
	}
}

module.exports = ContractItem;
