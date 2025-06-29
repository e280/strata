
import {debounce, deep, sub} from "@e280/stz"

import {Branch} from "./branch.js"
import {trunkSetup} from "./utils/setup.js"
import {Chronobranch} from "./chronobranch.js"
import {tracker} from "../../tracker/tracker.js"
import {processOptions} from "./utils/process-options.js"
import {Chronicle, Mutator, Options, Selector, Treestate, Tree, Branchstate} from "./types.js"

export class Trunk<S extends Treestate> implements Tree<S> {
	static setup = trunkSetup
	static chronicle = <S extends Branchstate>(state: S): Chronicle<S> => ({
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

	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S> {
		return new Branch(this, selector, this.options)
	}

	chronobranch<Sub extends Branchstate>(
			limit: number,
			selector: Selector<Chronicle<Sub>, S>,
		) {
		return new Chronobranch(limit, this, selector, this.options)
	}

	#dispatchMutation = debounce(0, async() => {
		this.#mutationLock++
		try { await this.watch.pub(this.#immutable) }
		finally { this.#mutationLock-- }
		await tracker.change(this)
	})
}

