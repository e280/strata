
import {debounce, deep, sub} from "@e280/stz"

import {Substrata} from "./substrata.js"
import {Historical} from "./historical.js"
import {processOptions} from "./utils/process-options.js"
import {Chronicle, Mutator, Options, Selector, State, Stratum, Substate} from "./types.js"

export class Strata<S extends State> implements Stratum<S> {
	static chronicle = <S extends Substate>(state: S): Chronicle<S> => ({
		present: state,
		past: [],
		future: [],
	})

	onMutation = sub<[state: S]>()

	options: Options
	#mutable: S
	#immutable: S
	#mutationLock = false
	#dispatchMutation = debounce(0, (state: S) => this.onMutation.pub(state))

	constructor(state: S, options: Partial<Options> = {}) {
		this.options = processOptions(options)
		this.#mutable = state
		this.#immutable = deep.freeze(this.options.clone(state))
	}

	#updateState(state: S) {
		this.#mutable = state
		this.#immutable = deep.freeze(this.options.clone(state))
	}

	get state() {
		return this.#immutable
	}

	async mutate(mutator: Mutator<S>) {
		const oldState = this.options.clone(this.#mutable)
		if (this.#mutationLock)
			throw new Error("nested mutations are forbidden")
		this.#mutationLock = true
		mutator(this.#mutable)
		this.#mutationLock = false
		const newState = this.#mutable
		const isChanged = !deep.equal(newState, oldState)
		if (isChanged) {
			this.#updateState(newState)
			const immutable = this.state
			await this.#dispatchMutation(immutable)
		}
		return this.#immutable
	}

	substrata<Sub extends Substate>(selector: Selector<S, Sub>) {
		return new Substrata(this, selector)
	}

	historical<Sub extends Substate>(
			limit: number,
			selector: Selector<S, Chronicle<Sub>>,
		) {
		return new Historical(limit, this, selector)
	}
}

