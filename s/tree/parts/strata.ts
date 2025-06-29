
import {debounce, deep, sub} from "@e280/stz"

import {Substrata} from "./substrata.js"
import {strataSetup} from "./utils/setup.js"
import {Chronstrata} from "./chronstrata.js"
import {tracker} from "../../tracker/tracker.js"
import {processOptions} from "./utils/process-options.js"
import {Chronicle, Mutator, Options, Selector, State, Stratum, Substate} from "./types.js"

export class Strata<S extends State> implements Stratum<S> {
	static setup = strataSetup
	static chronicle = <S extends Substate>(state: S): Chronicle<S> => ({
		present: state,
		past: [],
		future: [],
	})

	options: Options
	watch = sub<[state: S]>()

	#mutable: S
	#immutable: S
	#mutationLock = 0

	constructor(state: S, options: Partial<Options> = {}) {
		this.options = processOptions(options)
		this.#mutable = state
		this.#immutable = deep.freeze(this.options.clone(state))
	}

	get state() {
		tracker.see(this)
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
		if (isChanged) await this.overwrite(newState)
		return this.#immutable
	}

	async overwrite(state: S) {
		this.#mutable = state
		this.#immutable = deep.freeze(this.options.clone(state))
		await this.#dispatchMutation()
	}

	substrata<Sub extends Substate>(selector: Selector<Sub, S>): Substrata<Sub, S> {
		return new Substrata(this, selector, this.options)
	}

	chronstrata<Sub extends Substate>(
			limit: number,
			selector: Selector<Chronicle<Sub>, S>,
		) {
		return new Chronstrata(limit, this, selector, this.options)
	}

	#dispatchMutation = debounce(0, async() => {
		this.#mutationLock++
		try { await this.watch.pub(this.#immutable) }
		finally { this.#mutationLock-- }
		tracker.change(this)
	})
}

