
export type Options = {
	clone: <X>(x: X) => X
}

export type Selector<S, Sub> = (state: S) => Sub
export type Mutator<S> = (state: S) => void

export type State = {}
export type Substate = {} | null | undefined

