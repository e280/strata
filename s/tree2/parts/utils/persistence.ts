
import {Persistence} from "../types.js"

export const localPersistence = <X>(
		key: string,
		storage: Storage = window.localStorage,
	): Persistence<X> => ({

	store: {
		async get() {
			const json = storage.getItem(key)
			return json
				? JSON.parse(json)
				: undefined
		},
		async set(state) {
			const json = JSON.stringify(state)
			storage.setItem(key, json)
		},
	},

	onChange: (fn: () => void) => {
		const listener = (event: StorageEvent) => {
			if (event.storageArea === storage && event.key === key)
				fn()
		}
		window.addEventListener("storage", listener)
		return () => window.removeEventListener("storage", listener)
	},
})

