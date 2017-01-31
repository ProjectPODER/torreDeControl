import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import ContractsList from '../ContractsList/ContractsList';
import classNames from 'classnames';

class OrganizationItem extends React.Component {
	static propTypes = {
		contracts: PropTypes.array,
		opened: PropTypes.bool
	}

	tabClick = (tab) => {
		this.props.tabClick(tab);
	};

	render() {
		const contracts = this.props.contracts;
		const organizationName = contracts[0].value.proveedor;
		const organizationAmount = contracts.reduce((semitotal, amount) => {return semitotal + amount.value.amount}, 0);
		const organizationCount = contracts.length;
		const opened = this.props.opened;
		return (
			<li className={classNames(['organizations-item', {opened: opened}])}>
				<div className="organizations-header" onClick={() => {this.tabClick(organizationName)}}>
					<span className="organizations-title">{organizationName}</span>
					<span className="organizations-count">{organizationCount}</span>
					<span className="organizations-amount">{organizationAmount}</span>
				</div>
				<ContractsList contracts={contracts}/>
			</li>
		);
	}
}

module.exports = OrganizationItem;