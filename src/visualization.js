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
// const fs = -100;
// const ld = 13;
// const ls = 1;
// const mn = 0;
// const mx = 312;
// const cr = 20;

const fs = -350;
const ls = 0.6;
const ld = 70;

const mn = 0;
const mx = 1000;
const cr = 20;
// const fs = -250;
// const ls = 0.6;
// const ld = 80;
let node;
let link;
let offset = 0;
let graph;

const AppData = {
	persons: [],
	organizations: [],
	contracts: []
};

module.exports = () => {
	window.jQuery = $;

	getData(data => {
		AppData.organizations = data.organizations,
		AppData.contracts = data.contracts;
		const contractsAmount = getContractsAmount(AppData.contracts);
		const contractsByTypes = getContractsByTypes(AppData.contracts);
		const organizations = AppData.organizations;
		const slidesObjects = [	null,
			{nodes: [], links: []},
			{nodes: [], links: []},
			{nodes: [], links: []},
			{nodes: [], links: []}
		]; 
		$('#contracts_amount').text("$ " + (Math.round(contractsAmount/1000000)).toLocaleString() + " M");
		$('#contracts_type').text(Object.keys(contractsByTypes).length);
		$('#contracts_total').text(objectToArray(contractsByTypes).reduce(function(total, actual) {return total + Object.keys(actual.contracts).length}, 0));
		const node = { id: 'contracts', name: 'contracts', activeSize: contractsAmount / 100000000, inactiveSize: 15, type: 'all', group: 1, color: '#BEA288', linksCount: 0 };
		slidesObjects[1].nodes.push(node);
		nodes.push(node);
		for (let i in contractsByTypes) {
			const contractByType = contractsByTypes[i];
			const node = { id: contractByType.name, name: contractByType.name, activeSize: contractByType.amount / 100000000, inactiveSize: 5, type: 'contract_type', group: 2, color: '#8AC190', linksCount: 0 };
			const link = { source: 'contracts', target: contractByType.name, type: 'contract_type', distance: 200, color: '#706F74' };
			slidesObjects[2].nodes.push(node);
			slidesObjects[2].links.push(link);
			nodes.push(node);
			links.push(link);
			for (let j in contractByType.contracts) {
				const contract = contractByType.contracts[j];
				const node = { id: contract.ocid, name: contract.amount, activeSize: Math.log(contract.amount) / 2, inactiveSize: 20, type: 'contract', group: 3, color: '#E086A9', linksCount: 0 };
				const link = { source: 'contracts', target: contract.ocid, type: 'contract', distance: 20, color: '#706F74' };
				slidesObjects[3].nodes.push(node);
				slidesObjects[3].links.push(link);
				nodes.push(node);
				links.push(link);
			}
		}
		for (let k in organizations) {
			const organization = organizations[k];
			const node = { id: organization._id, name: organization.name, activeSize: 20, inactiveSize: 10, type: 'organization', group: 4, color: '#646464', linksCount: 0 };
			for (let j in AppData.contracts) {
				const contract = AppData.contracts[j];
				if (contract.proveedor === organization.name) {
					const link = { source: contract.ocid, target: organization._id, type: 'organization', distance: 20, color: '#706F74' };
					slidesObjects[4].links.push(link);
					links.push(link);
					node.linksCount++;
				}
			}
			slidesObjects[4].nodes.push(node);
			nodes.push(node);
		}
		nodes = [...slidesObjects[1].nodes, ...slidesObjects[2].nodes, ...slidesObjects[3].nodes, ...slidesObjects[4].nodes];
		links = [...slidesObjects[1].links, ...slidesObjects[2].links, ...slidesObjects[3].links, ...slidesObjects[4].links];
		setupD3();
		window.graph = {nodes, links};
	});
	
	
};

function getData(cb) {
	async.waterfall([
		getContracts,
		getOrganizations
	], (err, results) => {
		cb({
			contracts: results.contracts,
			organizations: results.organizations
		});
	})
}

function getContracts(cb) {
	async.parallel(
		[
			(parallelCB) => {
				$.get('https://www.quienesquien.wiki/api/v1/contracts?dependency=Grupo%20Aeroportuario%20De%20La%20Ciudad%20De%20M%C3%A9xico,%20S.A.%20de%20C.V.&limit=1000')
				.done(response => {parallelCB(null, response.data);})
				.fail(response => {parallelCB(null, []);});
			},
			(parallelCB) => {
				$.get('https://www.quienesquien.wiki/api/v1/contracts?dependency=Aeropuertos%20Y%20Servicios%20Auxiliares&limit=1000')
				.done(response => {parallelCB(null, []);})
				.fail(response => {parallelCB(null, []);});
			}
		],
		(err, results) => {
			cb(null, {contracts: [...results[0], ...results[1]]})
		}
	);
	
	
}

function getOrganizations(params, cb) {
	const organizationFilter = new Filter({property: 'proveedor'});
	const contractorsNamesSet = new MathSet(params.contracts);
	const organizationsByNames = Object.keys(contractorsNamesSet.countByFilterProperty(organizationFilter));
	const organizationsNames = organizationsByNames.map((provider) => `name=${encodeURIComponent(provider)}`);
	const query = `?${organizationsNames.join('&')}`.substr(0,2000);
	$.get(`https://www.quienesquien.wiki/api/v1/organizations${query}`)
	.done(response => {cb(null, {...params, organizations: response.data});})
	.fail(response => {cb(null, {...params, organizations: []});});
}

function getPersons(cb) {
	$.get('https://www.quienesquien.wiki/api/v1/persons')
	.done(response => {cb(null, response.data);});
}

