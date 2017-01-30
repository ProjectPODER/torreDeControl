import React from 'react';
import ReactDOM from 'react-dom';
import SearchInput from '../components/SearchInput/SearchInput'
import SearchFilters from '../components/SearchFilters/SearchFilters'

class ContractPage extends React.Component {
	render() {
		return (
			<div>
				<h1 className="content-title">Contatos por empresas</h1>
				<SearchInput />
				<SearchFilters />
			</div>
		);
	}
}

module.exports = ContractPage;