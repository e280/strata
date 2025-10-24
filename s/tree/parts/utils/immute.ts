
import {deep, microbounce, sub} from "@e280/stz"
import {Immutable, Options} from "../types.js"
import {tracker} from "../../../tracker/tracker.js"

export class Immute<S> {
	#mutable: S
	#immutable: Immutable<S>

	constructor(mutable: S, private options: Options) {
		this.#mutable = mutable
		this.#immutable = this.#petrify(mutable)
	}

	#petrify<X>(x: X) {
		return deep.freeze(
			this.options.clone(x)
		) as Immutable<X>
	}

	on = sub<[Immutable<S>]>()
	#debouncePublish = microbounce(async() => this.on.publish(this.#immutable))

	get() {
		tracker.notifyRead(this)
		return this.#mutable
	}

	async set(mutable: S) {
		this.#mutable = mutable
		this.#immutable = deep.freeze(this.options.clone(this.get())) as Immutable<S>
		await Promise.all([
			this.#debouncePublish(),
			tracker.notifyWrite(this),
		])
	}

	get immutable() {
		tracker.notifyRead(this)
		return this.#immutable
	}
}

