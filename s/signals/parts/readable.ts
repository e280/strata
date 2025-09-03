
import {tracker} from "../../tracker/tracker.js"

export class Readable<V> {
	constructor(public sneak: V) {}

	get() {
		tracker.notifyRead(this)
		return this.sneak
	}

	get value() {
		return this.get()
	}
}

