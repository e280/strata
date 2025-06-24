
export type Options = {
	clone: <X>(x: X) => X
}

export type Selector<S, Sub> = (state: S) => Sub
export type Mutator<S> = (state: S) => void

export type State = {}
export type Substate = {} | null | undefined

export type Stratum<S extends Substate> = {
	readonly state: S
	onMutation(fn: (s: S) => void): () => void
	mutate(mutator: Mutator<S>): Promise<S>
}

export type Chronicle<S extends Substate> = {
	// [abc] d [efg]
	//    \   \   \
	//     \   \   future
	//      \   present
	//       past
	present: S
	past: S[]
	future: S[]
}

