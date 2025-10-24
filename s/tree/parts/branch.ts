
import {deep} from "@e280/stz"
import {Branchstate, Immutable, Mutator, TreeOptions, Selector, Tree} from "./types.js"

export class Branch<S extends Branchstate, ParentState extends Branchstate = any> implements Tree<S> {
	#previous: Immutable<S>

	constructor(
			private parent: Tree<ParentState>,
			private selector: Selector<S, ParentState>,
			private options: TreeOptions,
		) {
		this.#previous = this.state
	}

	get state() {
		return this.selector(this.parent.state as ParentState) as Immutable<S>
	}

	on = (fn: (state: Immutable<S>) => void) => {
		return this.parent.on(parentState => {
			const oldState = this.#previous
			const newState = this.selector(parentState as ParentState) as Immutable<S>
			if (!deep.equal(newState, oldState)) {
				this.#previous = newState
				fn(newState)
			}
		})
	}

	async mutate(mutator: Mutator<S>) {
		await this.parent.mutate(parentState =>
			mutator(this.selector(parentState))
		)
		return this.state
	}

	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S> {
		return new Branch(this, selector, this.options)
	}
}

