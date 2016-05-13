define SED_PATTERN_1
	3 h
	1,4 d
	/\/\* jshint esnext:true \*\// d
	\#==/UserScript==# {
		a
		a /*****************************************************
		a  *           POLYFILL FOR OLDER BROWSERS             *
		a  *****************************************************/
		n
		x
		a
		r dom-childnode-remove-polyfill.js
		a
		r polyfill.js
		a
		a
		a /*****************************************************
		a  *                  END POLYFILL                     *
		a  *****************************************************/
	}
endef
define SED_PATTERN_2
	/var global = module/ {
		n
		a
		a \\tvar global = (typeof GM_info !== "undefined" ? unsafeWindow : global)
	}
endef

export SED_PATTERN_1
export SED_PATTERN_2

default:
	./node_modules/babel-cli/bin/babel.js IIchan-catalogue-search.es6.user.js -o IIchan-catalogue-search.user.js
	(cd ./node_modules/core-js && if [ ! -z "$(npm list 2>&1 | grep empty)" ]; then npm install; fi)
	(cd ./node_modules/core-js && ./node_modules/grunt-cli/bin/grunt build:es6.symbol,es6.array.from,web.dom.iterable --path=../../polyfill)
	sed -i "$$SED_PATTERN_1" IIchan-catalogue-search.user.js
	sed -i "$$SED_PATTERN_2" IIchan-catalogue-search.user.js
 
clean:
	rm -rf ./IIchan-catalogue-search.user.js ./node_modules ./polyfill.js
