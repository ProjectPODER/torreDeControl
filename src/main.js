var images = [
	require('./images/colaboratorio-grey.svg'),
	require('./images/mexicoleaks-grey.svg'),
	require('./images/quienesquien-grey.svg'),
	require('./images/peruleaks-grey.svg'),
	require('./images/rindecuentas-grey.svg'),
	require('./images/scroll_down.svg'),
	require('./images/colaboratorio.svg'),
	require('./images/hivos.svg'),
	require('./images/mexicoleaks.svg'),
	require('./images/peruleaks.svg'),
	require('./images/poder-white.png'),
	require('./images/poder.svg'),
	require('./images/quienesquien.svg'),
	require('./images/rindecuentas.svg'),
	require('./images/torre-small-white.svg'),
	require('./images/torre-small.svg'),
	require('./images/torre.svg'),
	require('./images/wingu.svg'),
	require('./images/tw.svg'),
	require('./images/animal-politico.svg'),
	require('./images/serapaz-trazo.svg'),
];

import $ from 'jquery';
import visualization from './visualization.js';
import contracts from './contracts.js';
import investigation from './investigation.js';
window.jQuery = $;

$(() => {
	const page = $(document.body).attr('class').split(' ')[0];
	switch (page) {
		case 'page-visualizacion': {
			visualization();
			break;
		}
		case 'page-contracts': {
			contracts();
			break;
		}
		case 'page-investigation': {
			investigation();
			break;
		}
	}

	$('.wg-navbar-menu-button').click(() => {
		const opened = $('.site-header').hasClass('state-active');
		if (opened) {
			$('.site-header').removeClass('state-active');
		} else {
			$('.site-header').addClass('state-active');
		}
	});
});