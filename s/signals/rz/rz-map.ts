
import {MapG} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export class RzMap<K, V> {
	#map: MapG<K, V>

	constructor(entries?: [K, V][]) {
		this.#map = new MapG(entries)
	}

	get size() {
		tracker.notifyRead(this)
		return this.#map.size
	}

	;[Symbol.iterator]() {
		tracker.notifyRead(this)
		return this.#map[Symbol.iterator]()
	}

	keys() {
		tracker.notifyRead(this)
		return this.#map.keys()
	}

	values() {
		tracker.notifyRead(this)
		return this.#map.values()
	}

	entries() {
		tracker.notifyRead(this)
		return this.#map.entries()
	}

	has(key: K) {
		tracker.notifyRead(this)
		return this.#map.has(key)
	}

	get(key: K): V | undefined {
		tracker.notifyRead(this)
		return this.#map.get(key)
	}

	require(key: K): V {
		tracker.notifyRead(this)
		return this.#map.require(key)
	}

	guarantee(key: K, makeFn: () => V): V {
		tracker.notifyRead(this)
		tracker.notifyWrite(this)
		return this.#map.guarantee(key, makeFn)
	}

	async set(key: K, value: V) {
		this.#map.set(key, value)
		await tracker.notifyWrite(this)
	}

	async delete(key: K) {
		this.#map.delete(key)
		await tracker.notifyWrite(this)
	}

	async clear() {
		this.#map.clear()
		await tracker.notifyWrite(this)
	}
}

