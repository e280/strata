
import {debounce, deep, sub} from "@e280/stz"

import {Substrata} from "./substrata.js"
import {Chronstrata} from "./chronstrata.js"
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
	#mutationLock = 0
	#dispatchMutation = debounce(0, async(state: S) => {
		this.#mutationLock++
		try { await this.onMutation.pub(state) }
		finally { this.#mutationLock-- }
	})

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
		if (this.#mutationLock > 0)
			throw new Error("nested mutations are forbidden")
		this.#mutationLock++
		try { mutator(this.#mutable) }
		finally { this.#mutationLock-- }
		const newState = this.#mutable
		const isChanged = !deep.equal(newState, oldState)
		if (isChanged) {
			this.#updateState(newState)
			const immutable = this.state
			await this.#dispatchMutation(immutable)
		}
		return this.#immutable
	}

	substrata<Sub extends Substate>(selector: Selector<S, Sub>): Substrata<S, Sub> {
		return new Substrata(this, selector, this.options)
	}

	chronstrata<Sub extends Substate>(
			limit: number,
			selector: Selector<S, Chronicle<Sub>>,
		) {
		return new Chronstrata(limit, this, selector, this.options)
	}
}

