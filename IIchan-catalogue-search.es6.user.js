// ==UserScript==
// @name         IIchan catalogue search
// @namespace    https://github.com/aslian/IIchan-catalogue-search
// @icon         https://raw.githubusercontent.com/hades/wakaba/master/wakaba.ico
// @version      2.0
// @description  Trying to take over the world!
// @author       Cirno
// @match        http://iichan.hk/*/catalogue.html
// @match        https://iichan.hk/*/catalogue.html
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

if (typeof GM_info === 'undefined') {		
	unsafeWindow = window;		
	GM_info = {		
		script: {		
			namespace: 'https://github.com/aslian/IIchan-catalogue-search'		
		}		
	};		
}		

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
						<td class="postblock">&nbsp;Поиск&nbsp;<a target="_blank" href="${ GM_info.script.namespace }#Использование" style="font-weight: normal;">[?]</a></td>
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
							<label style="cursor: pointer;">[<input name="sortdirection" type="radio" value="1" checked> по убыванию &nbsp; /</label>
							<label style="cursor: pointer;"><input name="sortdirection" type="radio" value="0"> по возрастанию ]</label>
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

// Thread hider
(() => {
  document.head.insertAdjacentHTML('beforeend',
    `<style type="text/css">
      .catthreadlist a {
        position: relative;
      }
      .iichan-hide-thread-btn {
        cursor: pointer;
        text-decoration: none;
        position: absolute;
        top: 0;
        right: 0;
        display: none;
        width: 25px;
        height: 25px;
      }
      .iichan-hide-thread-btn > span {
        display: inline-block;
      }
      .catthread:hover .iichan-hide-thread-btn {
        display: block;
      }
      .catthreadlist a {
        transition: all .3s ease-in-out;
      }
      .iichan-thread-hidden:not(:hover) {
        opacity: .2;
        filter: blur(2px);
      }
      .iichan-thread-hidden .iichan-hide-thread-btn > span {
        transform: rotate(45deg);
      }
    </style>`);
  const board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/).pop();
  const hiddenThreads = JSON.parse(window.localStorage.getItem('iichan_hidden_threads') || '{}');
  if (!hiddenThreads[board]) {
    hiddenThreads[board] = [];
  }
  $(catalogParser.threads).forEach((thread) => {
    const threadNumber = 'thread-' + thread.title.match(catalogParser.threadNumber).pop();
    if (hiddenThreads[board] && hiddenThreads[board].includes(threadNumber)) {
      thread.classList.add('iichan-thread-hidden');
    }
    const btn = document.createElement('div');
    btn.title = 'Скрыть тред';
    btn.className = 'iichan-hide-thread-btn postblock';
    btn.innerHTML = '[<span>✕</span>]';

    $('.catthread', thread).appendChild(btn);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      thread.classList.toggle('iichan-thread-hidden');
      if (thread.classList.contains('iichan-thread-hidden')) {
        // hide thread
        if (!hiddenThreads[board].includes(threadNumber)) {
          hiddenThreads[board].push(threadNumber);
          window.localStorage.setItem('iichan_hidden_threads', JSON.stringify(hiddenThreads));
        }
      } else {
        // unhide thread
        const index = hiddenThreads[board].indexOf(threadNumber);
        if (index !== -1) {
          hiddenThreads[board].splice(index, 1);
          window.localStorage.setItem('iichan_hidden_threads', JSON.stringify(hiddenThreads));
        }
      }
    });
  });
})();
