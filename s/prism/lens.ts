
import {deep, microbounce, sub} from "@e280/stz"
import {immute} from "./utils/immute.js"
import {Immutable, Optic} from "./types.js"
import {tracker} from "../tracker/tracker.js"
import {CacheCell} from "./utils/cache-cell.js"

/** reactive view into a state prism, with formalized mutations */
export class Lens<State> {
	on = sub<[state: Immutable<State>]>()
	#previous: State
	#immutable: CacheCell<Immutable<State>>
	#onPublishDebounced = microbounce(() => this.on.publish(this.state))

	constructor(private optic: Optic<State>) {
		this.#previous = deep.clone(optic.getState())
		this.#immutable = new CacheCell(() => immute(optic.getState()))
	}

	async update() {
		const state = this.optic.getState()
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
		return this.optic.mutate(fn)
	}

	lens<State2>(selector: (state: State) => State2) {
		return new Lens<State2>({
			getState: () => selector(this.optic.getState()),
			mutate: fn => this.optic.mutate(state => fn(selector(state))),
		})
	}
}

