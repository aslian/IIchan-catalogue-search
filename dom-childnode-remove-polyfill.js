// Taken from https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
// Modified to work with userscripts (GM)
if (!('remove' in unsafeWindow.Element.prototype)) {
    unsafeWindow.Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}
if (!('remove' in unsafeWindow.Text.prototype)) {
	unsafeWindow.Text.prototype.remove = unsafeWindow.Element.prototype.remove;
}

