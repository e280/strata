
import {deep} from "@e280/stz"
import {Branch} from "./branch.js"
import {Chronobranch} from "./chronobranch.js"
import {processOptions} from "./utils/process-options.js"
import {DerivedSignal} from "../../signals/parts/derive.js"
import {signal, Signal} from "../../signals/parts/signal.js"
import {Branchstate, Chronicle, Immutable, Mutator, Options, Selector, Tree, Trunkstate} from "./types.js"

export class Trunk<S extends Trunkstate> implements Tree<S> {
	static chronicle = <S extends Branchstate>(state: S): Chronicle<S> => ({
		present: state,
		past: [],
		future: [],
	})

	options: Options

	#immutable: DerivedSignal<Immutable<S>>
	#mutable: Signal<S>
	#mutationLock = 0

	constructor(state: S, options: Partial<Options> = {}) {
		this.options = processOptions(options)
		this.#mutable = signal(state)
		this.#immutable = signal.derive(() =>
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
			mutator(this.#mutable())
			const newState = this.#mutable.get()
			const isChanged = !deep.equal(newState, oldState)
			if (isChanged)
				await this.overwrite(newState)
		}
		finally { this.#mutationLock-- }
		return this.#immutable.get()
	}

	async overwrite(state: S) {
		await this.#mutable.publish(state)
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

