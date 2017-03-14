import $ from 'jquery';
window.jQuery = $;
import * as d3 from "d3";
import async from 'async';
import Filter from './filters.js';
import MathSet from './sets.js';
import Fullpage from 'fullpage.js';
require('./css/main.scss');

let nodes = [];
let links = [];

const fs = -350;
const ls = 0.6;
const ld = 70;

const mn = 0;
const mx = 1000;
const cr = 20;

let node;
let link;
let label;
let icon;
let offset = 0;
let graph;
let zoomLevel;
let resG;
let svg;
let zoom;
const AppData = {
	persons: [],
	organizations: [],
	contracts: [],
	investigations: [],
	actualSlide: 1
};
let tooltipHTML;
const globalTimers = [];
const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.oCancelAnimationFrame;
module.exports = () => {
	window.jQuery = $;
	getData(data => {
		AppData.organizations = data.organizations,
		AppData.contracts = data.contracts;
		AppData.investigations = data.investigations;
		AppData.texts = {};
		const contractsAmount = getContractsAmount(AppData.contracts);
		const contractsByTypes = getContractsByTypes(AppData.contracts);
		const organizations = AppData.organizations;
		const investigations = AppData.investigations;
		const relatedFiguresStack = {};
		const slidesObjects = [	null,
			{nodes: [], links: []},
			{nodes: [], links: []},
			{nodes: [], links: []},
			{nodes: [], links: []},
			{nodes: [], links: []},
			{nodes: [], links: []}
		];		

		var contractsByOrganizations = []
		AppData.contracts.forEach(function(contract){
			contract.suppliers.forEach(function(supplier){
				if (contractsByOrganizations[supplier.simple] === undefined) contractsByOrganizations[supplier.simple] = [];
				contractsByOrganizations[supplier.simple].push({
		      key: supplier.simple,
		      value: contract
		    })
			})
		})

		const organizationsByNames = Object.keys(contractsByOrganizations).map(key => contractsByOrganizations[key]);
		window.algo = contractsByOrganizations
		AppData.texts.contracts_amount_text = numberWithCommas((Math.round(contractsAmount/1000000)).toLocaleString());
		AppData.texts.contracts_type_text = Object.keys(contractsByTypes).length;
		AppData.texts.contracts_total_text = objectToArray(contractsByTypes).reduce(function(total, actual) {return total + Object.keys(actual.contracts).length}, 0);
		AppData.texts.direct_adjudication_text = AppData.contracts.filter(contract => {return contract.procedure_type == "Adjudicación Directa Federal"}).length;
		AppData.texts.direct_adjudication_percentage_text = (Math.ceil(AppData.contracts.filter(contract => {return contract.procedure_type == "Adjudicación Directa Federal"}).reduce((before, actual) => {return before + actual.amount }, 0)) / contractsAmount * 100 ).toFixed(2);
		AppData.texts.suppliers_count_text = Object.keys(organizationsByNames).length;
		AppData.texts.big_amount_contracts_text = (AppData.contracts.filter(contract => {return contract.amount >= 1000000000}).length);
		AppData.texts.big_amount_percentage_text = (Math.ceil(AppData.contracts.filter(contract => {return contract.amount >= 1000000000}).reduce((before, actual) => {return before + actual.amount }, 0)) / contractsAmount * 100 ).toFixed(2);
		AppData.texts.big_amount_winners_text = Math.ceil(AppData.contracts.filter(contract => {return contract.amount >= 1000000000}).length );

		$('#contracts_amount').text(AppData.texts.contracts_amount_text);
		$('#contracts_type').text(AppData.texts.contracts_type_text);
		$('#contracts_total').text(AppData.texts.contracts_total_text);
		$('#direct_adjudication').text(AppData.texts.direct_adjudication_text);
		$('#direct_adjudication_percentage').text(AppData.texts.direct_adjudication_percentage_text);
		$('#suppliers_count').text(AppData.texts.suppliers_count_text);
		$('#big_amount_contracts').text(AppData.texts.big_amount_contracts_text);
		$('#big_amount_percentage').text(AppData.texts.big_amount_percentage_text);
		$('#big_amount_winners').text(AppData.texts.big_amount_winners_text);

		const node = { id: 'contracts', name: 'contracts', activeSize: contractsAmount / 1000000000, inactiveSize: 35, topParentNode: false, nodeForce: 10, type: 'all', group: 1, color: '#1ee6d3', linksCount: 0, label: "NAICM", icon: null };
		slidesObjects[1].nodes.push(node);
		nodes.push(node);
		for (let i in contractsByTypes) {
			const contractByType = contractsByTypes[i];
			const node = { id: contractByType.name, name: contractByType.name, activeSize: Math.pow(contractByType.amount,1/5) / 10, inactiveSize: 15, topParentNode: false, nodeForce: 10, type: 'contract_type', group: 2, color: '#3abdc3', linksCount: 0, contractsCount: Object.keys(contractByType.contracts).length, contractsAmount: contractByType.amount, icon: null, label: contractByType.name };
			const link = { source: contractByType.name, target: 'contracts', type: 'contract_type', linkStrength: 2, linkDistance: 1, color: '#706F74', dashed: false, opacity: 0.6 };
			slidesObjects[2].nodes.push(node);
			slidesObjects[2].links.push(link);
			nodes.push(node);
			links.push(link);
			for (let j in contractByType.contracts) {
				const contract = contractByType.contracts[j];
				const node = { id: contract._id, name: contract.title, amount: contract.amount, activeSize: Math.log(contract.amount) / 2, inactiveSize: 30, topParentNode: false, nodeForce: 0.6, type: 'contract', group: 3, color: '#438a9c', linksCount: 0, suppliersList: contract.suppliers.map(supplier => supplier.simple), icon: null };
				const linkToCenter = { source: contract._id, target: 'contracts', type: 'contract', hidden: true, linkStrength: 3, linkDistance: 2.5, color: '#706F74', dashed: false, opacity: 0 };
				const linkToContractType = { source: contract._id, target: contractByType.name, type: 'contract', linkStrength: 3, linkDistance: 2.5, color: '#706F74', dashed: false, opacity: 0.6 };
				slidesObjects[3].nodes.push(node);
				slidesObjects[3].links.push(linkToCenter);
				slidesObjects[3].links.push(linkToContractType);
				nodes.push(node);
				links.push(linkToCenter);
				links.push(linkToContractType);
			}
		}

		for (let k in organizations) {
			const organization = organizations[k];
			const node = { id: organization._id, name: organization.name, activeSize: organization.contracts_count * 2 + 10, inactiveSize: 10, nodeForce: 10, type: 'organization', group: 4, color: '#3c5a6f', linksCount: 0, contractsCount: organization.contracts_count, contractsAmount: organization.contracts_amount, icon: null  };
			for (let j in AppData.contracts) {
				const contract = AppData.contracts[j];

				if (contract.suppliers && contract.suppliers.filter(supplier => {return supplier.simple == organization.simple}).length > 0) {
					const link = { source: organization._id, target: contract._id, type: 'organization', linkStrength: 4, linkDistance: 1, color: '#706F74', dashed: true, opacity: 1, name: organization.name };
					slidesObjects[4].links.push(link);
					links.push(link);
					node.linksCount++;
				}
			}

			const linkToCenter = { source: organization._id, target: 'contracts', type: 'organization', hidden: true, linkStrength: 4, linkDistance: 6, color: '#706F74', dashed: false, opacity: 0  };
			slidesObjects[4].links.push(linkToCenter);
			links.push(linkToCenter);
			slidesObjects[4].nodes.push(node);
			nodes.push(node);
		}

		let allFiguresCount = 0;

		function linkParents(linkOrganization, organization) {
			const parents = organization.parents;
			const shareholders = organization.shareholders;
			const boards = organization.board;

			if (parents.length > 0) {
				for (let p in parents) {
					const parent = parents[p];
					linkParents(organization, parent)
				}
			}

			if (organizationNotExists(organization._id)) {
				allFiguresCount++;
				const node = { id: organization._id, name: organization.name, activeSize: organization.contracts_count * 2 + 10, inactiveSize: 10, nodeForce: 10, type: 'related', group: 4, color: '#3c5a6f', linksCount: 0, relationType: 'organization', icon: null, relationType2: 'Organization', contractsCount: organization.contracts_count };
				const linkToCenter = { source: organization._id, target: 'contracts', type: 'related', hidden: true, linkStrength: 3, linkDistance: 9, color: '#706F74', dashed: false, opacity: 0  };
				slidesObjects[5].links.push(linkToCenter);
				slidesObjects[5].nodes.push(node);
				links.push(linkToCenter);
				nodes.push(node);
			}

			if (organizationNotExists(linkOrganization._id)) {
				allFiguresCount++;
				const node = { id: linkOrganization._id, name: linkOrganization.name, activeSize: linkOrganization.contracts_count * 2 + 10, inactiveSize: 10, nodeForce: 10, type: 'related', group: 4, color: '#3c5a6f', linksCount: 0, relationType: 'organization', icon: null, relationType2: 'Organization', contractsCount: linkOrganization.contracts_count };
				const linkToCenter = { source: linkOrganization._id, target: 'contracts', type: 'related', hidden: true, linkStrength: 3, linkDistance: 9, color: '#706F74', dashed: false, opacity: 0  };
				slidesObjects[5].links.push(linkToCenter);
				slidesObjects[5].nodes.push(node);
				nodes.push(node);
				links.push(linkToCenter);
			}

			const link = { source: organization._id, target: linkOrganization._id, type: 'related', linkStrength: 3, linkDistance: 5, color: '#706F74', dashed: true, opacity: 1 };
			slidesObjects[5].links.push(link);
			links.push(link);

			if (shareholders.length > 0) {
				for (let s in shareholders) {
					allFiguresCount++;
					const shareholder = shareholders[s];
					const shareholderId = shareholder._id;
					const shareholderName = shareholder.name;
					const shareholderSimple = shareholder.simple;
					const shareholderType = shareholder.type;
					const shareholderContractsCount = shareholder.contracts_count || 0;
					const typeColor = shareholder.type == "person" ? "#FC8917" : "#363E4E";
					if (relatedFiguresStack[shareholderId] == undefined) {
							relatedFiguresStack[shareholderId] = {count: 0, relationId: []};
							relatedFiguresStack[shareholderId].relationId.push(shareholderId + organization._id);
					} else {
						if (relatedFiguresStack[shareholderId].relationId.indexOf(shareholderId + organization._id) == -1) {
							relatedFiguresStack[shareholderId].count++;
							relatedFiguresStack[shareholderId].relationId.push(shareholderId + organization._id);
						}
					}

					switch (relatedFiguresStack[shareholderId].count) {
						case 0: {
							relatedFiguresStack[shareholderId].node = { id: shareholderId, name: shareholderName, simple: shareholderSimple, activeSize: shareholderContractsCount * 2 + 10, inactiveSize: 10, topParentNode: false, nodeForce: 10, type: 'related', group: 4, color: typeColor, linksCount: 0, relationType: shareholderType, icon: null, relationType2: 'Shareholder' };
							// relatedFiguresStack[shareholderId].linkToCenter = { source: shareholderId, target: 'contracts', type: 'related', hidden: true, linkStrength: 3, linkDistance: 12, color: '#706F74', dashed: false, opacity: 0  };
							relatedFiguresStack[shareholderId].link = { source: shareholderId, target: organization._id, type: 'related', linkStrength: 3, linkDistance: 5, topParentNode: false, color: '#706F74', dashed: true, opacity: 1 };
							
							break;
						}
						case 1: {
								const node = relatedFiguresStack[shareholderId].node;
								slidesObjects[5].nodes.push(node);
								nodes.push(node);
								// const linkToCenter = relatedFiguresStack[shareholderId].linkToCenter;
								// slidesObjects[5].links.push(linkToCenter);
								// links.push(linkToCenter);
								const link = relatedFiguresStack[shareholderId].link;
								slidesObjects[5].links.push(link);
								links.push(link);
								/* this continues to default, no brake statement */
						}
						default: {
							const link = { source: shareholderId, target: organization._id, type: 'related', linkStrength: 3, linkDistance: 5, topParentNode: false, color: '#706F74', dashed: true, opacity: 1 };
							slidesObjects[5].links.push(link);
							links.push(link);
						}
					}
				}
			}

			if (boards.length > 0) {
				for (let s in boards) {
					allFiguresCount++;
					const board = boards[s];
					const boardId = board._id;
					const boardName = board.name;
					const boardSimple = board.simple;
					const boardContractsCount = board.contracts_count || 0;
					const boardType = board.name;
					if (relatedFiguresStack[boardId] == undefined) {
							relatedFiguresStack[boardId] = {count: 0, relationId: []};
							relatedFiguresStack[boardId].relationId.push(boardId + organization._id);
					} else {
						if (relatedFiguresStack[boardId].relationId.indexOf(boardId + organization._id) == -1) {
							relatedFiguresStack[boardId].count++;
							relatedFiguresStack[boardId].relationId.push(boardId + organization._id);
						}
					}

					switch (relatedFiguresStack[boardId].count) {
						case 0: {
							relatedFiguresStack[boardId].node = { id: boardId, name: boardName, simple: boardSimple, activeSize: boardContractsCount.contracts_count * 2 + 10, inactiveSize: 10, topParentNode: false, nodeForce: 10, type: 'related', group: 4, color: '#EB639A', linksCount: 0, relationType: boardType, icon: null, relationType2: 'Board' };
							// relatedFiguresStack[boardId].linkToCenter = { source: boardId, target: 'contracts', type: 'related', hidden: true, linkStrength: 3, linkDistance: 12, color: '#706F74', dashed: false, opacity: 0  };
							relatedFiguresStack[boardId].link = { source: boardId, target: organization._id, type: 'related', linkStrength: 3, linkDistance: 5, topParentNode: false, color: '#706F74', dashed: true, opacity: 1 };
							
							break;
						}
						case 1: {
								const node = relatedFiguresStack[boardId].node;
								slidesObjects[5].nodes.push(node);
								nodes.push(node);
								// const linkToCenter = relatedFiguresStack[boardId].linkToCenter;
								// slidesObjects[5].links.push(linkToCenter);
								// links.push(linkToCenter);
								const link = relatedFiguresStack[boardId].link;
								slidesObjects[5].links.push(link);
								links.push(link);
								/* this continues to default, no brake statement */
						}
						default: {
							const link = { source: boardId, target: organization._id, type: 'related', linkStrength: 3, linkDistance: 5, topParentNode: false, color: '#706F74', dashed: true, opacity: 1 };
							slidesObjects[5].links.push(link);
							links.push(link);
						}
					}
				}
			}
		
		}

		for (let k in organizations) {
			const organization = organizations[k];
			for (let p in organization.parents) {
				const parent = organization.parents[p];
				const linkOrganization = organization;
				linkParents(linkOrganization, parent);
			}
		}

		$('#slide_5_count').text(allFiguresCount);

		/* Investigations */
		for (let i in investigations) {
			const investigation = investigations[i];
			const investigationId = investigation.title.toLowerCase().replace(/\s/g, "-") + "-" + investigation.date;
			const suspectedOrganizations = organizations.filter(organization => investigation.suppliers.indexOf(organization.simple) > -1);
			const node = { id: investigationId, name: investigation.title, activeSize: 15, inactiveSize: 15, nodeForce: 10, type: 'investigation', group: 6, color: '#FFCF40', linksCount: 0, url: investigation.link, icon: "src/images/investigation_icon.svg"};
			nodes.push(node);
			slidesObjects[6].nodes.push(node);

			if (investigation.suppliers[0] == "Grupo Aeroportuario De La Ciudad de México, S.A. de C.V.") {
				const link = { source: investigationId, target: 'contracts', type: 'investigation', linkStrength: 4, linkDistance: 13, color: '#706F74', dashed: false, opacity: 0.6 };
				slidesObjects[6].links.push(link);
				links.push(link);
			} else {
				suspectedOrganizations.forEach(suspectedOrganization => {
					const link = { source: investigationId, target: suspectedOrganization._id, type: 'investigation', linkStrength: 2, linkDistance: 1, color: '#706F74', dashed: false, opacity: 0.6 };
					slidesObjects[6].links.push(link);
					links.push(link);
				});
			}

			const shareholders = Object.keys(relatedFiguresStack)
				.filter(key => relatedFiguresStack[key].count > 1) /* Get only elements with more than one relation */
				.map(key => relatedFiguresStack[key]) /* Return objects instead of only ids */
				.filter(shareholder => investigation.suppliers.indexOf(shareholder.node.simple) > -1); /* Get only elements mentioned whithin the investigation */

			shareholders.forEach(shareholder => {
				const shareholderNode = shareholder.node;
				const link = { source: investigationId, target: shareholderNode.id, type: 'investigation', linkStrength: 2, linkDistance: 1, color: '#706F74', dashed: false, opacity: 0.6 };
				slidesObjects[6].links.push(link);
				links.push(link);
			});

			const boards = Object.keys(relatedFiguresStack)
				.filter(key => relatedFiguresStack[key].count > 1) /* Get only elements with more than one relation */
				.map(key => relatedFiguresStack[key]) /* Return objects instead of only ids */
				.filter(board => investigation.suppliers.indexOf(board.node.simple) > -1); /* Get only elements mentioned whithin the investigation */

			boards.forEach(board => {
				const boardNode = board.node;
				const link = { source: investigationId, target: boardNode.id, type: 'investigation', linkStrength: 2, linkDistance: 1, color: '#706F74', dashed: false, opacity: 0.6 };
				slidesObjects[6].links.push(link);
				links.push(link);
			});
		}

		function organizationNotExists(id) {
			const organizationWithId = organizations.filter(organization => {return organization._id == id});
			return organizationWithId.length == 0;
		}

		nodes = [...slidesObjects[1].nodes, ...slidesObjects[2].nodes, ...slidesObjects[3].nodes, ...slidesObjects[4].nodes, ...slidesObjects[5].nodes, ...slidesObjects[6].nodes];
		links = [...slidesObjects[1].links, ...slidesObjects[2].links, ...slidesObjects[3].links, ...slidesObjects[4].links, ...slidesObjects[5].links, ...slidesObjects[6].links];
		setupD3();
		window.graph = {nodes, links};
	});


};

