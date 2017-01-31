import React from 'react';
import ReactDOM from 'react-dom';
import {PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {filterChange} from '../../redux/modules/contracts';

@connect(
    state => ({...state.contracts}),
    dispatch => bindActionCreators({filterChange}, dispatch))
class SearchFilters extends React.Component {
	static propTypes = {
		fromAmount: PropTypes.number,
		toAmount: PropTypes.number,
		contractType: PropTypes.string,
		procedureType: PropTypes.string,
		fromDate: PropTypes.string,
		toDate: PropTypes.string,
		filterChange: PropTypes.func.isRequired
	}

	changeFieldHandler = (evt) => {
		const newValue = evt.target.value;
		const fieldName = evt.target.name;
		this.props.filterChange(fieldName, newValue);
	};

	render() {
		const fromAmount = this.props.fromAmount;
		const toAmount = this.props.toAmount;
		const contractType = this.props.contractType;
		const procedureType = this.props.procedureType;
		const fromDate = this.props.fromDate;
		const toDate = this.props.toDate;
		return (
			<div className="contract-filter">
				<div className="filter-box filter-amount">
					<input name="fromAmount" type="text" className="filter-input filter-input-from" placeholder="desde $" defaultValue={fromAmount} onChange={this.changeFieldHandler} />
					<input name="toAmount" type="text" className="filter-input filter-input-to" placeholder="hasta $" defaultValue={toAmount} onChange={this.changeFieldHandler} />
				</div>
				<div className="filter-box filter-contract-type">
					<select name="contractType" id="" className="filter-input" defaultValue={contractType} onChange={this.changeFieldHandler}>
						<option value="Servicios">Servicios</option>
						<option value="Servicios Relacionados con la OP">Servicios Relacionados con la OP</option>
						<option value="tipo3">tipo3</option>
					</select>
				</div>
				<div className="filter-box filter-procedure-type">
					<select name="procedureType" id="" className="filter-input" defaultValue={procedureType} onChange={this.changeFieldHandler}>
						<option value="Adjudicación Directa Federal">Adjudicación Directa Federal</option>
						<option value="tipo2">tipo2</option>
						<option value="tipo3">tipo3</option>
					</select>
				</div>
				<div className="filter-box filter-date">
					<input name="fromDate" type="text" className="filter-input filter-input-from" placeholder="desde" defaultValue={fromDate} onChange={this.changeFieldHandler} />
					<input name="toDate" type="text" className="filter-input filter-input-to" placeholder="hasta" defaultValue={toDate} onChange={this.changeFieldHandler} />
				</div>
			</div>
		);
	}
}

module.exports = SearchFilters;