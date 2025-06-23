
import {debounce, deep, sub} from "@e280/stz"

import {Substrata} from "./substrata.js"
import {processOptions} from "./utils/process-options.js"
import {Mutator, Options, Selector, State, Substate} from "./types.js"

export class Strata<S extends State> {
	onMutation = sub<[state: S]>()

	#options: Options
	#mutable: S
	#immutable: S
	#dispatchMutation = debounce(0, (state: S) => this.onMutation.pub(state))

	constructor(state: S, options: Partial<Options> = {}) {
		this.#options = processOptions(options)
		this.#mutable = state
		this.#immutable = deep.freeze(this.#options.clone(state))
	}

	#updateState(state: S) {
		this.#mutable = state
		this.#immutable = deep.freeze(this.#options.clone(state))
	}

	get state() {
		return this.#immutable
	}

	substrata<Sub extends Substate>(selector: Selector<S, Sub>) {
		return new Substrata(this, selector, this.#options)
	}

	async mutate(mutator: Mutator<S>) {
		const oldState = this.#options.clone(this.#mutable)
		mutator(this.#mutable)
		const newState = this.#mutable
		const isChanged = !deep.equal(newState, oldState)
		if (isChanged) {
			this.#updateState(newState)
			const immutable = this.state
			await this.#dispatchMutation(immutable)
		}
		return this.#immutable
	}
}

