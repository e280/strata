
import {GMap} from "@e280/stz"
import {batch} from "../batch.js"
import {tracker} from "../../tracker/global.js"

export class RMap<K, V> extends GMap<K, V> {

	//
	// reading
	//

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

	//
	// writing
	//

	set(key: K, value: V) {
		super.set(key, value)
		tracker.write(this)
		return this
	}

	delete(key: K) {
		const ret = super.delete(key)
		tracker.write(this)
		return ret
	}

	setEntries(entries: Iterable<[K, V]>) {
		return batch(() => super.setEntries(entries))
	}

	clear() {
		super.clear()
		tracker.write(this)
		return this
	}
}

