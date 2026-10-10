
import {subby} from "@e280/stz"
import {Lens} from "./lens.js"
import {tracker} from "../tracker/global.js"

/** state mangagement source-of-truth */
export class Prism<State> {
	#state: State
	#lenses = new Set<Lens<any>>()
	#on = subby<[state: State]>()

	constructor(state: State) {
		this.#state = state
	}

	get on() {
		return this.#on.on
	}

	get() {
		tracker.read(this)
		return this.#state
	}

	set(state: State) {
		this.#state = state
		for (const lens of this.#lenses) lens.update()
		tracker.write(this)
		this.#on.publish(this.#state)
	}

	lens<State2>(selector: (state: State) => State2) {
		const lens = new Lens<State2>({
			getState: () => selector(this.#state),
			mutate: fn => {
				const result = fn(selector(this.#state))
				this.set(this.#state)
				return result
			},
			registerLens: lens => this.#lenses.add(lens),
		})
		this.#lenses.add(lens)
		return lens
	}
}

