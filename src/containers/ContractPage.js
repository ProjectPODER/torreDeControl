import React from 'react';
import ReactDOM from 'react-dom';
import SearchInput from '../components/SearchInput/SearchInput'
import SearchFilters from '../components/SearchFilters/SearchFilters'
import {PropTypes} from 'react';
import {connect} from 'react-redux';
import {isLoaded, getContractsList} from '../redux/modules/contracts';
import {bindActionCreators} from 'redux';
import MathSet from '../sets.js';
import OrganizationsList from '../components/OrganizationsList/OrganizationsList';
import moment from 'moment';

@connect(
    state => ({
    	contracts: state.contracts.contracts,
    	keyword: state.contracts.keyword,
    	fromAmount: state.contracts.fromAmount,
			toAmount: state.contracts.toAmount,
			contractType: state.contracts.contractType,
			procedureType: state.contracts.procedureType,
			fromDate: state.contracts.fromDate,
			toDate: state.contracts.toDate,
    	loaded: state.contracts.loaded
    }),
    dispatch => bindActionCreators({isLoaded, getContractsList}, dispatch))
class ContractPage extends React.Component {

	componentDidMount() {
		this.props.getContractsList();
	}

	static propTypes = {
		contracts: PropTypes.array,
		keyword: PropTypes.string,
		fromAmount: PropTypes.number,
		toAmount: PropTypes.number,
		contractType: PropTypes.string,
		procedureType: PropTypes.string,
		fromDate: PropTypes.instanceOf(moment),
		toDate: PropTypes.instanceOf(moment),
		loaded: PropTypes.bool
	}

	betweenAmounts(min, max, val) {
		return min <= val && val <= max;
	}

	betweenDates(s_before, s_after, s_start, s_end) {
		const before = (new Date(s_before)).getTime();
		const after = (new Date(s_after)).getTime();
		const start = (new Date(s_start)).getTime();
		const end = (new Date(s_end)).getTime();
		return before <= end && start <= after;
	}

	keywordInString(keyword, str) {
		return str.indexOf(keyword) > -1;
	}

	groupByOrganizations(contracts) {
		const contractsSet = new MathSet(contracts);
		contractsSet.indexBy("proveedor");
		const contractsByOrganizations = contractsSet.indexes.proveedor;
		window.contracts = Object.keys(contractsByOrganizations).map(key => contractsByOrganizations[key]);
		return Object.keys(contractsByOrganizations).map(key => contractsByOrganizations[key]);
	}

	filterContracts(contracts) {
		const betweenAmounts = this.betweenAmounts;
		const betweenDates = this.betweenDates;
		const keywordInString = this.keywordInString;
		const keyword = this.props.keyword.toLowerCase().trim();
		const fromAmount = this.props.fromAmount;
		const toAmount = this.props.toAmount;
		const contractType = this.props.contractType;
		const procedureType = this.props.procedureType;
		const fromDate = this.props.fromDate;
		const toDate = this.props.toDate;

		const filtered = contracts.filter((contract) => {
			const title = contract.title.toLowerCase();
			const organization = contract.proveedor.toLowerCase();
			const startDate = contract.start_date;
			const endDate = contract.end_date;
			const date = contract.title.toLowerCase();
			const amount = parseInt(contract.amount);
			const procedureTypeField = contract.procedure_type;
			const contractTypeField = contract.type;

			const inTitle = keywordInString(keyword, title);
			const inOrganization = keywordInString(keyword, organization);
			const inAmount = betweenAmounts(fromAmount, toAmount, amount);
			const inDate = betweenDates(fromDate, toDate, startDate, endDate);
			const inProcedureType = procedureType === procedureTypeField;
			const inContractType = contractType === contractTypeField;
			
			return (inOrganization || inTitle) && inAmount && inDate && inProcedureType && inContractType;
		});

		return filtered;
	}

	render() {
		const filteredContracts = this.filterContracts(this.props.contracts)
		const contractsByOrganizations = this.groupByOrganizations(filteredContracts);
		
		return (
			<div className="contracts-content">
				<h1 className="content-title">Contratos por empresas</h1>
				<SearchInput />
				<SearchFilters />
				<OrganizationsList contractsByOrganizations={contractsByOrganizations}/>
			</div>
		);
	}
}

module.exports = ContractPage;