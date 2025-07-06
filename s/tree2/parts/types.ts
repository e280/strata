
import {Sub} from "@e280/stz"
import {Branch} from "./branch.js"
import {DerivedSignal} from "../../signals/parts/derive.js"

export type Options = {
	clone: <X>(x: X) => X
}

export type Selector<Sub, S> = (state: S) => Sub
export type Mutator<S> = (state: S) => void

export type Trunkstate = {}
export type Branchstate = {} | null | undefined

export type Versioned<S extends Trunkstate> = {
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
	get state(): Immutable<S>
	get on(): Sub<[Immutable<S>]>
	mutate(mutator: Mutator<S>): Promise<Immutable<S>>
	branch<Sub extends Branchstate>(selector: Selector<Sub, S>): Branch<Sub, S>
}

export type SetupOptions<S extends Trunkstate> = {
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

