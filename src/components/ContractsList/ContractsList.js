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
					const amount = contract.value.amount;
					const type = contract.value.type;
					const procedureType = contract.value.procedure_type;
					const startDate = contract.value.start_date;
					const endDate = contract.value.end_date;
					const ocid = contract.value.ocid;
					const contractLink = `https://www.quienesquien.wiki/contracts/${id}#read`;
					return <ContractItem key={id} title={title} amount={amount} type={type} procedureType={procedureType} startDate={startDate} endDate={endDate} ocid={ocid} contractLink={contractLink} />;
				})}
			</ul>
		);
	}
}

module.exports = ContractsList;