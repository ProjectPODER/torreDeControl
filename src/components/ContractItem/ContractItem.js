import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';

class ContractItem extends React.Component {
	static propTypes = {
		simple: PropTypes.string,
		title: PropTypes.string,
		amount: PropTypes.number,
		type: PropTypes.string,
		procedureType: PropTypes.string,
		startDate: PropTypes.string,
		endDate: PropTypes.string,
		ocid: PropTypes.string,
		suppliers: PropTypes.array,
		contractLink: PropTypes.string,
	}

	render() {
		const simple = this.props.simple;
		const title = this.props.title;
		const amount = this.props.amount.toLocaleString();
		const type = this.props.type;
		const procedureType = this.props.procedureType;
		const startDate = typeof(this.props.startDate) !== 'undefined' ? (new Date(this.props.startDate)).toLocaleDateString() : 'No registrada';
		const endDate = typeof(this.props.endDate) !== 'undefined' ? (new Date(this.props.endDate)).toLocaleDateString() : 'No registrada';
		const ocid = this.props.ocid;
		const suppliers = this.props.suppliers;
		const filteredNames = suppliers.map(supplier => supplier.simple);
		const filteredSuppliers = filteredNames.filter(name => name != simple);
		const suppliersTitle = <span className="contract-suppliers-title">Organizaciones relacionadas a este contrato:</span>;
		const suppliersList = <ul className="contract-suppliers-list">{filteredSuppliers.map((item) => {return <li key={item}>{item}</li> })}</ul>;
		const contractLink = this.props.contractLink;

		return (
			<li className="contracts-item">
				<span className="contract-title">{title}</span>
				<div className="contract-details">
					<div className="details-left">
						<span className="contract-amount">Monto: $ {amount}</span>
						<span className="contract-type">Tipo de contrato: {type}</span>
						<span className="contract-procedure-type">Tipo de procedimiento: {procedureType}</span>
						{	filteredSuppliers.length != 0 ? suppliersTitle : null	}
						{	filteredSuppliers.length != 0 ? suppliersList : null	}
					</div>
					<div className="details-right">
						<span className="contract-start-date">Inicio: {startDate}</span>
						<span className="contract-end-date">Finalización: {endDate}</span>
						<span className="contract-ocid">OCID: {ocid}</span>
						<a rel="noopener noreferrer" target="_blank" href={contractLink} className="contract-link">Enlace a contrato</a>
					</div>
				</div>
			</li>
		);
	}
}

module.exports = ContractItem;
