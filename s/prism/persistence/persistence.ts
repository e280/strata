
import {PersistenceOptions} from "./types.js"

export class Persistence<State> {
	constructor(private options: PersistenceOptions<State>) {}

	load = async() => {
		const {store, version, prism} = this.options
		const pickle = await store.get()
		if (pickle && pickle.version === version)
			await prism.set(pickle.state)
	}

	save = async() => {
		const {store, version, prism} = this.options
		await store.set({version, state: prism.get()})
	}
}

