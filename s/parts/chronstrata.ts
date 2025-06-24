
import {Substrata} from "./substrata.js"
import {Chronicle, Mutator, Options, Selector, Stratum, Substate} from "./types.js"

export class Chronstrata<ParentState extends Substate, S extends Substate> implements Stratum<S> {
	limit: number
	#substrata: Substrata<ParentState, Chronicle<S>>

	constructor(
			limit: number,
			public parent: Stratum<ParentState>,
			public selector: Selector<ParentState, Chronicle<S>>,
			public options: Options,
		) {
		this.limit = Math.max(1, limit)
		this.#substrata = parent.substrata(selector)
	}

	get state() {
		return this.#substrata.state.present
	}

	get undoable() {
		return this.#substrata.state.past.length
	}

	get redoable() {
		return this.#substrata.state.future.length
	}

	onMutation(fn: (state: S) => void) {
		return this.#substrata.onMutation(chronicle => fn(chronicle.present))
	}

	/** progress forwards in history */
	async mutate(mutator: Mutator<S>) {
		const snapshot = this.options.clone(this.#substrata.state.present)
		await this.#substrata.mutate(chronicle => {
			mutator(chronicle.present)
			chronicle.past.push(snapshot)
			chronicle.past = chronicle.past.slice(-this.limit)
			chronicle.future = []
		})
		return this.state
	}

	/** step backwards into the past, by n steps */
	async undo(n = 1) {
		await this.#substrata.mutate(chronicle => {
			const snapshots = chronicle.past.slice(-n)
			if (snapshots.length >= n) {
				const oldPresent = chronicle.present
				chronicle.present = snapshots.shift()!
				chronicle.past = chronicle.past.slice(0, -n)
				chronicle.future.unshift(oldPresent, ...snapshots)
			}
		})
	}

	/** step forwards into the future, by n steps */
	async redo(n = 1) {
		await this.#substrata.mutate(chronicle => {
			const snapshots = chronicle.future.slice(0, n)
			if (snapshots.length >= n) {
				const oldPresent = chronicle.present
				chronicle.present = snapshots.shift()!
				chronicle.past.push(oldPresent, ...snapshots)
				chronicle.future = chronicle.future.slice(n)
			}
		})
	}

	/** wipe past and future snapshots */
	async wipe() {
		await this.#substrata.mutate(chronicle => {
			chronicle.past = []
			chronicle.future = []
		})
	}

	substrata<Sub extends Substate>(selector: Selector<S, Sub>): Substrata<S, Sub> {
		return new Substrata(this, selector, this.options)
	}
}

