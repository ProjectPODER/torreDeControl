import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import OrgainzationItem from '../OrganizationItem/OrganizationItem';

class OrganizationsList extends React.Component {
	constructor() {
		super();
		this.state = {
			tabsOpened: []
		};
	}
	static propTypes = {
		contractsByOrganizations: PropTypes.array.isRequired
	}

	tabClick = (tab) => {
		const newState = !this.state.tabsOpened[tab];
		console.log(newState);
		this.setState({
			tabsOpened: {...this.state.tabsOpened, [tab]: newState  }
		});
	};

	render() {
		const contractsByOrganizations = this.props.contractsByOrganizations;
		return (
			<ul className="organizations-list">
				{contractsByOrganizations.map((contracts) => {
					const organizationTitle = contracts[0].value.proveedor;
					const opened = this.state.tabsOpened[organizationTitle] === true;
					return <OrgainzationItem opened={opened} key={organizationTitle} contracts={contracts} tabClick={this.tabClick}/>	
				})}
			</ul>
		);
	}
}

module.exports = OrganizationsList;