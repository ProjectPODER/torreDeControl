import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { filterChange, paginationGoToPage } from '../../redux/modules/contracts';
import DatePicker from 'react-datepicker';
import moment from 'moment';
require('react-datepicker/dist/react-datepicker.css')

@connect(
    state => ({...state.contracts}),
    dispatch => bindActionCreators({filterChange, paginationGoToPage}, dispatch))
class SearchFilters extends React.Component {
	static propTypes = {
		fromAmount: PropTypes.number,
		toAmount: PropTypes.number,
		contractType: PropTypes.string,
		procedureType: PropTypes.string,
		fromDate: PropTypes.instanceOf(moment),
		toDate: PropTypes.instanceOf(moment),
		filterChange: PropTypes.func.isRequired,
		paginationGoToPage: PropTypes.func
	}

	changeFieldHandler = (evt) => {
		const newValue = evt.target.value;
		const fieldName = evt.target.name;
		this.props.filterChange(fieldName, newValue);
		this.props.paginationGoToPage(0);
	};

	changeFromDateHandler = (date) => {
		this.props.filterChange('fromDate', date);
		this.props.paginationGoToPage(0);
	};

	changeToDateHandler = (date) => {
		this.props.filterChange('toDate', date);
		this.props.paginationGoToPage(0);
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
					<span className="filter-title">Monto total <i className="title-tip">(en pesos mexicanos)</i></span>
					<input name="fromAmount" type="text" className="filter-input half-input filter-input-from" placeholder="desde $" defaultValue={fromAmount} onChange={this.changeFieldHandler} />
					<input name="toAmount" type="text" className="filter-input half-input filter-input-to" placeholder="hasta $" defaultValue={toAmount} onChange={this.changeFieldHandler} />
				</div>
				<div className="filter-box filter-contract-type">
					<span className="filter-title">Tipo de contratación</span>
					<select name="contractType" id="" className="filter-input" defaultValue={contractType} onChange={this.changeFieldHandler}>
						<option value="Servicios">Servicios</option>
						<option value="Servicios Relacionados con la OP">Servicios Relacionados con la OP</option>
						<option value="tipo3">tipo3</option>
					</select>
				</div>
				<div className="filter-box filter-procedure-type">
					<span className="filter-title">Tipo de procedimiento</span>
					<select name="procedureType" id="" className="filter-input" defaultValue={procedureType} onChange={this.changeFieldHandler}>
						<option value="Adjudicación Directa Federal">Adjudicación Directa Federal</option>
						<option value="tipo2">tipo2</option>
						<option value="tipo3">tipo3</option>
					</select>
				</div>
				<div className="filter-box filter-date">
					<span className="filter-title">Rango de fechas</span>
					<DatePicker selected={fromDate} onChange={this.changeFromDateHandler} className="filter-input filter-input-from" placeholder="desde" defaultValue={fromDate} />
					<DatePicker selected={toDate} onChange={this.changeToDateHandler} className="filter-input filter-input-to" placeholder="hasta" defaultValue={toDate} />
				</div>
			</div>
		);
	}
}

module.exports = SearchFilters;