
import {deep} from "@e280/stz"
import {Branch} from "./branch.js"
import {lazy, Lazy} from "../../signals/parts/lazy.js"
import {processOptions} from "./utils/process-options.js"
import {signal, Signal} from "../../signals/parts/signal.js"
import {Branchstate, Immutable, Mutator, Options, Selector, Tree, Trunkstate} from "./types.js"

export class Trunk<S extends Trunkstate> implements Tree<S> {
	state: Lazy<Immutable<S>>
	options: Options

	#mutable: Signal<S>
	#mutationLock = 0

	constructor(state: S, options: Partial<Options> = {}) {
		this.options = processOptions(options)
		this.#mutable = signal(state)
		this.state = lazy(() =>
			deep.freeze(this.options.clone(this.#mutable.get())) as Immutable<S>
		)
	}

	async mutate(mutator: Mutator<S>) {
		const oldState = this.options.clone(this.#mutable.get())
		if (this.#mutationLock > 0)
			throw new Error("nested mutations are forbidden")
		this.#mutationLock++
		try { mutator(this.#mutable()) }
		finally { this.#mutationLock-- }
		const newState = this.#mutable.get()
		const isChanged = !deep.equal(newState, oldState)
		if (isChanged) await this.overwrite(newState)
		return this.state.get()
	}

	async overwrite(state: S) {
		await this.#mutable.publish(state)
	}

	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S> {
		return new Branch(this, selector, this.options)
	}
}

