import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';

class ContractItem extends React.Component {
	static propTypes = {
		title: PropTypes.string,
		amount: PropTypes.number,
		type: PropTypes.string,
		procedureType: PropTypes.string,
		startDate: PropTypes.string,
		endDate: PropTypes.string,
		ocid: PropTypes.number,
	}

	render() {
		const title = this.props.title;
		const amount = this.props.amount.toLocaleString();
		const type = this.props.type;
		const procedureType = this.props.procedureType;
		const startDate = (new Date(this.props.startDate)).toLocaleDateString();
		const endDate = (new Date(this.props.endDate)).toLocaleDateString();
		const ocid = this.props.ocid;
		
		return (
			<li className="contracts-item">
				<span className="contract-title">{title}</span>
				<div className="contract-details">
					<div className="details-left">
						<span className="contract-amount">Monto: $ {amount}</span>
						<span className="contract-type">Tipo de contrato: {type}</span>
						<span className="contract-procedure-type">Tipo de procedimiento: {procedureType}</span>
					</div>
					<div className="details-right">
						<span className="contract-start-date">Inicio: {startDate}</span>
						<span className="contract-end-date">Finalización: {endDate}</span>
						<span className="contract-ocid">OCID: {ocid}</span>
					</div>
				</div>
			</li>
		);
	}
}

module.exports = ContractItem;
