
import {debounce, deep} from "@e280/stz"
import {Branch} from "./branch.js"
import {trunkSetup} from "./utils/setup.js"
import {Chronobranch} from "./chronobranch.js"
import {SignalFn} from "../../signals/types.js"
import {signal} from "../../signals/porcelain.js"
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

	#immutable: SignalFn<Immutable<S>>
	#mutable: S
	#mutationLock = 0

	constructor(state: S, options: Partial<Options> = {}) {
		this.options = processOptions(options)
		this.#mutable = state
		this.#immutable = signal(this.#makeImmutableClone())
	}

	get state() {
		return this.#immutable.get()
	}

	get on() {
		return this.#immutable.on
	}

	#makeImmutableClone() {
		return deep.freeze(this.options.clone(this.#mutable)) as Immutable<S>
	}

	#debouncedPublish = debounce(0, async() => this.#immutable.publish())

	async mutate(mutator: Mutator<S>) {
		const oldState = this.options.clone(this.#mutable)
		if (this.#mutationLock > 0)
			throw new Error("nested mutations are forbidden")
		let promise = Promise.resolve()
		try {
			this.#mutationLock++
			const value = this.#mutable
			mutator(value)
			const newState = value
			const isChanged = !deep.equal(newState, oldState)
			if (isChanged)
				promise = this.overwrite(newState)
		}
		finally { this.#mutationLock-- }
		await promise
		return this.#immutable.get()
	}

	async overwrite(state: S) {
		this.#mutable = state
		this.#immutable.sneak = this.#makeImmutableClone()
		await this.#debouncedPublish()
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

