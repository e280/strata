
import {deep} from "@e280/stz"
import {lazy, Lazy} from "../../signals/parts/lazy.js"
import {Branchstate, Immutable, Mutator, Options, Selector, Tree} from "./types.js"

export class Branch<S extends Branchstate, ParentState extends Branchstate = any> implements Tree<S> {
	state: Lazy<Immutable<S>>

	constructor(
			private parent: Tree<ParentState>,
			private selector: Selector<S, ParentState>,
			private options: Options,
		) {

		this.state = lazy(() => {
			const state = selector(parent.state as any)
			return deep.freeze(options.clone(state)) as Immutable<S>
		})
	}

	async mutate(mutator: Mutator<S>) {
		await this.parent.mutate(parentState =>
			mutator(this.selector(parentState))
		)
		return this.state.get()
	}

	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S> {
		return new Branch(this, selector, this.options)
	}
}

