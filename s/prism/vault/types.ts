
import {Prism} from "../prism.js"

export type Versioned<State> = {
	state: State
	version: number
}

export type EzStore<X> = {
	get(): Promise<X | undefined>
	set(data: X | undefined): Promise<void>
}

export type VaultOptions<State> = {
	version: number
	prism: Prism<State>
	store: EzStore<Versioned<State>>
}

