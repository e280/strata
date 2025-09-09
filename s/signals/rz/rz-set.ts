
import {SetG} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export class RzSet<T> {
	#set: SetG<T>

	constructor(items?: T[]) {
		this.#set = new SetG(items)
	}

	get size() {
		tracker.notifyRead(this)
		return this.#set.size
	}

	;[Symbol.iterator]() {
		tracker.notifyRead(this)
		return this.#set[Symbol.iterator]()
	}

	values() {
		tracker.notifyRead(this)
		return this.#set.values()
	}

	has(...items: T[]) {
		tracker.notifyRead(this)
		return this.#set.hasAll(...items)
	}

	async add(...items: T[]) {
		this.#set.adds(...items)
		await tracker.notifyWrite(this)
	}

	async delete(...items: T[]) {
		this.#set.deletes(...items)
		await tracker.notifyWrite(this)
	}

	async clear() {
		this.#set.clear()
		await tracker.notifyWrite(this)
	}
}

