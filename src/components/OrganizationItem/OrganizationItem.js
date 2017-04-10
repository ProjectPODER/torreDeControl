import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import ContractsList from '../ContractsList/ContractsList';
import { setInfoData, showModal } from '../../redux/modules/contracts';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

@connect(
    state => ({sendInfoData: state.contracts.sendInfoData}),
    dispatch => bindActionCreators({setInfoData, showModal}, dispatch))

class OrganizationItem extends React.Component {
	static propTypes = {

	}

	tabClick = (tab) => {
		this.props.tabClick(tab);
	};

	sendInfoHandler = (organization) => {
		this.props.setInfoData({organization})
		this.props.showModal();
	};

	render() {
		const contracts = this.props.contracts;
		const organizationName = this.props.organizationName;
		const organizationAmount = Math.floor(this.props.organizationAmount).toLocaleString();
		const organizationCount = this.props.organizationCount;
		const opened = this.props.opened;
		return (
			<li className="organizations-item">
				<div className="organizations-header" onClick={() => {this.tabClick(organizationName)}}>
					<span className="organizations-title">{organizationName}</span>
					<span className="organizations-count">{organizationCount}</span>
					<span className="organizations-amount">{organizationAmount}</span>
					<input type="button" onClick={() => {this.sendInfoHandler(organizationName)}} className="organizations-send-info" value="Enviar más información"/>
				</div>
				<ContractsList opened={opened} contracts={contracts}/>
			</li>
		);
	}
}

module.exports = OrganizationItem;
