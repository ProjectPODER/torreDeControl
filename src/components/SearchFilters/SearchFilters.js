import React from 'react';
import ReactDOM from 'react-dom';

class SearchFilters extends React.Component {
	render() {
		return (
			<div className="contract-filter">
				<div className="filter-box filter-amount">
					<input type="text" className="filter-input filter-input-from" placeholder="desde $" />
					<input type="text" className="filter-input filter-input-to" placeholder="hasta $" />
				</div>
				<div className="filter-box filter-contract-type">
					<select name="" id="" className="filter-input"></select>
				</div>
				<div className="filter-box filter-procedure-type">
					<select name="" id="" className="filter-input"></select>
				</div>
				<div className="filter-box filter-date">
					<input type="text" className="filter-input filter-input-from" placeholder="desde" />
					<input type="text" className="filter-input filter-input-to" placeholder="hasta" />
				</div>
			</div>
		);
	}
}

module.exports = SearchFilters;