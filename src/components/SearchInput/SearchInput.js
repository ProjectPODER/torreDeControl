import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { keywordChange, paginationGoToPage } from '../../redux/modules/contracts';
import { PropTypes } from 'react';

@connect(
    state => ({keyword: state.contracts.keyword}),
    dispatch => bindActionCreators({keywordChange, paginationGoToPage}, dispatch))
class SearchInput extends React.Component {
	static propTypes = {
		keyword: PropTypes.string,
		keywordChange: PropTypes.func,
		paginationGoToPage: PropTypes.func
	}

	debounce = function(func, wait, immediate) {
		var timeout;
		return function(evt) {
			evt.persist();
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	changeKeywordDebounced = this.debounce(function(evt) {
		const newKeyword = evt.target.value;
		this.props.keywordChange(newKeyword);
		this.props.paginationGoToPage(0);
	}, 250);

	handleChange = (evt) => {
		this.changeKeywordDebounced(evt);
	}

	render() {
		const keyword = this.props.keyword;
		return (
			<div className="contract-search">
				<span className="search-title">Búsqueda</span>
				<label className="search-box">
					<input type="text" className="search-input" placeholder="Introduce palábra clave a buscar" onChange={this.handleChange} defaultValue={keyword} />
				</label>
			</div>
		);
	}
}

module.exports = SearchInput;