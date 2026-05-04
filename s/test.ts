
import {science} from "@e280/science"
import core from "./nova/core/test.js"
import wait from "./nova/wait/test.js"
import tracker from "./nova/tracker/test.js"

await science.run({
	tracker,
	core,
	wait,
})

