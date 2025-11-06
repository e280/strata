
import {deep, microbounce, sub} from "@e280/stz"
import {immute} from "./utils/immute.js"
import {tracker} from "../tracker/tracker.js"
import {_optic} from "./utils/optic-symbol.js"
import {CacheCell} from "./utils/cache-cell.js"
import {Immutable, LensLike, Optic} from "./types.js"

/** reactive view into a state prism, with formalized mutations */
export class Lens<State> implements LensLike<State> {
	on = sub<[state: Immutable<State>]>()

	;[_optic]: Optic<State>
	#previous: State
	#immutable: CacheCell<Immutable<State>>
	#onPublishDebounced = microbounce(() => this.on.publish(this.state))

	constructor(optic: Optic<State>) {
		this[_optic] = optic
		this.#previous = deep.clone(optic.getState())
		this.#immutable = new CacheCell(() => immute(optic.getState()))
	}

	async update() {
		const state = this[_optic].getState()
		const isChanged = !deep.equal(state, this.#previous)
		if (isChanged) {
			this.#immutable.invalidate()
			this.#previous = deep.clone(state)
			this.#onPublishDebounced()
			await tracker.notifyWrite(this)
		}
	}

	get state() {
		tracker.notifyRead(this)
		return this.#immutable.get()
	}

	async mutate<R>(fn: (state: State) => R) {
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

