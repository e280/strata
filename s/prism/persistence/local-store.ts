
import {EzStore} from "./types.js"

export class LocalStore<X> implements EzStore<X> {
	constructor(
		private key: string,
		private storage: Storage = window.localStorage,
	) {}

	async get() {
		const json = this.storage.getItem(this.key)
		return json
			? JSON.parse(json)
			: undefined
	}

	async set(data: X) {
		const json = JSON.stringify(data)
		this.storage.setItem(this.key, json)
	}

	onChange(fn: () => void) {
		const listener = (event: StorageEvent) => {
			if (event.storageArea === this.storage && event.key === this.key)
				fn()
		}
		window.addEventListener("storage", listener)
		return () => window.removeEventListener("storage", listener)
	}
}

