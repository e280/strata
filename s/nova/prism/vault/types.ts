
import {Prism} from "../prism.js"

export type Versioned<State> = {
	state: State
	version: number
}

export type Cubby<X> = {
	get(): Promise<X | undefined>
	set(data: X | undefined): Promise<void>
}

/** @deprecated renamed to `Cubby` */
export type EzStore<X> = Cubby<X>

export type VaultOptions<State> = {
	version: number
	prism: Prism<State>
	store: Cubby<Versioned<State>>
}

