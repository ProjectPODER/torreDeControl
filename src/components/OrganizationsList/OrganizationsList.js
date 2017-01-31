import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import OrgainzationItem from '../OrganizationItem/OrganizationItem';
import { connect } from 'react-redux';
import { changeSortCriteria } from '../../redux/modules/contracts';
import { bindActionCreators } from 'redux';

@connect(
    state => ({
    	sortBy: state.contracts.sortBy,
    	reverse: state.contracts.reverse
    }),
    dispatch => bindActionCreators({changeSortCriteria}, dispatch))
class OrganizationsList extends React.Component {
	constructor() {
		super();
		this.state = {
			tabsOpened: []
		};
	}
	static propTypes = {
		contractsByOrganizations: PropTypes.array.isRequired,
		sortBy: PropTypes.string,
		reverse: PropTypes.bool
	}

	tabClick = (tab) => {
		const newState = !this.state.tabsOpened[tab];
		this.setState({
			tabsOpened: {...this.state.tabsOpened, [tab]: newState  }
		});
	};

	changeSortCriteria = (newCriteria) => {
		this.props.changeSortCriteria(newCriteria);
	}

	sortCriteria = {
		byTitle(contracts, reverse) {
			const finalOrder = reverse ? -1 : 1;
			const sortedContracts = contracts.sort((a, b) => {
				const aTitle = a[0].value.proveedor;
				const bTitle = b[0].value.proveedor;
				const aId = a[0].value._id;
				const bId = b[0].value._id;
				if (aTitle < bTitle) return -10 * finalOrder;
				if (aTitle > bTitle) return 10 * finalOrder;
				if (aId < bId) return -1 * finalOrder;
				if (aId > bId) return 1 * finalOrder;
				return 0;
			});
			return sortedContracts;
		},
		byCount(contracts, reverse) {
			const finalOrder = reverse ? -1 : 1;
			const sortedContracts = contracts.sort((a, b) => {
				const aCount = parseInt(a.length);
				const bCount = parseInt(b.length);
				const aId = a[0].value._id;
				const bId = b[0].value._id;
				if (aCount < bCount) return -10 * finalOrder;
				if (aCount > bCount) return 10 * finalOrder;
				if (aId < bId) return -1 * finalOrder;
				if (aId > bId) return 1 * finalOrder;
				return 0;
			});
			return sortedContracts;
		},
		byAmount(contracts, reverse) {
			const finalOrder = reverse ? -1 : 1;
			const sortedContracts = contracts.sort((a, b) => {
				const aAmount = a.reduce((semitotal, amount) => {return semitotal + amount.value.amount}, 0);
				const bAmount = b.reduce((semitotal, amount) => {return semitotal + amount.value.amount}, 0);
				const aId = a[0].value._id;
				const bId = b[0].value._id;
				if (aAmount < bAmount) return -10 * finalOrder;
				if (aAmount > bAmount) return 10 * finalOrder;
				if (aId < bId) return -1 * finalOrder;
				if (aId > bId) return 1 * finalOrder;
				return 0;
			});
			return sortedContracts;
		},
	};

	render() {
		const sortBy = this.props.sortBy;
		const reverse = this.props.reverse;
		const contractsByOrganizations = this.sortCriteria[sortBy](this.props.contractsByOrganizations, reverse);
		return (
			<div>
				<div className="sort-bar">
					<ul className="sort-options-list">
						<li className="sort-by-title sort-options-item" onClick={() => {this.changeSortCriteria('byTitle')}}>Empresa</li>
						<li className="sort-by-count sort-options-item" onClick={() => {this.changeSortCriteria('byCount')}}>Cant. de Contratos</li>
						<li className="sort-by-amount sort-options-item" onClick={() => {this.changeSortCriteria('byAmount')}}>Monto Total</li>
					</ul>
				</div>
				<ul className="organizations-list">
					{contractsByOrganizations.map((contracts) => {
						const organizationTitle = contracts[0].value.proveedor;
						const opened = this.state.tabsOpened[organizationTitle] === true;
						const organizationName = contracts[0].value.proveedor;
						const organizationAmount = contracts.reduce((semitotal, amount) => {return semitotal + amount.value.amount}, 0);
						const organizationCount = contracts.length;
						return <OrgainzationItem organizationName={organizationName} organizationAmount={organizationAmount} organizationCount={organizationCount} opened={opened} key={organizationTitle} contracts={contracts} tabClick={this.tabClick}/>	
					})}
				</ul>
			</div>
		);
	}
}

module.exports = OrganizationsList;