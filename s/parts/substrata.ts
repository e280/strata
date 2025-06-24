
import {debounce, deep, sub} from "@e280/stz"
import {Mutator, Options, Selector, Stratum, Substate} from "./types.js"

export class Substrata<ParentState extends Substate, S extends Substate> implements Stratum<S> {
	dispose: () => void
	onMutation = sub<[state: S]>()

	#immutable: S
	#dispatchMutation = debounce(0, (state: S) => this.onMutation.pub(state))

	constructor(
			private parent: Stratum<ParentState>,
			private selector: Selector<ParentState, S>,
			private options: Options,
		) {

		const state = this.selector(this.parent.state)
		this.#immutable = deep.freeze(this.options.clone(state))

		this.dispose = this.parent.onMutation(async parentState => {
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
		return this.#immutable
	}

	async mutate(mutator: Mutator<S>) {
		await this.parent.mutate(parentState => mutator(this.selector(parentState)))
		return this.#immutable
	}

	substrata<Sub extends Substate>(selector: Selector<S, Sub>): Substrata<S, Sub> {
		return new Substrata(this, selector, this.options)
	}
}

