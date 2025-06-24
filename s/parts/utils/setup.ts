
import {debounce} from "@e280/stz"

import {Strata} from "../strata.js"
import {State, SetupOptions} from "../types.js"
import {localPersistence} from "../persistence.js"

export async function strataSetup<S extends State>(options: SetupOptions<S>) {
	const {
		version,
		initialState,
		saveDebounceTime = 500,
		persistence = localPersistence("strata"),
	} = options

	const strata = new Strata<S>(initialState)

	async function load() {
		const pickle = await persistence.store.get()
		if (pickle && pickle.version === version)
			await strata.overwrite(pickle.state)
	}

	const save = debounce(saveDebounceTime, async() => persistence.store.set({
		version,
		state: strata.state,
	}))

	// persistence: initial load from store
	await load()

	// persistence: save to store
	strata.watch(save)

	// cross-tab sync
	const dispose = persistence.onChange(load)

	return {strata, load, save, dispose}
}

