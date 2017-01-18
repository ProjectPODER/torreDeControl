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
		const node = { id: 'contracts', name: 'contracts', value: contractsAmount / 1000000000, type: 'all', group: 1 };
		slidesObjects[1].nodes.push(node);
		nodes.push(node);
		for (let i in contractsByTypes) {
			const contractByType = contractsByTypes[i];
			const node = { id: contractByType.name, name: contractByType.name, value: contractByType.amount / 1000000000, type: 'contract_type', group: 2 };
			const link = { source: 'contracts', target: contractByType.name, type: 'contract_type', distance: 100 };
			slidesObjects[2].nodes.push(node);
			slidesObjects[2].links.push(link);
			nodes.push(node);
			links.push(link);
			for (let j in contractByType.contracts) {
				const contract = contractByType.contracts[j];
				const node = { id: contract.ocid, name: contract.amount, value: Math.log(contract.amount) / 10, type: 'contract', group: 3 };
				const link = { source: contractByType.name, target: contract.ocid, type: 'contract', distance: 20 };
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
	    .force("charge", d3.forceManyBody().strength(-20))
	    .force("link", d3.forceLink().id(d => d.id).distance(d => d.distance).strength(1))
	    .force("center", d3.forceCenter(width / 2, height / 2))
	    .on("tick", ticked);;

	const slide_1 = new Filter({property: 'type', operator: 'eq', expected: 'all'});
	const slide_2 = new Filter({property: 'type', operator: 'eq', expected: 'contract_type'});
	const slide_3 = new Filter({property: 'type', operator: 'eq', expected: 'contract'});

	document.addEventListener("keydown", keyboard);

	let g = svg.append("g");
	link = g.append("g").selectAll('link');
	node = g.append("g").selectAll('node');

	function ticked() {
		node
		    .attr("cx", d => d.x)
		    .attr("cy", d => d.y);

		link
		    .attr("x1", d => d.source.x)
		    .attr("y1", d => d.source.y)
		    .attr("x2", d => d.target.x)
		    .attr("y2", d => d.target.y);
	}

	function draw(graph) {
		node = node.data(graph.nodes);
		node.exit().remove();
		node = node.enter().append("circle")
			.attr("r", d => d.value * 3)
			.attr("fill", d => color(d.group))
			.attr("class", "nodes")
			.merge(node);

		node.each(d => {
			if (d.type == 'all') {
				d.fx = d.x;
				d.fy = d.y;
			}
		});

		link = link.data(graph.links);
		link.exit().remove();
		link = link.enter().append("line")
			.attr("class", "links")
			.merge(link);

		// node.append("title")
		// 	.text(d => d.name);

		simulation.nodes(graph.nodes);
		simulation.force("link").links(graph.links);
		simulation.alpha(0.1).restart();
	}

	function keyboard(a) {
		let graph;
		
		switch (a.key) {
			case 'a':
				graph = {
					nodes: objectToArray((new MathSet(nodes)).filter(slide_1).toObject()),
					links: objectToArray((new MathSet(links)).filter(slide_1).toObject())
				};
				node.each(d => {
					d.fx = null;
					d.fy = null;
					if (d.type == 'all') {
						d.fx = d.x;
						d.fy = d.y;
					} else {
						d.x = 0;
						d.y = 0;
					}
				});	
				break;
			case 's':
				graph = {
					nodes: objectToArray((new MathSet(nodes)).filter(slide_1, slide_2).toObject()),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2).toObject())
				};
				node.each(d => {
					d.fx = null;
					d.fy = null;
					if (d.type == 'all' || d.type == 'contract_type') {
						d.fx = d.x;
						d.fy = d.y;
					} else {
						d.x = 0;
						d.y = 0;
					}
				});	
				break;
			case 'd':
				graph = {
					nodes: objectToArray((new MathSet(nodes)).filter(slide_1, slide_2, slide_3).toObject()),
					links: objectToArray((new MathSet(links)).filter(slide_1, slide_2, slide_3).toObject())
				};
				node.each(d => {
					d.fx = null;
					d.fy = null;
					if (d.type == 'all' || d.type == 'contract_type' || d.type == 'contract') {
						d.fx = d.x;
						d.fy = d.y;
					} else {
						d.x = 0;
						d.y = 0;
					}
				});	
				break;
		}
		
		draw(graph);
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



