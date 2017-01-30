import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {increment} from '../../redux/modules/contracts';
import {PropTypes} from 'react';

@connect(
    state => ({count: state.contracts.count}),
    dispatch => bindActionCreators({increment}, dispatch))
class SearchInput extends React.Component {
	static propTypes = {
		count: PropTypes.number,
		increment: PropTypes.func.isRequired
	}

	handleClick = () => {
		this.props.increment();
	}
	render() {
		const count = this.props.count;
		return (
			<div className="contract-search">
				<span className="search-title" onClick={this.handleClick}>Búsqueda {count}</span>
				<label className="search-box">
					<input type="text" className="search-input" placeholder="Introduce palábra clave a buscar" />
				</label>
			</div>
		);
	}
}

module.exports = SearchInput;