function getData(cb) {
	async.waterfall([
		getContracts,
		getOrganizations,
		getInvestigations
	], (err, results) => {
		cb({
			contracts: results.contracts,
			organizations: results.organizations,
			investigations: results.investigations
		});
	})
}

function getContracts(cb) {
	async.parallel(
		[
			(parallelCB) => {
				$.get('http://ec2-54-83-139-8.compute-1.amazonaws.com/api/v1/contracts')
				.done(response => {parallelCB(null, response.data);})
				.fail(response => {parallelCB(null, []);});
			},
		],
		(err, results) => {
			cb(null, {contracts: [...results[0]]})
		}
	);
}

function getOrganizations(params, cb) {
	let suppliers = [];
	for(let c = 0; c < params.contracts.length; c++) {
		suppliers = [...suppliers, ...(params.contracts[c].suppliers || [])]
	}

	let uniqueSuppliers = {};

	for(let s = 0; s < suppliers.length; s++) {
		let supplierName = suppliers[s].simple;
		uniqueSuppliers[supplierName] != undefined ? uniqueSuppliers[supplierName] == uniqueSuppliers[supplierName] + 1 : uniqueSuppliers[supplierName] = 1;
	}

	const organizationFilter = new Filter({property: 'suppliers'});
	const contractorsNamesSet = new MathSet(params.contracts);
	const organizationsByNames = Object.keys(uniqueSuppliers);

	$.post("http://ec2-54-83-139-8.compute-1.amazonaws.com/api/v1/organizations", {name: organizationsByNames})
	.done(response => {cb(null, {...params, organizations: response.data});})
	.fail(response => {cb(null, {...params, organizations: []});});
}

