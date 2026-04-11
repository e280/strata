
import {nap, needOk} from "@e280/stz"
import {expect, suite, test} from "@e280/science"

import {wait} from "./parts/wait.js"
import {waitNeedErr, waitNeedOk} from "./parts/get.js"
import {isWaitDone, isWaitErr, isWaitPending} from "./parts/is.js"

export default suite({
	"wait fn, done": test(async() => {
		const $wait = wait(async() => {
			await nap(10)
			return 123
		})
		expect(isWaitPending($wait())).is(true)
		expect(await $wait.ready).is(123)
		expect(needOk(await $wait.result)).is(123)
		expect(isWaitDone($wait())).is(true)
		expect(waitNeedOk($wait())).is(123)
	}),

	"wait fn, failed": test(async() => {
		const $wait = wait(async() => {
			await nap(10)
			throw new Error("uh oh")
		})
		expect(isWaitPending($wait())).is(true)
		expect(await $wait.ready).is(undefined)
		expect((await $wait.result).ok).is(false)
		expect(isWaitErr($wait())).is(true)
		expect((waitNeedErr($wait()) as any).message).is("uh oh")
	}),
})

