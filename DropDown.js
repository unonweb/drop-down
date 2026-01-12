export default class DropDown extends HTMLElement {
	/*
		@Attributes:
			[data-state]
			[data-anim] 	// slide-rl, softdrop, unfold
			[data-overlay] 	// true, false
			[data-template] // <id>, ex
			[data-on] 		// click, hover
			[data-off] 		// self, any
			[data-dest] 	// <selector> # This is the destination element to toggle
	*/
	static _exHTML = /* html */`
		<button>Drop Me</button>
		<ul class="drop-content default">
			<li><a href="">Link 1</a></li>
			<li><a href="">Link 2</a></li>
			<li><a href="">Link 3</a></li>
		</ul>
		<ul class="drop-content offset">
			<li><a href="">Link 1</a></li>
		</ul>`

	_dest
	_log = true
	_classContent = 'drop-content'
	_defaults = {
		dest: '.drop-content',
		anim: 'softdrop',
		off: 'self',
		on: 'click',
		state: 'off',
		overlay: 'false' // don't init to true because it can cause FOUC
	}

	constructor() {
		super()
	}

	connectedCallback() {

		if (!this.dataset.state) {
			console.warn('this.dataset.state', this.dataset.state, 'This can cause FOUC!')
			this.dataset.state = this._defaults.state
		}
		if (!this.dataset.overlay) {
			console.warn('this.dataset.overlay', this.dataset.overlay, 'This can cause FOUC!')
			this.dataset.overlay = this._defaults.overlay
		}
		this.dataset.on ??= this._defaults.on
		this.dataset.off ??= this._defaults.off
		this.dataset.anim ??= this._defaults.anim
		this.dataset.dest ??= this._defaults.dest

		this._getElements()
		this._render()
		this._configElements()
	}

	attributeChangedCallback(attribute, oldValue, newValue) {
		super.attributeChangedCallback(attribute, oldValue, newValue)
	}

	_getElements() {
		this._button = this.querySelector('button')
		this._dest = this.querySelector(this.dataset.dest)
		if (!this._button || !this._dest) console.error('!this.button || !this._dest')
		this._subDropDowns = this.querySelectorAll('drop-down')
	}

	_render() {
		if (!this.dataset.html) return
		if (!this.dataset.html.includes('template')) return

		this._renderTemplate()
	}

	_renderTemplate() {
		if (!this.dataset.template) throw new Error('this.dataset.template', this.dataset.template)

		let template
		if (this.dataset.template === 'ex') {
			template = document.createElement('template')
			template.innerHTML = DropDown._exHTML
			template = template.content.cloneNode(true)
		}
		else {
			template = document.getElementById(this.dataset.template)
			template = template.content.cloneNode(true)
		}

		if (this.dataset.html.includes('-prepend')) {
			this.prepend(template)
		}

		if (this.dataset.html.includes('-append')) {
			this.append(template)
		}

		if (this.dataset.html.includes('-replace')) {
			this.replaceChildren(template)
		}
	}

	_configElements() {
		if (this._dest) {
			// sometimes content is not yet there at this point
			this._dest.role = 'menu'
			if (!this._dest.id) {
				this._dest.id = Math.trunc(Math.random() * 1000)
			}
			this._dest.classList.add(this._classContent)
			this._button.setAttribute('aria-controls', this._dest.id)
		}
		else {
			console.warn('this._dest', this._dest)
		}

		// button
		if (this._button) {
			this._button.ariaLabel = 'menu button'
			this._button.ariaHasPopup = 'menu' //  indicates the availability and type of interactive popup element that can be triggered by the element on which the attribute is set.
			this._button.ariaExpanded = 'false'

			// event listeners
			if (this.dataset.on === 'click') {
				if (this.dataset.off === 'self') {
					this._button.addEventListener('click', this._onClickButton)
				}
				if (this.dataset.off === 'any') {
					document.addEventListener('click', this._onClickDocument)
				}
			}
			if (this.dataset.on === 'hover') {
				this._button.addEventListener('mouseover', this._switchOn)
				this._button.addEventListener('click', this._onClickButton)
				this.addEventListener('mouseleave', this._switchOff)
			}
		}

		if (this.dataset.anim === 'slide-rl') {
			let delay = 1
			this.listItems = this.querySelectorAll('li')
			this.listItems.forEach(li => {
				li.style.setProperty('--delay', delay)
				delay++
			})
		}

		if (this.dataset.anim === 'unfold') {
			// 
			let delay = -100
			this.listItems = this.querySelectorAll('li')
			this.listItems.forEach(li => {
				li.style.setProperty('--delay', `${delay}ms`)
				delay += 100
			})
		}
	}

	_onClickButton = (evt) => {
		if (evt.target === this._button) {
			evt.stopImmediatePropagation()
			if (this.dataset.state === 'on') {
				this._switchOff()
			}
			else {
				this._switchOn()
			}
		}
	}

	_onClickDocument = (evt) => {
		if (this._button.contains(evt.target)) {
			evt.stopImmediatePropagation()
			if (this.dataset.state === 'on') {
				this._switchOff()
			}
			else {
				this._switchOn()
			}
		}
		else {
			this._switchOff()
		}
	}

	_switchOn = () => {
		this.dataset.state = 'on'
		if (this._button) {
			this._button.setAttribute('aria-expanded', 'true')
			this._button.dataset.state = 'on'
			this._button.classList.remove('off')
			this._button.classList.add('on')
		}
		if (this._dest) {
			this._dest.classList.remove('off')
			this._dest.classList.add('on')
		}
	}

	_switchOff = () => {
		this.dataset.state = 'off'
		if (this._button) {
			this._button.setAttribute('aria-expanded', 'false')
			this._button.dataset.state = 'off'
			this._button.classList.remove('on')
			this._button.classList.add('off')
		}
		if (this._subDropDowns) {
			this._subDropDowns.forEach(el => el.setAttribute('data-state', 'off'))	
		}
		if (this._dest) {
			this._dest.classList.remove('on')
			this._dest.classList.add('off')
		}
	}
}