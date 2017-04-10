import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import ContractItem from '../ContractItem/ContractItem';
import classNames from 'classnames';

class ContractsList extends React.Component {
	/* TODO: VER REQUIRED */
	static propTypes = {
		contracts: PropTypes.array,
		opened: PropTypes.bool,
	}

	render() {
		const contracts = this.props.contracts;
		const opened = this.props.opened;

		return (
			<ul className={classNames(['contracts-list', {opened: opened}])}>
				{contracts.map((contract) => {
					const title = contract.value.title;
					const id = contract.value._id;
					const simple = contract.key;
					const amount = contract.value.amount;
					const type = contract.value.type;
					const procedureType = contract.value.procedure_type;
					const startDate = contract.value.start_date;
					const endDate = contract.value.end_date;
					const ocid = contract.value.ocid;
					const suppliers = contract.value.suppliers;
					const contractLink = `https://www.quienesquien.wiki/contracts/${id}#read`;
					return <ContractItem key={id} simple={simple} title={title} amount={amount} type={type} procedureType={procedureType} startDate={startDate} endDate={endDate} ocid={ocid} contractLink={contractLink} suppliers={suppliers} />;
				})}
			</ul>
		);
	}
}

module.exports = ContractsList;
