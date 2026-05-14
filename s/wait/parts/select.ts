
import {Wait} from "./type.js"
import {isWaitOk, isWaitPending} from "./is.js"
import {waitNeedErr, waitNeedOk} from "./get.js"

export function waitSelect<Ret, Value, E = unknown>(wait: Wait<Value, E>, select: {
		pending?: () => Ret
		ok?: (value: Value) => Ret
		err?: (error: E) => Ret
	}) {

	const {
		pending = () => {},
		ok = () => {},
		err = () => {},
	} = select

	if (isWaitPending(wait))
		return pending()

	else if (isWaitOk(wait))
		return ok(waitNeedOk(wait))

	else
		return err(waitNeedErr(wait))
}

