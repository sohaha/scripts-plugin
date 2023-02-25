import Plugin from '@swup/plugin';

const arrayify = (list) => Array.prototype.slice.call(list);

export default class ScriptsPlugin extends Plugin {
	name = 'ScriptsPlugin';

	constructor(options) {
		super();

		const defaultOptions = {
			head: true,
			body: true,
			optin: false
		};

		this.options = {
			...defaultOptions,
			...options
		};
	}

	mount() {
		this.swup.on('contentReplaced', this.runScripts);
	}

	unmount() {
		this.swup.off('contentReplaced', this.runScripts);
	}

	runScripts = () => {
		const scope =
			this.options.head && this.options.body
				? document
				: this.options.head
					? document.head
					: document.body;

		const selector = this.options.optin ? 'script[data-reload-script]' : 'script:not([data-ignore-script])';
		const scripts = arrayify(scope.querySelectorAll(selector));

		scripts.forEach((script) => this.runScript(script))
	};

	runScript = (originalElement) => {
		const element = document.createElement('script');

		for (const { name, value } of arrayify(originalElement.attributes)) {
			element.setAttribute(name, value);
		}
		element.textContent = originalElement.textContent;
		element.setAttribute('async', 'false');

		const url = element.attributes.src ? element.attributes.src.value : ""
		// console.log(url);
		if (url) {
			function done() {
				const event = new CustomEvent("loaded-script:" + url)
				document.dispatchEvent(event)
			}
			element.addEventListener("load", done)
		}
		originalElement.replaceWith(element);
		return element;
	};
}
