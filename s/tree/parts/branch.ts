
import {debounce, deep, sub} from "@e280/stz"

import {Chronobranch} from "./chronobranch.js"
import {tracker} from "../../tracker/tracker.js"
import {Chronicle, Mutator, Options, Selector, Tree, Branchstate, Immutable} from "./types.js"

export class Branch<S extends Branchstate, ParentState extends Branchstate = any> implements Tree<S> {
	dispose: () => void
	watch = sub<[state: Immutable<S>]>()

	#immutable: Immutable<S>
	#dispatchMutation = debounce(0, async(state: Immutable<S>) => {
		await this.watch.pub(state)
		await tracker.change(this)
	})

	constructor(
			private parent: Tree<ParentState>,
			private selector: Selector<S, ParentState>,
			private options: Options,
		) {

		const state = this.selector(this.parent.state as ParentState)
		this.#immutable = deep.freeze(this.options.clone(state)) as Immutable<S>

		this.dispose = this.parent.watch(async parentState => {
			const oldState = this.#immutable
			const newState = this.selector(parentState as ParentState)
			const isChanged = !deep.equal(newState, oldState)
			if (isChanged) {
				this.#updateState(newState)
				const immutable = this.state
				await this.#dispatchMutation(immutable)
			}
		})
	}

	#updateState(state: S) {
		this.#immutable = deep.freeze(this.options.clone(state)) as Immutable<S>
	}

	get state(): Immutable<S> {
		tracker.see(this)
		return this.#immutable
	}

	async mutate(mutator: Mutator<S>) {
		await this.parent.mutate(parentState => mutator(this.selector(parentState as any)))
		return this.#immutable
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