function getInvestigations(params, cb) {
	$.get('data/investigation.json')
	.done(response => {
		cb(null, {...params, investigations: response});
	})
}

function setupD3() {
	zoom = d3.zoom()
    				.scaleExtent([0.1, 1])
    				.on("zoom", zoomed);
	svg = d3.select("svg")
				.call(zoom);
	const width = $('svg').width();
	const height = $('svg').height();
	const color = d3.scaleOrdinal(d3.schemeCategory20);

	function zoomed() {
		const stackcopado = `translate(${d3.event.transform.x},${d3.event.transform.y}) scale(${d3.event.transform.k})`;
		resG.attr('transform', stackcopado);
	}

	/* ----- Force Setup ----- */
	/* Charges */
	const forceManyBody = d3.forceManyBody();
		forceManyBody.strength(d => fs * d.nodeForce);
	/* Links */
	const forceLink = d3.forceLink();
		forceLink.id(d => d.id);
		forceLink.distance(d => ld * d.linkDistance * d.topParentNode ? 10 : 1);
		forceLink.strength(d => ls * d.linkStrength);
		forceLink.iterations(2);
	/* Center force */
	const forceCenter = d3.forceCenter(width / 2 - offset, height / 2 - offset);
	/* Collides */
	const forceCollide = d3.forceCollide();
	forceCollide.iterations(1);

	/* Simulation Setup */
	const simulation = d3.forceSimulation()
		.force("charge", forceManyBody)
		.force("link", forceLink)
		.force("center", forceCenter)
		.force("collide", forceCollide)
	    .on("tick", ticked);

	let g = svg.append("g").attr("class", 'resizable-g');
	link = g.append("g").selectAll('link');
	node = g.append("g").selectAll('node');
	label = g.append("g").selectAll('.labelText');
	icon = g.append("g").selectAll('.nodeIcon');

	$(document).on("keydown", function(evt) {
		if (evt.keyCode == 27) {
			draw(graph);
			for (let l in graph.links) {
	        	const link = graph.links[l];
	        	link.selected = false;
	        	link.opacity = link.hidden ? 0 : 0.6;
	        }

	        for (let l in graph.nodes) {
	        	const node = graph.nodes[l];
	        	node.opacity = 1;
	        	node.selected = false;
	        }
		}
	})

	function ticked() {
		node
		    .attr("cx", d => d.x + offset)
		    .attr("cy", d => d.y + offset)
		    .attr("opacity", d => d.opacity)
		    .attr("class", d => "nodes " + d.type + " " + (d.visibleNode ? "visible-node" : "invisible-node"))

		link
		    .attr("x1", d => d.source.x + offset)
		    .attr("y1", d => d.source.y + offset)
		    .attr("x2", d => d.target.x + offset)
		    .attr("y2", d => d.target.y + offset)
		    .attr("opacity", d => d.opacity);

		label
		    .attr("x", function(d) {	
		    	return d.x - this.getBBox().width / 2;
		    })
		    .attr("y", function(d) {
		    	const fontSize = parseInt(window.getComputedStyle(this, null).getPropertyValue("font-size").split('px')[0]);
		    	return d.y - (this.getBBox().height) / 2 + fontSize;
		    })
		    .attr("opacity", d => d.opacity);
		
		icon
		    .attr("x", d => d.x + offset)
		    .attr("y", d => d.y + offset)
		    .attr("opacity", d => d.opacity)
		    .attr("class", d => "nodes " + d.type + " " + (d.visibleNode ? "visible-node" : "invisible-node"));
	}

	window.addEventListener("resize", function() {
		const newTranslateX = $('svg').width() / 2 * (1 - zoomLevel);
		const newTranslateY = $('svg').height() / 2 * (1 - zoomLevel);
		if (resG) svg.call(zoom.transform, d3.zoomIdentity.translate(newTranslateX, newTranslateY).scale(zoomLevel));
		draw(graph);
	});

	const slide_1 = new Filter({property: 'type', operator: 'eq', expected: 'all'});
	const slide_2 = new Filter({property: 'type', operator: 'eq', expected: 'contract_type'});
	const slide_3 = new Filter({property: 'type', operator: 'eq', expected: 'contract'});
	const slide_4 = new Filter({property: 'type', operator: 'eq', expected: 'organization'});
	const slide_5 = new Filter({property: 'type', operator: 'eq', expected: 'related'});
	const slide_6 = new Filter({property: 'type', operator: 'eq', expected: 'investigation'});

	function goToSlide(index) {
		switch (index) {
			case 0:
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1).toObject()), 'all', 3),
					links: objectToArray((new MathSet(links)).filter(slide_1).toObject())
				};
				draw(graph);
				d3.selectAll('.nodes.all').transition().attr('r', d => d.activeSize);
				break;
			case 1:
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2).toObject()), 'contract_type', 3),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2).toObject())
				};

				draw(graph);
				d3.selectAll('.nodes.contract_type').transition().attr('r', d => d.activeSize);
				d3.selectAll('.all').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.links.contract_type').transition().delay(100).attr('opacity', d => d.opacity);
				break;
			case 2:
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2, slide_3).toObject()), 'contract', 3),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2, slide_3).toObject())
				};
				draw(graph);
				d3.selectAll('.nodes.contract').transition().attr('r', d => d.activeSize);
				d3.selectAll('.all').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.contract_type').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.links.contract').transition().delay(100).attr('opacity', d => d.opacity);
				break;
			case 3:
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2, slide_3, slide_4).toObject()), 'organization', 4),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2, slide_3, slide_4).toObject())
				};
				draw(graph);
				d3.selectAll('.nodes.organization').transition().attr('r', d => d.activeSize);
				d3.selectAll('.all').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.contract_type').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.organization_type').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.links.organization').transition().delay(100).attr('opacity', d => d.opacity);
				break;
			case 4:
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2, slide_3, slide_4, slide_5).toObject()), 'related', 4),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2, slide_3, slide_4, slide_5).toObject())
				};
				draw(graph);
				d3.selectAll('.nodes.organization').transition().attr('r', d => d.activeSize);
				d3.selectAll('.all').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.contract_type').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.organization_type').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.links.organization').transition().delay(100).attr('opacity', d => d.opacity);
				d3.selectAll('.links.related').transition().delay(100).attr('opacity', d => d.opacity);
				break;
			case 5:
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2, slide_3, slide_4, slide_5, slide_6).toObject()), 'investigation', 4),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2, slide_3, slide_4, slide_5, slide_6).toObject())
				};
				draw(graph);
				d3.selectAll('.nodes.organization').transition().attr('r', d => d.activeSize);
				d3.selectAll('.all').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.contract_type').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.organization_type').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.links.organization').transition().delay(100).attr('opacity', d => d.opacity);
				d3.selectAll('.links.related').transition().delay(100).attr('opacity', d => d.opacity);
				break;
		}
	}

	$('#fullpage').fullpage({
		anchors: ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6'],
	    menu: '#slidesMenu',
		navigation: true,
		paddingTop: ($('.site-top-ribbon').height() + 60) + 'px',
    	scrollingSpeed: 300,
    	onLeave: (index, nextIndex) => {
	    	$(`.info-container`).removeClass('slide-active slide-leaving');
				$(`.slide-${index}`).removeClass('slide-active').addClass('slide-leaving');
				AppData.actualSlide = nextIndex - 1;
				let newZoom;
				switch (nextIndex) {
					case 1:
						newZoom = 1;
						updateVisualization();
						$('.labelText.all').addClass('active');
						$('.labelText.contract_type').removeClass('active');
						$('.visualization-down-arrow').removeClass('hidden');
						break;
					case 2:
						newZoom = 0.9;
						updateVisualization();
						$('.labelText.contract_type').addClass('active');
						$('.labelText.all').removeClass('active');
						$('.visualization-down-arrow').removeClass('hidden');
						break;
					case 3:
						newZoom = 0.5;
						updateVisualization();
						$('.labelText').removeClass('active');
						$('.visualization-down-arrow').removeClass('hidden');
						break;
					case 4:
						newZoom = 0.4;
						updateVisualization();
						$('.labelText').removeClass('active');
						$('.visualization-down-arrow').removeClass('hidden');
						break;
					case 5:
						newZoom = 0.2;
						updateVisualization();
						$('.labelText').removeClass('active');
						$('.visualization-down-arrow').removeClass('hidden');
						break;
					case 6:
						newZoom = 0.2;
						updateVisualization();
						$('.labelText').removeClass('active');
						$('.visualization-down-arrow').addClass('hidden');
						break;
				}

				function updateVisualization() {
					zoomLevel = newZoom;
					const newTranslateX = $('svg').width() / 2 * (1 - zoomLevel);
					const newTranslateY = $('svg').height() / 2 * (1 - zoomLevel);
					if (resG) svg.call(zoom.transform, d3.zoomIdentity.translate(newTranslateX, newTranslateY).scale(zoomLevel));
					goToSlide(nextIndex - 1);
				}
	    },
		afterLoad: function(anchorLink, index){
			$(`.slide-${index}`).addClass('slide-active');
		}

	});

	$.fn.fullpage.moveTo('slide-2');
	$.fn.fullpage.moveTo('slide-1');
	$('.fullpage').animate({'opacity': 1});
	$('.visualization-down-arrow').click(() => {
		$.fn.fullpage.moveSectionDown();
	});

	graph = {
		nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1).toObject()), 'all', 3),
		links: objectToArray((new MathSet(links)).filter(slide_1).toObject())
	};
	draw(graph);
	d3.selectAll('.nodes.all').transition().attr('r', d => d.activeSize);
	tooltipHTML = $('.tooltip');
	function draw(graph) {
		const container = $('svg');
		const svg = $('svg');
		resG = $('.resizable-g');
		const width = container.width();
		const height = container.height();
		let scaleMin;

		const tooltip = d3.select(".tooltip")
				.attr("class", "tooltip")
				.style("opacity", 0)
				.on("mouseover", function() {tooltip.transition().duration(300).style("opacity", .98)})
		        .on("mouseout", function() {tooltip.transition().duration(100).style("opacity", 0).style("pointer-events", "none")});
		const tooltipLink = d3.select(".tooltip a")
				.on("mouseover", function() {tooltip.transition().duration(300).style("opacity", .98)})
		        .on("mouseout", function() {tooltip.transition().duration(100).style("opacity", 0).style("pointer-events", "none")})
		        .on("click", function(evt) {evt.preventDefault()});

		const node_drag = d3.drag()
	        .on("start", dragstart)
	        .on("drag", dragmove)
	        .on("end", dragend);

	    function dragstart(d, i) {
	        if (!d3.event.active) simulation.alphaTarget(0.2).restart();
			d.fx = d.x;
			d.fy = d.y;
	    }

	    function dragmove(d, i) {
	        d.fx = d3.event.x;
			d.fy = d3.event.y;
	    }

	    function dragend(d, i) {
	        if (!d3.event.active) simulation.alphaTarget(0.0001);
			d.fx = null;
			d.fy = null;
	    }

		node = node.data(graph.nodes.filter(d => d.icon == null));
		node.exit().remove();
		node = node.enter().append("circle")
			.attr("r", d => d.activeSize)
			.attr("fill", d => d.color)
			.attr("class", d => "nodes " + d.type + " " + (d.visibleNode ? "visible-node" : "invisible-node"))
			.merge(node);

		attachEventsToNode(node);

		node.each(d => {
			if (d.type === 'all') {
				d.fx = width / 2 - offset;
				d.fy = height / 2 - offset;
			} else {
				d.fx = null;
				d.fy = null;
			}});

		node.call(node_drag);

		link = link.data(graph.links);
		link.exit().remove();
		link = link.enter().append("line")
			.attr("class", d => "links " + d.type)
			.attr("stroke-linecap", d => d.dashed ? "round" : "")
			.attr("stroke-dasharray", d => d.dashed ? "1, 10" : "")
			.attr("stroke-width", d => d.dashed ? "3" : "1")
			.style("stroke", d=> d.color)
			.attr("opacity", 0)
			.merge(link);
		
		label = label.data(graph.nodes);
		label.exit().remove();
		label = label.enter().append("text")
			.text(d => d.label)
			.attr("class", d => "labelText " + d.type)
			.merge(label);

		icon = icon.data(graph.nodes.filter(d => d.icon));
		icon.exit().remove();
		icon = icon.enter().append("image")
			.attr("xlink:href", function(d) { return d.icon; })
			.attr("width", "80px")
			.attr("height", "80px")
			.attr("transform", "translate(-40, -40)")
			.attr("class", d => "nodes " + d.type + " " + (d.visibleNode ? "visible-node" : "invisible-node"))
			.merge(icon);

		attachEventsToNode(icon);

		icon.each(d => {
			if (d.type === 'all') {
				d.fx = width / 2 - offset;
				d.fy = height / 2 - offset;
			} else {
				d.fx = null;
				d.fy = null;
			}});

		icon.call(node_drag);

		forceManyBody.strength(d => fs * d.nodeForce);
		forceLink.distance(d => ld * d.linkDistance);
		forceLink.strength(d => ls * d.linkStrength * d.topParentNode ? 1 : 2);
		forceCollide.radius(d => d.inactiveSize / 2);


		simulation.nodes(graph.nodes);
		simulation.force("link").links(graph.links);
		simulation.force("center", d3.forceCenter(width / 2 - offset, height / 2 - offset))
		simulation.alpha(0.2).restart();
		link.each(d => {
			d.target.visibleNode = true;
			d.source.visibleNode = true;
		});

		function attachEventsToNode(node) {
			node
			.on("mouseover", function(d) {
				const tooltipWidth = tooltipHTML.width() + 20;
				const tooltipHeight = tooltipHTML.height() + 20;
	            tooltip
	            	.transition()
	                .duration(300)
	                .style("opacity", .98)
	                .style("pointer-events", "initial");
	            tooltip
	            	.html( () => {
	            		switch (d.type) {
	            			case "all": {
	            				const contractsTotalText = AppData.texts.contracts_total_text;
	            				const contractsAmountText = AppData.texts.contracts_amount_text;
	            				return `
	            				<p class="title">El Nuevo Aeropuerto Internacional de la Ciudad de México</p>
								<p>Número de contratos: <span>${contractsTotalText}</span></p>
								<p>Importe contratado: <span>$${contractsAmountText}</span></p>
								`;
	            				break;
	            			}
	            			case "contract_type": {
	            				const contractsCountText = d.contractsCount;
	            				const contractsAmountText = numberWithCommas((+d.contractsAmount).toFixed(0));
	            				return `
	            				<p class="title">${d.name}</p>
								<p>Número de contratos: <span>${contractsCountText}</span></p>
								<p>Importe contratado: <span>$${contractsAmountText}</span></p>
								`;
	            				break;
	            			}
	            			case "contract": {
	            				const suppliersListHTML = d.suppliersList.map(supplier => `<li>${supplier}</li>`).join('')
	            				const amountText = numberWithCommas((+d.amount).toFixed(0));
	            				return `
	            				<p class="title">${d.name}</p>
	            				<span>Proveedores:</span>
								<ul> ${suppliersListHTML}</ul>
								<p>Importe contratado: <span>$${amountText}</span></p>
								`;
	            				break;
	            			}
	            			case "organization": {
	            				const nameText = d.name;
	            				const contractsCountText = d.contractsCount;
	            				const contractsAmount = numberWithCommas((+d.contractsAmount).toFixed(0));
	            				return `
	            				<p class="title">${nameText}</p>
								<p>Número de contratos: <span>${contractsCountText}</span></p>
								<p>Importe contratado: <span>$${contractsAmount}</span></p>
								`;
	            				break;
	            			}
	            			case "related": {
	            				const nameText = d.name;
	            				const contractsCount = d.contractsCount;
	            				const typeText = d.relationType == "person" ? "persons" : "orgs";
	            				return `
	            				<p class="title">${nameText}</p>
	            				<p>Contrtos: ${contractsCount}</p>
	            				<p>Más información en QuiénEsQuién.Wiki:</p>
	            				<p><a rel="noreferrer noopener" target="_blank" href="https://quienesquien.wiki/${typeText}/${nameText}">https://quienesquien.wiki/${typeText}/${nameText}</a></p>
								`;
	            				break;
	            			}
	            			case "investigation": {
	            				const nameText = d.name;
	            				const urlText = d.url;
	            				return `
	            				<p class="title">${nameText}</p>
	            				<p>Más información en QuiénEsQuién.Wiki:</p>
	            				<p><a rel="noreferrer noopener" target="_blank" href="${urlText}">${urlText}</a></p>
								`;
	            				break;
	            			}
	            			default: {
	            				return "sin texto"
	            				break;
	            			}
	            		}
	            	})

	                .style("left", (d3.event.pageX - tooltipWidth - 30) + "px")
	                .style("top", (d3.event.pageY - tooltipHeight / 2) + "px");
            })
            .on("mousemove", function(d) {
            	const tooltipWidth = tooltipHTML.width() + 20;
				const tooltipHeight = tooltipHTML.height() + 20;
	            tooltip
	                .style("left", (d3.event.pageX - tooltipWidth - 30) + "px")
	                .style("top", (d3.event.pageY - tooltipHeight / 2) + "px");
            })
	        .on("mouseout", function(d) {
	            tooltip.transition()
	                .duration(100)
	                .style("opacity", 0)
	                .style("pointer-events", "initial");
	        })
	        .on("mousedown", function(d) {
	        	globalTimers.forEach(timer => cancelAnimationFrame(timer));
	            const linkId = d.id;
	            for (let l in links) {
	            	const link = links[l];
	            	if (link.opacity != 0) {
		            	link.lastOpacity = link.opacity;
		            	link.opacity = 0.15;
	            	}
	            	link.selected = false;
	            }

	            for (let l in nodes) {
	            	const node = nodes[l];
	            	if (node.opacity != 0) {
		            	node.lastOpacity = node.opacity;
		            	node.opacity = 0.15;
	            	}
	            	node.selected = false;
	            }

	            const onlyParents = 'onlyparents';
	            const onlyChilds = 'onluchilds';

	            switch (d.type) {
	            	case "contract":
	            	case "contract_type":
	            	case "organization":
	            	case "related":
			            globalTimers.push(
			            	requestAnimationFrame((function(linkId,onlyChilds) {
					            return function() {showSelectedLinks(linkId, onlyChilds)};
			            	})(linkId, onlyChilds))
			            )
			            globalTimers.push(
			            	requestAnimationFrame((function(linkId,onlyParents) {
					            return function() {showSelectedLinks(linkId, onlyParents)};
			            	})(linkId, onlyParents))
			            )
		            	break;
		            case "all":
			            globalTimers.push(
			            	requestAnimationFrame((function(linkId,onlyParents) {
					            return function() {showSelectedLinks(linkId, onlyParents)};
			            	})(linkId, onlyParents))
			            )
		            	break;
		            default:
			            globalTimers.push(
			            	requestAnimationFrame((function(linkId,onlyChilds) {
				            	return function() {showSelectedLinks(linkId, onlyChilds);}
			            	})(linkId, onlyChilds))
			            )
		            	break;
	            }

	            function showSelectedLinks(linkId, onlyType) {
	            	const selectedLinks = links.filter(
		            	link => {
		            		const findOnlyParents = onlyType == onlyParents;
		            		const iAmAChild = link.target;
		            		const iAmAParent = link.source;
		            		let linkType;
		            		if (findOnlyParents) {
		            			linkType = iAmAChild;
		            		} else {
		            			linkType = iAmAParent;
		            		}
		            		return linkType.id == linkId;
		            	}
		            );
		            for (let l in selectedLinks) {
		            	const selectedLink = selectedLinks[l];
		            	if (selectedLink.selected == true) {continue;}
		            	if (selectedLink.hidden) {continue;}
		            	selectedLink.lastOpacity = selectedLink.opacity;
		            	selectedLink.opacity = 1;
		            	selectedLink.selected = true;

		            	const findOnlyParents = onlyType == onlyParents;
	            		const iAmAChild = selectedLink.target;
	            		const iAmAParent = selectedLink.source;
	            		let linkType;
	            		if (findOnlyParents) {
	            			linkType = iAmAParent;
	            		} else {
	            			linkType = iAmAChild;
	            		}
	            		globalTimers.push(
	            			requestAnimationFrame((function(linkId) {
				            	return function() {showSelectedNodes(linkId);}
			            	})(selectedLink.source.id))
			            )
			            globalTimers.push(
			            	requestAnimationFrame((function(linkId) {
				            	return function() {showSelectedNodes(linkId);}
			            	})(selectedLink.target.id))
			            )

		            	globalTimers.push(
		            		requestAnimationFrame((function(linkTypeId, onlyType) {
				            	return function() {showSelectedLinks(linkTypeId, onlyType);}
			            	})(linkType.id, onlyType))
			            )
		            }
	            }

	            function showSelectedNodes(linkId) {
	            	const selectedNodes = nodes.filter(node => {
	            		return (node.id == linkId);
	            	});

	            	for (let n in selectedNodes) {
	            		const selectedNode = selectedNodes[n];
	            		selectedNode.lastOpacity = selectedNode.opacity;
		            	selectedNode.opacity = 1;
		            	selectedNode.selected = true;
	            	}
	            }
            });
		}
	}
}

