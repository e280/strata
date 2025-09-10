
import {deep} from "@e280/stz"
import {Branch} from "./branch.js"
import {signal} from "../../signals/porcelain.js"
import {trunkSetup} from "./utils/setup.js"
import {Derived} from "../../signals/core/derived.js"
import {Signal} from "../../signals/core/signal.js"
import {Chronobranch} from "./chronobranch.js"
import {processOptions} from "./utils/process-options.js"
import {Branchstate, Chronicle, Immutable, Mutator, Options, Selector, Tree, Trunkstate} from "./types.js"

export class Trunk<S extends Trunkstate> implements Tree<S> {
	static setup = trunkSetup
	static chronicle = <S extends Branchstate>(state: S): Chronicle<S> => ({
		present: state,
		past: [],
		future: [],
	})

	options: Options

	#immutable: Derived<Immutable<S>>
	#mutable: Signal<S>
	#mutationLock = 0

	constructor(state: S, options: Partial<Options> = {}) {
		this.options = processOptions(options)
		this.#mutable = signal(state)
		this.#immutable = signal.derived(() =>
			deep.freeze(this.options.clone(this.#mutable.get())) as Immutable<S>
		)
	}

	get state() {
		return this.#immutable.get()
	}

	get on() {
		return this.#immutable.on
	}

	async mutate(mutator: Mutator<S>) {
		const oldState = this.options.clone(this.#mutable.get())
		if (this.#mutationLock > 0)
			throw new Error("nested mutations are forbidden")
		try {
			this.#mutationLock++
			const value = this.#mutable.get()
			mutator(value)
			const newState = value
			const isChanged = !deep.equal(newState, oldState)
			if (isChanged)
				await this.overwrite(newState)
		}
		finally { this.#mutationLock-- }
		return this.#immutable.get()
	}

	async overwrite(state: S) {
		await this.#mutable.set(state, true)
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

