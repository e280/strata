
export class CacheCell<R> {
	#dirty = false
	#value: R

	constructor(private calculate: () => R) {
		this.#value = calculate()
	}

	get() {
		if (this.#dirty) {
			this.#dirty = false
			this.#value = this.calculate()
		}
		return this.#value
	}

	invalidate() {
		this.#dirty = true
	}
}

