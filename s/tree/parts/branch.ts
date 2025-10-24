
import {deep} from "@e280/stz"
import {SignalFn} from "../../signals/types.js"
import {signal} from "../../signals/porcelain.js"
import {Branchstate, Immutable, Mutator, TreeOptions, Selector, Tree} from "./types.js"

export class Branch<S extends Branchstate, ParentState extends Branchstate = any> implements Tree<S> {
	#previous: Immutable<S>
	#$data: SignalFn<Immutable<S>>

	constructor(
			private parent: Tree<ParentState>,
			private selector: Selector<S, ParentState>,
			private options: TreeOptions,
		) {

		this.#$data = signal(this.#pull())
		this.#previous = this.state

		this.parent.on(() => {
			const oldState = this.#previous
			const newState = this.#pull()
			if (!deep.equal(newState, oldState)) {
				this.#previous = newState
				this.#$data.set(newState, true)
			}
		})
	}

	#pull() {
		return this.selector(this.parent.state as ParentState) as Immutable<S>
	}

	get state() {
		return this.#$data.get()
	}

	get on() {
		return this.#$data.on
	}

	async mutate(mutator: Mutator<S>) {
		await this.parent.mutate(
			parentState => mutator(this.selector(parentState))
		)
		return this.state
	}

	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S> {
		return new Branch(this, selector, this.options)
	}
}

