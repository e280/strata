
import {deep} from "@e280/stz"
import {immute} from "./utils/immute.js"
import {tracker} from "../tracker/tracker.js"
import {_optic} from "./utils/optic-symbol.js"
import {CacheCell} from "./utils/cache-cell.js"
import {Immutable, LensLike, Optic} from "./types.js"

/** reactive view into a state prism, with formalized mutations */
export class Lens<State> implements LensLike<State> {
	;[_optic]: Optic<State>
	#previous: State
	#stateCache: CacheCell<State>
	#frozenCache: CacheCell<Immutable<State>>

	constructor(optic: Optic<State>) {
		this[_optic] = optic
		this.#previous = deep.clone(optic.getState())
		this.#stateCache = new CacheCell(() => deep.clone(optic.getState()))
		this.#frozenCache = new CacheCell(() => immute(optic.getState()))
	}

	update() {
		const state = this[_optic].getState()
		const isChanged = !deep.equal(state, this.#previous)
		if (isChanged) {
			this.#stateCache.invalidate()
			this.#frozenCache.invalidate()
			this.#previous = deep.clone(state)
			tracker.write(this)
		}
	}

	/** get a snapshot of the current state. it's typed as mutable, but you should not mutate it. */
	get state() {
		tracker.read(this)
		return this.#stateCache.get()
	}

	/** get an immutable readonly snapshot of the current state. */
	get frozen() {
		tracker.read(this)
		return this.#frozenCache.get()
	}

	mutate<R>(fn: (state: State) => R) {
		return this[_optic].mutate(fn)
	}

	lens<State2>(selector: (state: State) => State2) {
		const lens = new Lens<State2>({
			getState: () => selector(this[_optic].getState()),
			mutate: fn => this[_optic].mutate(state => fn(selector(state))),
			registerLens: this[_optic].registerLens,
		})
		this[_optic].registerLens(lens)
		return lens
	}
}

