
import {deep} from "@e280/stz"
import {signal} from "../../signals/signal.js"
import {DerivedSignal} from "../../signals/parts/derive.js"
import {Branchstate, Immutable, Mutator, Options, Selector, Tree} from "./types.js"

export class Branch<S extends Branchstate, ParentState extends Branchstate = any> implements Tree<S> {
	#immutable: DerivedSignal<Immutable<S>>

	constructor(
			private parent: Tree<ParentState>,
			private selector: Selector<S, ParentState>,
			private options: Options,
		) {

		this.#immutable = signal.derive(() => {
			const state = selector(parent.state as any)
			return deep.freeze(options.clone(state)) as Immutable<S>
		}, {compare: deep.equal})
	}

	get state() {
		return this.#immutable.get()
	}

	get on() {
		return this.#immutable.on
	}

	async mutate(mutator: Mutator<S>) {
		await this.parent.mutate(parentState =>
			mutator(this.selector(parentState))
		)
		return this.#immutable.get()
	}

	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S> {
		return new Branch(this, selector, this.options)
	}
}

