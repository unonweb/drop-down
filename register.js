import DropDown from './DropDown.js';

if (window.customElements.get('drop-down') === undefined) {
	window.customElements.define('drop-down', DropDown);	
}