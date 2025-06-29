
import {Branch} from "./branch.js"
import {Chronicle, Mutator, Options, Selector, Tree, Branchstate} from "./types.js"

export class Chronobranch<S extends Branchstate, ParentState extends Branchstate = any> implements Tree<S> {
	#substrata: Branch<Chronicle<S>, ParentState>

	constructor(
			public limit: number,
			public parent: Tree<ParentState>,
			public selector: Selector<Chronicle<S>, ParentState>,
			public options: Options,
		) {
		this.#substrata = parent.branch(selector)
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

	watch(fn: (state: S) => void) {
		return this.#substrata.watch(chronicle => fn(chronicle.present))
	}

	/** progress forwards in history */
	async mutate(mutator: Mutator<S>) {
		const limit = Math.max(0, this.limit)
		const snapshot = this.options.clone(this.#substrata.state.present)
		await this.#substrata.mutate(chronicle => {
			mutator(chronicle.present)
			chronicle.past.push(snapshot)
			chronicle.past = chronicle.past.slice(-limit)
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

	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S> {
		return new Branch(this, selector, this.options)
	}
}

