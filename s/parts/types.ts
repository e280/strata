
import {Substrata} from "./substrata.js"

export type Options = {
	clone: <X>(x: X) => X
}

export type Selector<S, Sub> = (state: S) => Sub
export type Mutator<S> = (state: S) => void

export type State = {}
export type Substate = {} | null | undefined

export type Versioned<S extends State> = {
	state: S
	version: number
}

export type Stratum<S extends Substate> = {
	readonly state: S
	watch(fn: (s: S) => void): () => void
	mutate(mutator: Mutator<S>): Promise<S>
	substrata<Sub extends Substate>(selector: Selector<S, Sub>): Substrata<S, Sub>
}

export type SetupOptions<S extends State> = {
	version: number
	initialState: S
	saveDebounceTime?: number
	persistence?: Persistence<Versioned<S>>
}

export type Chronicle<S extends Substate> = {
	// [abc] d [efg]
	//    \   \   \
	//     \   \   future
	//      \   present
	//       past
	past: S[]
	present: S
	future: S[]
}

export type EzStore<X> = {
	get(): Promise<X | undefined>
	set(state: X | undefined): Promise<void>
}

export type Persistence<X> = {
	store: EzStore<X>
	onChange: (fn: () => void) => (() => void)
}

