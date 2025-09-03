
import {sub} from "@e280/stz"
import {Readable} from "./readable.js"

export class Reactive<V> extends Readable<V> {
	on = sub<[V]>()

	dispose() {
		this.on.clear()
	}
}