function setupD3() {
	const svg = d3.select("svg");
	const width = $('svg').width();
	const height = $('svg').height();
	const color = d3.scaleOrdinal(d3.schemeCategory20);

	/* ----- Force Setup ----- */
	/* Charges */
	const forceManyBody = d3.forceManyBody();
		forceManyBody.strength(fs);
		// forceManyBody.distanceMax(mx);
		// forceManyBody.distanceMin(mn);
	/* Links */
	const forceLink = d3.forceLink();
		forceLink.id(d => d.id);
		forceLink.distance(ld);
		forceLink.strength(ls);
		forceLink.iterations(3);
	/* Center force */
	const forceCenter = d3.forceCenter(width / 2 - offset, height / 2 - offset);
	/* Collides */
	const forceCollide = d3.forceCollide();
		forceCollide.radius(d => d.activeSize * (1.2+ d.linksCount));
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

	function ticked() {
		node
		    .attr("cx", d => d.x + offset)
		    .attr("cy", d => d.y + offset);

		link
		    .attr("x1", d => d.source.x + offset)
		    .attr("y1", d => d.source.y + offset)
		    .attr("x2", d => d.target.x + offset)
		    .attr("y2", d => d.target.y + offset);

	}

	window.addEventListener("resize", function() {draw(graph);});

	const slide_1 = new Filter({property: 'type', operator: 'eq', expected: 'all'});
	const slide_2 = new Filter({property: 'type', operator: 'eq', expected: 'contract_type'});
	const slide_3 = new Filter({property: 'type', operator: 'eq', expected: 'contract'});
	const slide_4 = new Filter({property: 'type', operator: 'eq', expected: 'organization'});
	$('#fullpage').fullpage({
		paddingBottom: '60px',
		paddingTop: ($('.site-top-ribbon').height() + 60) + 'px',
    scrollingSpeed: 300,
    onLeave: (index, nextIndex) => {
    	$(`.info-container`).removeClass('slide-active slide-leaving');
			$(`.slide-${index}`).removeClass('slide-active').addClass('slide-leaving');
			switch (nextIndex - 1) {
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
					d3.selectAll('.links.contract_type').transition().delay(100).attr('opacity', 1);
					break;
				case 2:
					graph = {
						nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2, slide_3).toObject()), 'contract', 3),
						links: objectToArray((new MathSet(links)).filter(slide_1, slide_2, slide_3).toObject())
					};
					draw(graph);
					d3.selectAll('.nodes.contract').transition().attr('r', d => d.activeSize);
					d3.selectAll('.contract_type').transition().attr('r', d => d.inactiveSize);
					d3.selectAll('.links.contract').transition().delay(100).attr('opacity', 1);
					break;
				case 3:
					graph = {
						nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1, slide_2, slide_3, slide_4).toObject()), 'organization', 4),
						links: objectToArray((new MathSet(links)).filter(slide_1, slide_2, slide_3, slide_4).toObject())
					};
					draw(graph);
					d3.selectAll('.nodes.organization').transition().attr('r', d => d.activeSize);
					d3.selectAll('.organization_type').transition().attr('r', d => d.inactiveSize);
					d3.selectAll('.links.organization').transition().delay(100).attr('opacity', 1);
					break;
			}
    },
		afterLoad: function(anchorLink, index){
			$(`.slide-${index}`).addClass('slide-active');
		},
	});
	$('.fullpage').animate({'opacity': 1});

	graph = {
		nodes: setNodeSizeToType(objectToArray((new MathSet(nodes)).filter(slide_1).toObject()), 'all', 3),
		links: objectToArray((new MathSet(links)).filter(slide_1).toObject())
	};
	draw(graph);
	d3.selectAll('.nodes.all').transition().attr('r', d => d.activeSize);

	function draw(graph) {
		const container = $('svg');
		const svg = $('svg');
		const resG = $('.resizable-g');
		const width = container.width();
		const height = container.height();
		let scaleMin;

		if($(window).width() < 420) {
	    scaleMin = Math.min(width, height) / (1800 - $(window).width());
		} else {
	    scaleMin = Math.min(width, height) / (2800 - $(window).width());
		}
		const resGWidth = width/2 * (1 - scaleMin);
		const resGHeight = height/2 * (1 - scaleMin);
		offset = 0;

	    const positioning = 'translate(' + resGWidth + 'px, ' + resGHeight + 'px) scale(' + scaleMin + ')';

		resG.css('transform', positioning);

		node = node.data(graph.nodes)
		node.exit().remove();
		node = node.enter().append("circle")
			.attr("r", d => d.activeSize)
			.attr("fill", d => d.color)
			.attr("class", d => "nodes " + d.type)
			.merge(node);

		node.each(d => {
			if (d.type === 'all') {
				d.fx = width / 2 - offset;
				d.fy = height / 2 - offset;
			} else {
				d.fx = null;
				d.fy = null;
			}})

		link = link.data(graph.links);
		link.exit().remove();
		link = link.enter().append("line")
			.attr("class", d => "links " + d.type)
			.style("stroke", d=> d.color)
			.attr("opacity", 0)
			.merge(link);

		forceManyBody.strength(fs);
		// forceManyBody.distanceMax(mx);
		// forceManyBody.distanceMin(mn);
		forceLink.distance(ld);
		forceLink.strength(ls);
		forceCollide.radius(d => d.activeSize * (1.2+ d.linksCount));


		simulation.nodes(graph.nodes);
		simulation.force("link").links(graph.links);
		simulation.force("center", d3.forceCenter(width / 2 - offset, height / 2 - offset))
		simulation.alpha(0.5).restart();
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