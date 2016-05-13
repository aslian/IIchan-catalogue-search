// ==UserScript==
// @name         IIchan catalogue search
// @namespace    localhost
// @version      1.0
// @description  trying to take over the world!
// @author       Cirno
// @match        http://iichan.hk/*/catalogue.html
// @grant        none
// ==/UserScript==

/* jshint esnext:true */
var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

function filterCatalog(event){
	var query = event.target.value;

	var heading = '.theader';
	var title = '.filetitle';
	var snippet = '.cattext';

	var threads = $$('.catthreadlist a');
	var count = threads.length;

	for(var thread of Array.from(threads)){
		// reset
		if(thread.style.display !== ''){
			thread.style.display = '';
		}

		// if nothing to nipah about
		if(query === '' || query.match(/^\s+$/)){
			continue;
		}

		// but if they doesnt't fit...
		var re = new RegExp(query, 'i');
		if(
			!(
				thread.title.match(re) || // This actually matches thread creation date
				( (thread.querySelector(title) !== null) && thread.querySelector(title).textContent.match(re) ) ||
				( (thread.querySelector(snippet) !== null) && thread.querySelector(snippet).textContent.match(re) )
			)
		){
			// ... hide 'em and reveal needed
			thread.style.display = 'none';
			count--;
		}
	}

	$(heading).innerHTML = $(heading).innerHTML.match(/\d/) ? $(heading).innerHTML.replace(/\d+/, count) : $(heading).innerHTML + ' <b>(' + count + ')</b>';
}


// ondomcontentloaded

// display search bar
$('.theader').insertAdjacentHTML(
	'beforebegin',
	'<input type="text" title="Search" id="filterbox" placeholder="Start typing to search..." style="margin-left: 1em; width: 20%;">'
);
$('#filterbox').oninput = filterCatalog;


// display date & time for each thread
for(var thread of Array.from($$('.catthreadlist a'))){
	var date = thread.title;

	thread.querySelector('br[clear]').insertAdjacentHTML(
		'afterend',
		'<span class="postertrip" style="background:cornsilk">[' + date.match(/(\d{2})\s(\W{3})(?:\W+)?\s(\d{4})/).slice(1,4).join('/') + ' ' + date.match(/..:.{5}/) + ']</span><br>'
	);
}