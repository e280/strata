
import {science} from "@e280/science"
import prism from "./prism/test.js"
import signals from "./signals/test.js"
import tracker from "./tracker/test.js"
import wait from "./wait/test.js"

await science.run({
	prism,
	signals,
	tracker,
	wait,
})

