
import {deep} from "@e280/stz"
import {Lens} from "../lens.js"
import {Chronicle} from "./types.js"
import {LensLike} from "../types.js"
import {_optic} from "../utils/optic-symbol.js"

export class Chrono<State> implements LensLike<State> {
	constructor(
		public limit: number,
		private basis: Lens<Chronicle<State>>,
	) {}

	get chronicle() {
		return this.basis.state
	}

	get state() {
		return this.basis.state.present
	}

	get undoable() {
		return this.chronicle.past.length
	}

	get redoable() {
		return this.chronicle.future.length
	}

	#mut<R>(chronicle: Chronicle<State>, fn: (state: State) => R) {
		const limit = Math.max(0, this.limit)
		const snapshot = deep.clone(this.chronicle.present) as State
		const result = fn(chronicle.present)
		chronicle.past.push(snapshot)
		chronicle.past = chronicle.past.slice(-limit)
		chronicle.future = []
		return result
	}

	/** progress forwards, depositing history into the past */
	async mutate<R>(fn: (state: State) => R): Promise<R> {
		return this.basis.mutate(chronicle => this.#mut(chronicle, fn))
	}

	/** step backwards into the past, by n steps */
	async undo(n = 1) {
		await this.basis.mutate(chronicle => {
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
		await this.basis.mutate(chronicle => {
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
		await this.basis.mutate(chronicle => {
			chronicle.past = []
			chronicle.future = []
		})
	}

	lens<State2>(selector: (state: State) => State2) {
		const lens = new Lens<State2>({
			registerLens: this.basis[_optic].registerLens,
			getState: () => selector(this.basis[_optic].getState().present),
			mutate: fn => this.basis[_optic].mutate(chronicle => {
				return this.#mut(chronicle, state => fn(selector(state)))
			}),
		})
		this.basis[_optic].registerLens(lens)
		return lens
	}
}

