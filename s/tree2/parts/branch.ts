
import {deep} from "@e280/stz"
import {computed, Computed} from "../../signals/parts/computed.js"
import {Branchstate, Immutable, Mutator, Options, Selector, Tree} from "./types.js"

export class Branch<S extends Branchstate, ParentState extends Branchstate = any> implements Tree<S> {
	state: Computed<Immutable<S>>

	constructor(
			private parent: Tree<ParentState>,
			private selector: Selector<S, ParentState>,
			private options: Options,
		) {

		this.state = computed(() => {
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

