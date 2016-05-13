// ==UserScript==
// @name         IIchan catalogue search
// @namespace    localhost
// @version      2.0
// @description  Trying to take over the world!
// @author       Cirno
// @match        http://iichan.hk/*/catalogue.html
// @grant        unsafeWindow
// ==/UserScript==

/* jshint esnext:true */
var $ = function(selector, startNode = false){
    var elements = (startNode || document).querySelectorAll(selector);

    if (elements.length === 0) {
        return [];
    } else if (elements.length === 1) {
        return elements[0];
    } else {
        return Array.from(elements);
    }
}.bind(document);

var catalogParser  = {
    container:'.catthreadlist',
    threads: '.catthreadlist a',

    heading: '.theader',
    title: '.filetitle',
    snippet: '.cattext',

    date: /(\d{2})\s(\W{3})(?:\W+)?\s(\d{4})/,
    time: /..:.{5}/,
    threadNumber: /^#(\d+)\s/,

    searchBox: '#searchbox',
    clearBtn: '#clearbtn',
    sortMode: 'input[name=sortmode]',
    sortDirection: 'input[name=sortdirection]'
};

function filterCatalog(event){
	var query = event.target.value;

    var threads = $(catalogParser.threads);
	var count = threads.length;

	for (var thread of threads){
		// Reset
		if(thread.style.display !== ''){
			thread.style.display = '';
		}

		// If nothing to nipah about, give up
		if(query === '' || query.match(/^\s+$/)){
			continue;
		}

		// But if they doesnt't fit...
		var re = new RegExp(query, 'i');
		if(
			!(
				thread.title.match(re) || // This actually matches thread creation date, although accessing "title" property
				( ($(catalogParser.title, thread).length !== 0) && $(catalogParser.title, thread).textContent.match(re) ) ||
				( ($(catalogParser.snippet, thread).length !== 0) && $(catalogParser.snippet, thread).textContent.match(re) )
			)
		){
			// ... hide 'em and reveal needed
			thread.style.display = 'none';
			count--;
		}
	}

	$(catalogParser.heading).innerHTML = $(catalogParser.heading).innerHTML.match(/\d/) ? $(catalogParser.heading).innerHTML.replace(/\d+/, count) : $(catalogParser.heading).innerHTML + ` <b>(${ count })</b>`;
}

/* jshint ignore:start */
function sortCatalog() {
    // false: bump order, true: by date
    // false: asc,        true: desc
    var mode = Boolean(parseInt($(catalogParser.sortMode + ':checked').value));
    var desc = Boolean(parseInt($(catalogParser.sortDirection + ':checked').value));

    var threads = $(catalogParser.threads);

    // This affects perfomance.
    // Hidden elements are being sorted faster.
    $(catalogParser.container).style.display = 'none';

    threads.sort((a, b) => {
        [a, b] = [a, b].map(thread => mode ? parseInt(thread.title.match(catalogParser.threadNumber).pop()) : parseInt(thread.dataset.bumpOrder))

        if(mode) {
            if(desc) return - (a - b);
            return a - b;
        } else {
            if(desc) return a - b;
            return - (a - b);
        }
    }).forEach(thread => {
        thread.parentNode.appendChild(thread)
        if(thread.firstChild.nodeType == Node.TEXT_NODE) thread.firstChild.remove()	// Fix textNode artifacts
    })

    // Show them.
    $(catalogParser.container).style.display = '';

}
/* jshint ignore:end */


// onDOMContentLoaded

// Display UI
$(catalogParser.heading).insertAdjacentHTML(
	'afterend',
	`
	<div class="postarea">
			<table style="margin: inherit;">
				<tbody>
					<tr>
						<td class="postblock">&nbsp;Поиск&nbsp;</td>
						<td>
							<input size="28" type="text" autocomplete="off" title="Поиск" id="searchbox" placeholder="Начните ввод для поиска...">
							<span id="clearbtn">ｘ</span>
						</td>
					</tr>
					<tr>
						<td class="postblock">Сортировка&nbsp;&nbsp;</td>
						<td>
							<label style="cursor: pointer;">[<input name="sortmode" type="radio" value="0" checked> последний бамп &nbsp; /</label>
							<label style="cursor: pointer;"><input name="sortmode" type="radio" value="1"> дата создания ]</label>
							<br>
							<label style="cursor: pointer;">[<input name="sortdirection" type="radio" value="0"> по возрастанию &nbsp; /</label>
							<label style="cursor: pointer;"><input name="sortdirection" type="radio" value="1" checked> по убыванию ]</label>
						</td>
					</tr>
				</tbody>
			</table>
	</div>
	`
);

// Fancy effects
$(catalogParser.clearBtn).style.color = 'orangered';
$(catalogParser.clearBtn).style.cursor = 'pointer';
$(catalogParser.clearBtn).onmouseenter = (event) => event.target.style.fontWeight = 'bold';
$(catalogParser.clearBtn).onmouseleave = (event) => event.target.style.fontWeight = '';

// Bind to the input event(s)
$(catalogParser.clearBtn).onclick = (event) => {
    var input = event.target.previousSibling.previousSibling;

    input.value = '';
    input.dispatchEvent(new unsafeWindow.Event('input'));
};

$(catalogParser.searchBox).oninput = filterCatalog;
$(catalogParser.sortMode + ',' + catalogParser.sortDirection).forEach(element => element.onchange = sortCatalog);

// Display date & time for each thread
$(catalogParser.threads).forEach(thread => {
	var date = thread.title;

	$('br[clear]', thread).insertAdjacentHTML(
		'afterend',
		`<span class="postertrip">[${ date.match(catalogParser.date).slice(1, 4).join('/') } ${ date.match(catalogParser.time) }]</span><br>`
	);
});

// Count threads
[' ', ''].forEach(val => {
	$(catalogParser.searchBox).value = val;
	$(catalogParser.searchBox).dispatchEvent(new unsafeWindow.Event('input'));
});

// Remember bump order
$(catalogParser.threads).forEach((thread, i) => {
    thread.dataset.bumpOrder = ++i;
});

// Focus search bar
$(catalogParser.searchBox).focus();



