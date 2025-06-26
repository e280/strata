
import {debounce, deep, sub, tracker} from "@e280/stz"

import {Chronstrata} from "./chronstrata.js"
import {Chronicle, Mutator, Options, Selector, Stratum, Substate} from "./types.js"

export class Substrata<S extends Substate, ParentState extends Substate = any> implements Stratum<S> {
	dispose: () => void
	watch = sub<[state: S]>()

	#immutable: S
	#dispatchMutation = debounce(0, async(state: S) => {
		await this.watch.pub(state)
		tracker.change(this)
	})

	constructor(
			private parent: Stratum<ParentState>,
			private selector: Selector<S, ParentState>,
			private options: Options,
		) {

		const state = this.selector(this.parent.state)
		this.#immutable = deep.freeze(this.options.clone(state))

		this.dispose = this.parent.watch(async parentState => {
			const oldState = this.#immutable
			const newState = this.selector(parentState)
			const isChanged = !deep.equal(newState, oldState)
			if (isChanged) {
				this.#updateState(newState)
				const immutable = this.state
				await this.#dispatchMutation(immutable)
			}
		})
	}

	#updateState(state: S) {
		this.#immutable = deep.freeze(this.options.clone(state))
	}

	get state(): S {
		tracker.see(this)
		return this.#immutable
	}

	async mutate(mutator: Mutator<S>) {
		await this.parent.mutate(parentState => mutator(this.selector(parentState)))
		return this.#immutable
	}

	substrata<Sub extends Substate>(selector: Selector<Sub, S>): Substrata<Sub, S> {
		return new Substrata(this, selector, this.options)
	}

	chronstrata<Sub extends Substate>(
			limit: number,
			selector: Selector<Chronicle<Sub>, S>,
		) {
		return new Chronstrata(limit, this, selector, this.options)
	}
}

