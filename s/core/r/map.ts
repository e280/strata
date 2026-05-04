
import {GMap} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export class RMap<K, V> extends GMap<K, V> {
	get size() {
		tracker.read(this)
		return super.size
	}

	;[Symbol.iterator]() {
		tracker.read(this)
		return super[Symbol.iterator]()
	}

	keys() {
		tracker.read(this)
		return super.keys()
	}

	values() {
		tracker.read(this)
		return super.values()
	}

	entries() {
		tracker.read(this)
		return super.entries()
	}

	forEach(callbackFn: (value: V, key: K, map: Map<K, V>) => void) {
		tracker.read(this)
		return super.forEach(callbackFn)
	}

	has(key: K) {
		tracker.read(this)
		return super.has(key)
	}

	get(key: K) {
		tracker.read(this)
		return super.get(key)
	}

	set(key: K, value: V) {
		const r = super.set(key, value)
		tracker.write(this)
		return r
	}

	delete(key: K) {
		const r = super.delete(key)
		tracker.write(this)
		return r
	}

	clear() {
		super.clear()
		tracker.write(this)
		return this
	}
}

