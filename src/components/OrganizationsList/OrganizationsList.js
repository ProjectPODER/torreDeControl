import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import OrgainzationItem from '../OrganizationItem/OrganizationItem';
import { connect } from 'react-redux';
import { changeSortCriteria, paginationGoToNextPage, paginationGoToPreviousPage, paginationGoToPage, setFilteredResults } from '../../redux/modules/contracts';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

@connect(
    state => ({
    	sortBy: state.contracts.sortBy,
    	reverse: state.contracts.reverse,
    	pagination: state.contracts.pagination,
    	pages: state.contracts.pages,
    	loadingResults: state.contracts.loadingResults
    }),
    dispatch => bindActionCreators({changeSortCriteria, paginationGoToNextPage, paginationGoToPreviousPage, paginationGoToPage, setFilteredResults}, dispatch))
class OrganizationsList extends React.Component {
	constructor() {
		super();
		this.state = {
			tabsOpened: []
		};
	}

	componentWillReceiveProps(nextProps) {
		this.props.setFilteredResults(nextProps.contractsByOrganizations.length);
	}

	static propTypes = {
		contractsByOrganizations: PropTypes.array.isRequired,
		sortBy: PropTypes.string,
		reverse: PropTypes.bool,
		loadingResults: PropTypes.bool,
		pagination: PropTypes.object,
		changeSortCriteria: PropTypes.func,
		paginationGoToNextPage: PropTypes.func,
		paginationGoToPreviousPage: PropTypes.func,
		paginationGoToPage: PropTypes.func,
		setFilteredResults: PropTypes.func
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
				const aTitle = a[0].value.suppliers[0].simple;
				const bTitle = b[0].value.suppliers[0].simple;
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
		const paginationResultsPerPage = this.props.pagination.resultsPerPage;
		const page = this.props.pagination.page;
		const paginationFrom = page * paginationResultsPerPage;
		const paginationTo = paginationFrom + paginationResultsPerPage;
		const paginatedContracts = contractsByOrganizations.slice(paginationFrom, paginationTo);
		const pages = [...Array(this.props.pages).keys()];
		const paginationVisible = contractsByOrganizations.length > 0;
		const contractsLoaded = !this.props.loadingResults;
		const noResults = paginatedContracts.length === 0;
		let paginatorPages = [];

		if (pages.length > 5){
			let bottom = (page - 3) < 0 ? 0 : (page - 3);
			let top = (page + 3) > pages.length ? pages.length : (page + 3);
			paginatorPages = pages.slice(bottom, top)
			if (bottom > 0) paginatorPages.unshift(0, '...')
			if (top < pages.length) paginatorPages.push('...', pages.length - 1)
		} else {
			paginatorPages = pages;
		}
		return (
			<div>
				<div className="sort-bar">
					<ul className="sort-options-list">
						<li className={classNames(["sort-by-title sort-options-item", {active: sortBy == 'byTitle'}])} onClick={() => {this.changeSortCriteria('byTitle')}}>Empresa <span className="arrows"><i className={classNames(["arrow-top", {active: reverse && sortBy == 'byTitle'}])}>▲</i><i className={classNames(["arrow-bottom", {active: !reverse && sortBy == 'byTitle'}])}>▼</i></span></li>
						<li className={classNames(["sort-by-count sort-options-item", {active: sortBy == 'byCount'}])} onClick={() => {this.changeSortCriteria('byCount')}}>Cant. de Contratos <span className="arrows"><i className={classNames(["arrow-top", {active: reverse && sortBy == 'byCount'}])}>▲</i><i className={classNames(["arrow-bottom", {active: !reverse && sortBy == 'byCount'}])}>▼</i></span></li>
						<li className={classNames(["sort-by-amount sort-options-item", {active: sortBy == 'byAmount'}])} onClick={() => {this.changeSortCriteria('byAmount')}}>Monto Total <span className="arrows"><i className={classNames(["arrow-top", {active: reverse && sortBy == 'byAmount'}])}>▲</i><i className={classNames(["arrow-bottom", {active: !reverse && sortBy == 'byAmount'}])}>▼</i></span></li>
					</ul>
				</div>
				{
					contractsLoaded ?
						<div className="organizations-results">
							<ul className="organizations-list">
								{paginatedContracts.map((contracts) => {
									const organizationTitle = contracts[0].key;
									const opened = this.state.tabsOpened[organizationTitle] === true;
									const organizationName = contracts[0].key;
									const organizationAmount = contracts.reduce((semitotal, amount) => {return semitotal + amount.value.amount}, 0);
									const organizationCount = contracts.length;
									return <OrgainzationItem organizationName={organizationName} organizationAmount={organizationAmount} organizationCount={organizationCount} opened={opened} key={organizationTitle} contracts={contracts} tabClick={this.tabClick}/>
								})}
							</ul>
							<p className={classNames(["contracts-not-found", {active: noResults}])}>No se han encontrado resultados de búsqueda</p>
						</div>
					:
						<div className="organizations-results">
							<ul className="organizations-list">
								<li className="organizations-item empty-item"></li>
								<li className="organizations-item empty-item"></li>
								<li className="organizations-item empty-item"></li>
							</ul>
						</div>
				}
				<div className={classNames(['pagination-bar', {visible: paginationVisible}])}>
					{page === 0 ? null : <button onClick={this.props.paginationGoToPreviousPage} className="pagination-item">Anterior</button>}
					{paginatorPages.length == 1 ? null :
						paginatorPages.map(index => {
							if (index == '...') return (<span key={index + Math.random(100)} className={'ellipsis'}>{index}</span>);
							const activePage = page === index;
							return (<button key={index} className={classNames(['pagination-item', {active: activePage}])} onClick={() => {this.props.paginationGoToPage(index)}}>{index + 1}</button>);
						})
					}
					{pages.length <= page + 1 ? null : <button onClick={this.props.paginationGoToNextPage} className="pagination-item">Siguiente</button>}
				</div>
			</div>
		);
	}
}

module.exports = OrganizationsList;
