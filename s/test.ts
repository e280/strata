
import {science} from "@e280/science"
import core from "./core/test.js"
import wait from "./wait/test.js"
import prism from "./prism/test.js"
import tracker from "./tracker/test.js"

await science.run({
	tracker,
	core,
	wait,
	prism,
})

