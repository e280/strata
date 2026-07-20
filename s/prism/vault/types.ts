
import {Cubby} from "@e280/stz"
import {Prism} from "../prism.js"

export {Cubby}

export type Versioned<State> = {
	state: State
	version: number
}

/** @deprecated renamed to `Cubby` */
export type EzStore<X> = Cubby<X>

export type VaultOptions<State> = {
	version: number
	prism: Prism<State>
	store: Cubby<Versioned<State>>
}

