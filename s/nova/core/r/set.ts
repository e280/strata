
import {GSet} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export class RSet<T> extends GSet<T> {
	get size() {
		tracker.read(this)
		return super.size
	}

	;[Symbol.iterator]() {
		tracker.read(this)
		return super[Symbol.iterator]()
	}

	values() {
		tracker.read(this)
		return super.values()
	}

	has(item: T) {
		tracker.read(this)
		return super.has(item)
	}

	add(item: T) {
		super.add(item)
		tracker.write(this)
		return this
	}

	delete(item: T) {
		const r = super.delete(item)
		tracker.write(this)
		return r
	}

	clear() {
		super.clear()
		tracker.write(this)
		return this
	}
}

