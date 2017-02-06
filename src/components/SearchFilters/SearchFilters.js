import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { filterChange, paginationGoToStart } from '../../redux/modules/contracts';
import DatePicker from 'react-datepicker';
import moment from 'moment';
require('react-datepicker/dist/react-datepicker.css')

@connect(
    state => ({...state.contracts}),
    dispatch => bindActionCreators({filterChange, paginationGoToStart}, dispatch))
class SearchFilters extends React.Component {
	static propTypes = {
		fromAmount: PropTypes.number,
		toAmount: PropTypes.number,
		contractType: PropTypes.string,
		procedureType: PropTypes.string,
		fromDate: PropTypes.instanceOf(moment),
		toDate: PropTypes.instanceOf(moment),
		filterChange: PropTypes.func.isRequired,
		paginationGoToStart: PropTypes.func
	}

	changeFieldHandler = (evt) => {
		const newValue = evt.target.value;
		const fieldName = evt.target.name;
		this.props.filterChange(fieldName, newValue);
		this.props.paginationGoToStart();
	};

	changeFromDateHandler = (date) => {
		this.props.filterChange('fromDate', date);
		this.props.paginationGoToStart();
	};

	changeToDateHandler = (date) => {
		this.props.filterChange('toDate', date);
		this.props.paginationGoToStart();
	};

	render() {
		const fromAmount = this.props.fromAmount;
		const toAmount = this.props.toAmount;
		const contractType = this.props.contractType;
		const procedureType = this.props.procedureType;
		const fromDate = this.props.fromDate;
		const toDate = this.props.toDate;
		const disabledInputs = !this.props.contracts.length;
		return (
			<div className="contract-filter">
				<div className="filters-wrapper">
					<div className="filter-box filter-amount">
						<span className="filter-title">Monto total <i className="title-tip">(en pesos mexicanos)</i></span>
						<input disabled={disabledInputs} name="fromAmount" type="text" className="filter-input half-input filter-input-from" placeholder="desde $" defaultValue={fromAmount} onChange={this.changeFieldHandler} />
						<input disabled={disabledInputs} name="toAmount" type="text" className="filter-input half-input filter-input-to" placeholder="hasta $" defaultValue={toAmount} onChange={this.changeFieldHandler} />
					</div>
					<div className="filter-box filter-contract-type">
						<span className="filter-title">Tipo de contratación <i className="filter-tip"><span className="tooltip-info">La ley obliga a la Unidad Compradora a definir el tipo de contratación, ya que varían las normas en cada caso.</span></i></span>
						<div className="select-wrapper">
							<select disabled={disabledInputs} name="contractType" id="" className="filter-input" defaultValue={contractType} onChange={this.changeFieldHandler}>
								<option value="todos">-Todos-</option>
								<option value="Adquisiciones">Adquisiciones</option>
								<option value="Arrendamientos">Arrendamientos</option>
								<option value="Arrendamientos">Arrendamientos</option>
								<option value="Obra Pública">Obra Pública</option>
								<option value="Servicios">Servicios</option>
								<option value="Servicios Relacionados con la OP">Servicios Relacionados con la OP</option>
							</select>
						</div>
					</div>
					<div className="filter-box filter-procedure-type">
						<span className="filter-title">Tipo de procedimiento <i className="filter-tip"><span className="tooltip-info">EstaLa licitación pública debería es según la ley mexicana el procedimiento adecuado para contratar obra publica. Excepcionalmente también se pueden realizar otro tipo de procedimientos como: adjudicación directa, convenio e invitación a cuando menos tres proveedores.</span></i></span>
						<div className="select-wrapper">
							<select disabled={disabledInputs} name="procedureType" id="" className="filter-input" defaultValue={procedureType} onChange={this.changeFieldHandler}>
								<option value="todos">-Todos-</option>
								<option value="Adjudicación Directa Federal">Adjudicación Directa Federal</option>
								<option value="Invitación a Cuando Menos 3 Personas">Invitación a Cuando Menos 3 Personas</option>
								<option value="Licitación Pública">Licitación Pública</option>
							</select>
						</div>
					</div>
					<div className="filter-box filter-date">
						<span className="filter-title">Rango de fechas <i className="filter-tip"><span className="tooltip-info">Encuentra los contratos activos entre dos fechas.</span></i></span>
						<DatePicker disabled={disabledInputs} selected={fromDate} onChange={this.changeFromDateHandler} className="filter-input filter-input-from" placeholderText="desde" defaultValue={fromDate} />
						<DatePicker disabled={disabledInputs} selected={toDate} onChange={this.changeToDateHandler} className="filter-input filter-input-to" placeholderText="hasta" defaultValue={toDate} />
					</div>
				</div>
				<p className="filter-footnote">Los filtros aplican sobre los contratos que tienen las empresas</p>
			</div>
		);
	}
}

module.exports = SearchFilters;