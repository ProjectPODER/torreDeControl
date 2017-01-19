import $ from 'jquery';
import Cytoscape from 'cytoscape';
import * as d3 from "d3";
import async from 'async';
import Filter from './filters.js';
import MathSet from './sets.js';
require('./css/main.scss');

let nodes = [
	// { id: 'desktop', name: 'Cytoscape', value: 100, href: 'http://cytoscape.org' },
 //    { id: 'js', name: 'Cytoscape.js', value: 50, href: 'http://js.cytoscape.org' }
];

let links = [
	// { source: 'desktop', target: 'js' }
];

let node;
let link;

const AppData = {
	persons: [],
	organizations: [],
	contracts: []
};

$(() => {
	getData(data => {
		AppData.organizations = data.organizations,
		AppData.contracts = data.contracts;
		const contractsAmount = getContractsAmount(AppData.contracts);
		const contractsByTypes = getContractsByTypes(AppData.contracts);
		const slidesObjects = [	null,
			{nodes: [], links: []},
			{nodes: [], links: []},
			{nodes: [], links: []}
		]; 
		const node = { id: 'contracts', name: 'contracts', activeSize: contractsAmount / 100000000, inactiveSize: 15, type: 'all', group: 1, color: '#BEA288' };
		slidesObjects[1].nodes.push(node);
		nodes.push(node);
		for (let i in contractsByTypes) {
			const contractByType = contractsByTypes[i];
			const node = { id: contractByType.name, name: contractByType.name, activeSize: contractByType.amount / 100000000, inactiveSize: 10, type: 'contract_type', group: 2, color: '#8AC190' };
			const link = { source: 'contracts', target: contractByType.name, type: 'contract_type', distance: 100, color: '#706F74' };
			slidesObjects[2].nodes.push(node);
			slidesObjects[2].links.push(link);
			nodes.push(node);
			links.push(link);
			for (let j in contractByType.contracts) {
				const contract = contractByType.contracts[j];
				const node = { id: contract.ocid, name: contract.amount, activeSize: Math.log(contract.amount) / 3, inactiveSize: 20, type: 'contract', group: 3, color: '#E086A9' };
				const link = { source: contractByType.name, target: contract.ocid, type: 'contract', distance: 20, color: '#706F74' };
				slidesObjects[3].nodes.push(node);
				slidesObjects[3].links.push(link);
				nodes.push(node);
				links.push(link);
			}
		}
		nodes = [...slidesObjects[1].nodes, ...slidesObjects[2].nodes, ...slidesObjects[3].nodes];
		links = [...slidesObjects[1].links, ...slidesObjects[2].links, ...slidesObjects[3].links];
		setupD3();
	});
	
	
});

function getData(cb) {
	async.series([
		getContracts,
		getOrganizations
	], (err, results) => {
		cb({
			contracts: results[0],
			organizations: results[1]
		});
	})
}

function getPersons(cb) {
	$.get('https://www.quienesquien.wiki/api/v1/persons')
	.done(response => {cb(null, response.data);});
}

function getOrganizations(cb) {
	$.get('https://www.quienesquien.wiki/api/v1/organizations')
	.done(response => {cb(null, response.data);});
}

function getContracts(cb) {
	$.get('https://www.quienesquien.wiki/api/v1/contracts?dependency=Grupo%20Aeroportuario%20De%20La%20Ciudad%20De%20M%C3%A9xico,%20S.A.%20de%20C.V.')
	.done(response => {cb(null, response.data);});
}

function setupD3() {
	const svg = d3.select("svg");
	const width = +svg.attr("width");
	const height = +svg.attr("height");
	const color = d3.scaleOrdinal(d3.schemeCategory20);

	const simulation = d3.forceSimulation()
	    .force("charge", d3.forceManyBody().strength(-30))
	    .force("link", d3.forceLink().id(d => d.id).distance(d => d.distance).strength(1))
	    // .force("center", d3.forceCenter(width / 2, height / 2))
	    .on("tick", ticked);

	 window.simulation = simulation;
	 window.d3 = d3;

	const slide_1 = new Filter({property: 'type', operator: 'eq', expected: 'all'});
	const slide_2 = new Filter({property: 'type', operator: 'eq', expected: 'contract_type'});
	const slide_3 = new Filter({property: 'type', operator: 'eq', expected: 'contract'});

	document.addEventListener("keydown", keyboard);

	let g = svg.append("g");
	link = g.append("g").selectAll('link');
	node = g.append("g").selectAll('node');

	function ticked() {
		node
		    .attr("cx", d => d.x + 300)
		    .attr("cy", d => d.y + 300);

		link
		    .attr("x1", d => d.source.x + 300)
		    .attr("y1", d => d.source.y + 300)
		    .attr("x2", d => d.target.x + 300)
		    .attr("y2", d => d.target.y + 300);
	}

	function draw(graph) {
		node = node.data(graph.nodes)
		node.exit().remove();
		node = node.enter().append("circle")
			.attr("r", 0)
			.attr("fill", d => d.color)
			.attr("class", d => "nodes " + d.type)
			.merge(node);

		link = link.data(graph.links);
		link.exit().remove();
		link = link.enter().append("line")
			.attr("class", d => "links " + d.type)
			.style("stroke", d=> d.color)
			.attr("opacity", 0)
			.merge(link);

		simulation.nodes(graph.nodes);
		simulation.force("link").links(graph.links);
		simulation.alpha(0.1).restart();
	}

	function keyboard(a) {
		let graph;
		
		switch (a.key) {
			case 'a':
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1).toObject()), 'all', 3),
					links: objectToArray((new MathSet(links)).filter(slide_1).toObject())
				};
				draw(graph);
				d3.selectAll('.nodes.all').transition().attr('r', d => d.activeSize);
				break;
			case 's':
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2).toObject()), 'contract_type', 3),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2).toObject())
				};
				draw(graph);
				d3.selectAll('.nodes.contract_type').transition().attr('r', d => d.activeSize);
				d3.selectAll('.all').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.links.contract_type').transition().delay(100).attr('opacity', 1);
				break;
			case 'd':
				graph = {
					nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2, slide_3).toObject()), 'contract', 3),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2, slide_3).toObject())
				};
				draw(graph);
				d3.selectAll('.nodes.contract').transition().attr('r', d => d.activeSize);
				d3.selectAll('.contract_type').transition().attr('r', d => d.inactiveSize);
				d3.selectAll('.links.contract').transition().delay(100).attr('opacity', 1);
				break;
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