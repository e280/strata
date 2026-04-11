
import {Wait, WaitDone, WaitErr, WaitOk, WaitPending} from "./type.js"

export const isWaitPending = (wait: Wait<unknown>): wait is WaitPending => !wait.done
export const isWaitDone = <Value, E = unknown>(wait: Wait<Value, E>): wait is WaitDone<Value, E> => wait.done
export const isWaitOk = <Value>(wait: Wait<Value, unknown>): wait is WaitOk<Value> => wait.done && wait.ok
export const isWaitErr = <E = unknown>(wait: Wait<unknown, E>): wait is WaitErr<E> => wait.done && !wait.ok

