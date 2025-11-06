
import {deep} from "@e280/stz"
import {Branch} from "./branch.js"
import {Immute} from "./utils/immute.js"
import {trunkSetup} from "./utils/setup.js"
import {Chronobranch} from "./chronobranch.js"
import {processOptions} from "./utils/process-options.js"
import {Branchstate, Mutator, TreeOptions, Selector, Tree, Trunkstate} from "./types.js"
import {Chronicle} from "../../prism/index.js"

/** @deprecated tree stuff has been replaced by prism/lens stuff */
export class Trunk<S extends Trunkstate> implements Tree<S> {
	static setup = trunkSetup
	static chronicle = <S extends Branchstate>(state: S): Chronicle<S> => ({
		present: state,
		past: [],
		future: [],
	})

	options: TreeOptions
	#mutationLock = 0
	#immute: Immute<S>

	constructor(state: S, options: Partial<TreeOptions> = {}) {
		this.options = processOptions(options)
		this.#immute = new Immute(state, this.options)
	}

	get state() {
		return this.#immute.immutable
	}

	get on() {
		return this.#immute.on
	}

	async mutate(mutator: Mutator<S>) {
		const oldState = this.#immute.get()
		if (this.#mutationLock > 0)
			throw new Error("nested mutations are forbidden")
		let promise = Promise.resolve()
		try {
			this.#mutationLock++
			const newState = this.options.clone(oldState)
			mutator(newState)
			const isChanged = !deep.equal(newState, oldState)
			if (isChanged)
				promise = this.overwrite(newState)
		}
		finally { this.#mutationLock-- }
		await promise
		return this.state
	}

	async overwrite(state: S) {
		await this.#immute.set(state)
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
}

