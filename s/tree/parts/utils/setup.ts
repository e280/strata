
import {debounce} from "@e280/stz"

import {Trunk} from "../trunk.js"
import {localPersistence} from "../persistence.js"
import {Treestate, SetupOptions} from "../types.js"

export async function trunkSetup<S extends Treestate>(options: SetupOptions<S>) {
	const {
		version,
		initialState,
		saveDebounceTime = 500,
		persistence = localPersistence("strataTree"),
	} = options

	const trunk = new Trunk<S>(initialState)

	async function load() {
		const pickle = await persistence.store.get()
		if (pickle && pickle.version === version)
			await trunk.overwrite(pickle.state)
	}

	const save = debounce(saveDebounceTime, async() => persistence.store.set({
		version,
		state: trunk.state,
	}))

	// persistence: initial load from store
	await load()

	// persistence: save to store
	trunk.watch(save)

	// cross-tab sync
	const dispose = persistence.onChange(load)

	return {trunk, load, save, dispose}
}

