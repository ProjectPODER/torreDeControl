import $ from 'jquery';
import Cytoscape from 'cytoscape';
import * as d3 from "d3";
import async from 'async';
import Filter from './filters.js';
import MathSet from './sets.js';
require('./css/main.scss');

const nodes = [
	// { id: 'desktop', name: 'Cytoscape', value: 100, href: 'http://cytoscape.org' },
 //    { id: 'js', name: 'Cytoscape.js', value: 50, href: 'http://js.cytoscape.org' }
];

const links = [
	// { source: 'desktop', target: 'js' }
];

const AppData = {
	persons: [],
	organizations: [],
	contracts: []
};

$(() => {
	getData((data) => {
		AppData.organizations = data.organizations,
		AppData.contracts = data.contracts;
		console.log(AppData.contracts);
		const contractsAmount = getContractsAmount(AppData.contracts);
		const contractsByTypes = getContractsByTypes(AppData.contracts);
		
		const node = { id: 'contracts', name: 'contracts', value: contractsAmount / 1000000000, href: 'http://cytoscape.org', group: 1 };
		nodes.push(node);
		for (let i in contractsByTypes) {
			const contractByType = contractsByTypes[i];
			const node = { id: contractByType.name, name: contractByType.name, value: contractByType.amount / 1000000000, href: 'http://cytoscape.org', group: 2 };
			const link = { source: 'contracts', target: contractByType.name };
			console.log(contractByType.amount)
			nodes.push(node);
			links.push(link);
			for (let j in contractByType.contracts) {
				const contract = contractByType.contracts[j];
				const node = { id: contract.ocid, name: contract.amount, value: Math.log(contract.amount) / 10, href: 'http://cytoscape.org', group: 3 };
				const link = { source: contractByType.name, target: contract.ocid };
				nodes.push(node);
				links.push(link);
			}
		}
		console.log(nodes, links)
		draw();
	});
	
	
});

function getData(cb) {
	async.series([
		getContracts,
		getOrganizations
	], (err, results) => {
		console.log(results)
		cb({
			contracts: results[0],
			organizations: results[1]
		})
	})
}

function getPersons(cb) {
	$.get('https://www.quienesquien.wiki/api/v1/persons')
	.done((response) => {
		cb(null, response.data);
	});
}

function getOrganizations(cb) {
	// const contracts = new MathSet(contractsData);
	// const companyFilter = new Filter({property: 'proveedor'});
	// const organizations = Object.keys(contracts.countByFilterProperty(companyFilter));
	// const query = `?names=${htmlEncode(organizations.join(','))}`;
	const query = '';
	$.get(`https://www.quienesquien.wiki/api/v1/organizations${query}`)
	.done((response) => {
		console.log(response.data);
		cb(null, response.data);
	});
}

function getContracts(cb) {
	$.get('https://www.quienesquien.wiki/api/v1/contracts?dependency=Grupo%20Aeroportuario%20De%20La%20Ciudad%20De%20M%C3%A9xico,%20S.A.%20de%20C.V.')
	.done((response) => {
		cb(null, response.data);
	});
}

function draw() {
	var svg = d3.select("svg"),
	width = +svg.attr("width"),
	height = +svg.attr("height");

	var color = d3.scaleOrdinal(d3.schemeCategory20);

	var simulation = d3.forceSimulation()
	    .force("link", d3.forceLink().id(function(d) { return d.id; }))
	    .force("charge", d3.forceManyBody())
	    .force("center", d3.forceCenter(width / 2, height / 2));


	var graph = {
  		nodes,
  		links
    };

	var link = svg.append("g")
	  .attr("class", "links")
	.selectAll("line")
	.data(graph.links)
	.enter().append("line")
	  .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

	var node = svg.append("g")
	  .attr("class", "nodes")
	.selectAll("circle")
	.data(graph.nodes)
	.enter().append("circle")
	  .attr("r", (d) => {
	  	return d.value * 3;
	  })
	  .attr("fill", function(d) { return color(d.group); })
	  .call(d3.drag()
	      .on("start", dragstarted)
	      .on("drag", dragged)
	      .on("end", dragended));

	node.append("title")
	  .text(function(d) { return d.id; });

	simulation
	  .nodes(graph.nodes)
	  .on("tick", ticked);

	simulation.force("link")
	  .links(graph.links);

	function ticked() {
	link
	    .attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	node
	    .attr("cx", function(d) { return d.x; })
	    .attr("cy", function(d) { return d.y; });
	}


	function dragstarted(d) {
	  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	  d.fx = d.x;
	  d.fy = d.y;
	}

	function dragged(d) {
	  d.fx = d3.event.x;
	  d.fy = d3.event.y;
	}

	function dragended(d) {
	  if (!d3.event.active) simulation.alphaTarget(0);
	  d.fx = null;
	  d.fy = null;
	}




	// var cy = Cytoscape({
	//   container: $('.container')[0],
	//   style: [
	//     {
	//       selector: 'node',
	//       style: {
	//         width: 'data(value)',
	//         height: 'data(value)',
	//         opacity: 1
	//       }
	//     }
	//   ],
	//   elements: {
	//     nodes,
	//     links
	//   },
	//   layout: {
 //        name: 'concentric',
 //        concentric: function( node ){
 //          return node.degree();
 //        },
 //        levelWidth: function( nodes ){
 //          return 2;
 //        }
 //      },

	// });
}

function htmlEncode(text) {
	return $('<div></div>').text(text).html();
}

function getContractsAmount(contracts) {
	return contracts.reduce((last, actual) => {return last + +actual.amount}, 0).toFixed(2);
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
	const arr = [];
	for(let i in obj) {
		arr.push(obj[i])
	}
	return arr;
}