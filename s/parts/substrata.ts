
import {debounce, deep, sub} from "@e280/stz"

import {Strata} from "./strata.js"
import {Mutator, Selector, State, Stratum, Substate} from "./types.js"

export class Substrata<ParentState extends State, S extends Substate> implements Stratum<S> {
	dispose: () => void
	onMutation = sub<[state: S]>()

	#immutable: S
	#dispatchMutation = debounce(0, (state: S) => this.onMutation.pub(state))

	constructor(
			private strata: Strata<ParentState>,
			private selector: Selector<ParentState, S>,
		) {

		const state = this.selector(this.strata.state)
		this.#immutable = deep.freeze(this.strata.options.clone(state))

		this.dispose = this.strata.onMutation(async parentState => {
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
		this.#immutable = deep.freeze(this.strata.options.clone(state))
	}

	get state(): S {
		return this.#immutable
	}

	async mutate(mutator: Mutator<S>) {
		await this.strata.mutate(parentState => mutator(this.selector(parentState)))
		return this.#immutable
	}

	substrata<Sub extends Substate>(selector: Selector<S, Sub>) {
		return this.strata.substrata(parentState => selector(this.selector(parentState)))
	}
}

