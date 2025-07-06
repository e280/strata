
import {debounce} from "@e280/stz"

import {Trunk} from "../trunk.js"
import {localPersistence} from "../persistence.js"
import {SetupOptions, Trunkstate} from "../types.js"

export async function trunkSetup<S extends Trunkstate>(options: SetupOptions<S>) {
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
		state: trunk.state as any,
	}))

	// persistence: initial load from store
	await load()

	// persistence: save to store
	trunk.on(save)

	// cross-tab sync
	const dispose = persistence.onChange(load)

	return {trunk, load, save, dispose}
}

