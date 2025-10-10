
import {GSet} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export class RSet<T> extends GSet<T> {
	get size() {
		tracker.notifyRead(this)
		return super.size
	}

	;[Symbol.iterator]() {
		tracker.notifyRead(this)
		return super[Symbol.iterator]()
	}

	values() {
		tracker.notifyRead(this)
		return super.values()
	}

	has(item: T) {
		tracker.notifyRead(this)
		return super.has(item)
	}

	add(item: T) {
		super.add(item)
		tracker.notifyWrite(this)
		return this
	}

	delete(item: T) {
		const r = super.delete(item)
		tracker.notifyWrite(this)
		return r
	}

	clear() {
		super.clear()
		tracker.notifyWrite(this)
		return this
	}
}