function htmlEncode(text) {
	return $('<div/>').text(text).html();
}

function getContractsAmount(contracts) {
	return contracts.reduce((totalAmount, {amount}) => totalAmount + amount, 0).toFixed(0);
}

function getContractTypes(contracts) {
	const contractsSet = new MathSet(contracts);
	const contractsTypeFilter = new Filter({property: 'procedure_type'});
	const contractTypes = Object.keys(contractsSet.countByFilterProperty(contractsTypeFilter));
	return contractTypes;
}

function getContractsByTypes(contracts) {
	const contractsSet = new MathSet(contracts);
	const contractTypes = getContractTypes(contracts);
	const contractsByTypes = {};
	for (let i in contractTypes) {
		const contractType = contractTypes[i];
		const contractTypesFilter = new Filter({
			property: 'procedure_type',
			expected: contractType,
			operator: 'eq'
		});
		const contractsByType = contractsSet.filter(contractTypesFilter).toObject();
		contractsByTypes[contractType] = {
			amount: getContractsAmount(objectToArray(contractsByType)),
			name: contractType,
			contracts: contractsByType
		}
	}
	return contractsByTypes;
}

function objectToArray(obj) {
	return Object.keys(obj).map(key => obj[key]);
}

function setNodeSizeToType(nodes, type, value) {
	return nodes;
	return nodes.map(node => node.type !== type ? {...node, value} : node);
}

function redraw() {
  vis.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


