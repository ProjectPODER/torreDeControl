import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import ContractItem from '../ContractItem/ContractItem';

class ContractsList extends React.Component {
	/* TODO: VER REQUIRED */
	static propTypes = {
		contracts: PropTypes.array
	}

	render() {
		const contracts = this.props.contracts;
		return (
			<ul className="contracts-list">
				{contracts.map((contract) => {
					const title = contract.value.title;
					const id = contract.value._id;
					return <ContractItem key={id} title={title}/>;
				})}
			</ul>
		);
	}
}

module.exports = ContractsList;