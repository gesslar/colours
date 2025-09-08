import console from "node:console"
import c from "../src/Colours.js"

c.alias.set("red", "{F196}")

console.info(c`{red}text{/} {B033}{F001}{<BU}T{<F}E{F>}E{<F}H{FU>}E{<F}E{F>}{/}`)
console.debug(c`{red}text{/} {B033}{F001}{<BU}T{<F}E{F>}E{<F}H{FU>}E{<F}E{F>}{/}`)
