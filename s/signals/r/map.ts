
import {GMap} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export class RMap<K, V> extends GMap<K, V> {
	get size() {
		tracker.notifyRead(this)
		return super.size
	}

	;[Symbol.iterator]() {
		tracker.notifyRead(this)
		return super[Symbol.iterator]()
	}

	keys() {
		tracker.notifyRead(this)
		return super.keys()
	}

	values() {
		tracker.notifyRead(this)
		return super.values()
	}

	entries() {
		tracker.notifyRead(this)
		return super.entries()
	}

	forEach(callbackFn: (value: V, key: K, map: Map<K, V>) => void) {
		tracker.notifyRead(this)
		return super.forEach(callbackFn)
	}

	has(key: K) {
		tracker.notifyRead(this)
		return super.has(key)
	}

	get(key: K) {
		tracker.notifyRead(this)
		return super.get(key)
	}

	set(key: K, value: V) {
		const r = super.set(key, value)
		tracker.notifyWrite(this)
		return r
	}

	delete(key: K) {
		const r = super.delete(key)
		tracker.notifyWrite(this)
		return r
	}

	clear() {
		super.clear()
		tracker.notifyWrite(this)
	}
}

