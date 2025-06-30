
import {Branch} from "./branch.js"

export type Options = {
	clone: <X>(x: X) => X
}

export type Selector<Sub, S> = (state: S) => Sub
export type Mutator<S> = (state: S) => void

export type Treestate = {}
export type Branchstate = {} | null | undefined

export type Versioned<S extends Treestate> = {
	state: S
	version: number
}

export type Immutable<T> =
	T extends (...args: any[]) => any ? T :
	T extends readonly any[] ? ReadonlyArray<Immutable<T[number]>> :
	T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } :
	T

export type Mutable<T> =
	T extends (...args: any[]) => any ? T :
	T extends ReadonlyArray<infer U> ? Mutable<U>[] :
	T extends object ? { -readonly [K in keyof T]: Mutable<T[K]> } :
	T

export type Tree<S extends Branchstate> = {
	readonly state: Immutable<S>
	watch(fn: (s: Immutable<S>) => void): () => void
	mutate(mutator: Mutator<S>): Promise<Immutable<S>>
	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S>
}

export type SetupOptions<S extends Treestate> = {
	version: number
	initialState: S
	saveDebounceTime?: number
	persistence?: Persistence<Versioned<S>>
}

export type Chronicle<S extends Branchstate> = {
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

