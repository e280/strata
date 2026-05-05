
import {GSet} from "@e280/stz"
import {tracker} from "../../tracker/global.js"

export class RSet<T> extends GSet<T> {

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

	values() {
		tracker.read(this)
		return super.values()
	}

	has(item: T) {
		tracker.read(this)
		return super.has(item)
	}

	//
	// writing
	//

	add(item: T) {
		super.add(item)
		tracker.write(this)
		return this
	}

	delete(item: T) {
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

