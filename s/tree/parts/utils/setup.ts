
import {debounce} from "@e280/stz"

import {Trunk} from "../trunk.js"
import {Treestate, SetupOptions} from "../types.js"
import {localPersistence} from "../persistence.js"

export async function trunkSetup<S extends Treestate>(options: SetupOptions<S>) {
	const {
		version,
		initialState,
		saveDebounceTime = 500,
		persistence = localPersistence("strata"),
	} = options

	const strata = new Trunk<S>(initialState)

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

