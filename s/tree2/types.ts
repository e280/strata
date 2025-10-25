
import {Sub} from "@e280/stz"
import {Branch} from "./branch.js"
import {_data, _onChange} from "./symbols.js"

export type TreeLike<D extends BranchData> = {
	[_data]: D
	[_onChange]: Sub
	get state(): Immutable<D>
	// on: Sub<[state: Immutable<D>]>
	mutate(mutator: Mutator<D>): Promise<Immutable<D>>
	branch<D2 extends {}>(selector: Selector<D2, D>): Branch<D2, D>
}

export type TreeOptions = {
	clone: <X>(x: X) => X
}

/** @deprecated renamed to `TreeOptions` */
export type Options = TreeOptions

export type Selector<Sub, S> = (state: S) => Sub
export type Mutator<S> = (state: S) => void

export type TreeData = {}
export type BranchData = {} | null | undefined

export type Versioned<S extends TreeData> = {
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

export type SetupOptions<S extends TreeData> = {
	version: number
	initialState: S
	saveDebounceTime?: number
	persistence?: Persistence<Versioned<S>>
}

export type Chronicle<S extends BranchData> = {
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

