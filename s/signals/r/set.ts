
import {GSet} from "@e280/stz"
import {tracker} from "../../tracker/global.js"

export class RSet<V> extends GSet<V> {

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

	forEach(callbackFn: (value: V, value2: V, set: RSet<V>) => void) {
		tracker.read(this)
		for (const value of this)
			callbackFn(value, value, this)
		return this
	}

	values() {
		tracker.read(this)
		return super.values()
	}

	has(item: V) {
		tracker.read(this)
		return super.has(item)
	}

	//
	// writing
	//

	add(item: V) {
		super.add(item)
		tracker.write(this)
		return this
	}

	delete(item: V) {
		const ret = super.delete(item)
		tracker.write(this)
		return ret
	}

	clear() {
		super.clear()
		tracker.write(this)
		return this
	}
}

