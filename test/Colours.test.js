#!/usr/bin/env node

import assert from "node:assert/strict"
import {describe, it} from "node:test"
import c from "../src/Colours.js"

describe("Colours", () => {
	describe("basic functionality", () => {
		it("returns string unchanged when no color codes present", () => {
			assert.equal(c`hello world`, "hello world")
		})

		it("handles template literal interpolation", () => {
			const name = "test"
			assert.equal(c`hello ${name}`, "hello test")
		})

		it("handles multiple interpolations", () => {
			const a = "foo"
			const b = "bar"
			assert.equal(c`${a} and ${b}`, "foo and bar")
		})
	})

	describe("reset codes", () => {
		it("converts {/} to ANSI reset", () => {
			assert.equal(c`{/}`, "\x1b[0m")
		})

		it("converts multiple resets", () => {
			assert.equal(c`{/}text{/}`, "\x1b[0mtext\x1b[0m")
		})
	})

	describe("numbered color codes", () => {
		it("converts foreground colors with {F###}", () => {
			assert.equal(c`{F196}red`, "\x1b[38;5;196mred")
		})

		it("converts background colors with {B###}", () => {
			assert.equal(c`{B033}blue`, "\x1b[48;5;033mblue")
		})

		it("handles 1-digit color codes", () => {
			assert.equal(c`{F1}`, "\x1b[38;5;1m")
		})

		it("handles 2-digit color codes", () => {
			assert.equal(c`{F45}`, "\x1b[38;5;45m")
		})

		it("handles 3-digit color codes", () => {
			assert.equal(c`{F196}`, "\x1b[38;5;196m")
		})

		it("handles color code 0", () => {
			assert.equal(c`{F0}`, "\x1b[38;5;0m")
		})

		it("handles color code 255", () => {
			assert.equal(c`{F255}`, "\x1b[38;5;255m")
		})

		it("preserves invalid color codes above 255", () => {
			assert.equal(c`{F256}`, "{F256}")
		})

		it("preserves invalid color codes with letters", () => {
			assert.equal(c`{F12a}`, "{F12a}")
		})

		it("preserves codes without F or B prefix", () => {
			assert.equal(c`{123}`, "{123}")
		})

		it("combines foreground and background colors", () => {
			assert.equal(c`{F196}{B033}text`, "\x1b[38;5;196m\x1b[48;5;033mtext")
		})
	})

	describe("style codes", () => {
		it("converts bold open {<B}", () => {
			assert.equal(c`{<B}bold`, "\x1b[1mbold")
		})

		it("converts bold close {B>}", () => {
			assert.equal(c`{B>}normal`, "\x1b[22mnormal")
		})

		it("converts underline open {<U}", () => {
			assert.equal(c`{<U}underline`, "\x1b[4munderline")
		})

		it("converts underline close {U>}", () => {
			assert.equal(c`{U>}normal`, "\x1b[24mnormal")
		})

		it("converts italics open {<I}", () => {
			assert.equal(c`{<I}italic`, "\x1b[3mitalic")
		})

		it("converts italics close {I>}", () => {
			assert.equal(c`{I>}normal`, "\x1b[23mnormal")
		})

		it("converts dim open {<D}", () => {
			assert.equal(c`{<D}dim`, "\x1b[2mdim")
		})

		it("converts flash open {<F}", () => {
			assert.equal(c`{<F}flash`, "\x1b[5mflash")
		})

		it("converts flash close {F>}", () => {
			assert.equal(c`{F>}normal`, "\x1b[25mnormal")
		})

		it("converts reverse video open {<R}", () => {
			assert.equal(c`{<R}reverse`, "\x1b[7mreverse")
		})

		it("converts reverse video close {R>}", () => {
			assert.equal(c`{R>}normal`, "\x1b[27mnormal")
		})

		it("converts strikethrough open {<S}", () => {
			assert.equal(c`{<S}strike`, "\x1b[9mstrike")
		})

		it("converts strikethrough close {S>}", () => {
			assert.equal(c`{S>}normal`, "\x1b[29mnormal")
		})

		it("converts overline open {<O}", () => {
			assert.equal(c`{<O}overline`, "\x1b[53moverline")
		})

		it("converts overline close {O>}", () => {
			assert.equal(c`{O>}normal`, "\x1b[55mnormal")
		})

		it("converts multiple styles in single open tag {<BU}", () => {
			assert.equal(c`{<BU}bold-underline`, "\x1b[1m\x1b[4mbold-underline")
		})

		it("converts multiple styles in single close tag {BU>}", () => {
			assert.equal(c`{BU>}normal`, "\x1b[22m\x1b[24mnormal")
		})

		it("handles complex style combinations", () => {
			assert.equal(c`{<BUI}text`, "\x1b[1m\x1b[4m\x1b[3mtext")
		})
	})

	describe("alias system", () => {
		it("allows setting an alias", () => {
			c.alias.set("testcolor", "{F123}")
			assert.equal(c.alias.aliases.get("testcolor"), "{F123}")
			c.alias.del("testcolor")
		})

		it("allows deleting an alias", () => {
			c.alias.set("tempcolor", "{F100}")
			c.alias.del("tempcolor")
			assert.equal(c.alias.aliases.get("tempcolor"), undefined)
		})

		it("converts alias to replacement code", () => {
			c.alias.set("red", "{F196}")
			assert.equal(c`{red}text`, "\x1b[38;5;196mtext")
			c.alias.del("red")
		})

		it("preserves unknown aliases unchanged", () => {
			assert.equal(c`{unknownalias}`, "{unknownalias}")
		})

		it("handles alias with complex replacement", () => {
			c.alias.set("fancy", "{F196}{B033}{<BU}")
			assert.equal(c`{fancy}text`, "\x1b[38;5;196m\x1b[48;5;033m\x1b[1m\x1b[4mtext")
			c.alias.del("fancy")
		})

		it("handles multiple aliases in same string", () => {
			c.alias.set("color1", "{F100}")
			c.alias.set("color2", "{F200}")
			assert.equal(c`{color1}a{color2}b`, "\x1b[38;5;100ma\x1b[38;5;200mb")
			c.alias.del("color1")
			c.alias.del("color2")
		})
	})

	describe("complex combinations", () => {
		it("handles color + style + reset", () => {
			assert.equal(c`{F196}{<B}text{/}`, "\x1b[38;5;196m\x1b[1mtext\x1b[0m")
		})

		it("handles nested styles", () => {
			assert.equal(
				c`{<B}bold {<U}bold-underline{U>} bold{B>}`,
				"\x1b[1mbold \x1b[4mbold-underline\x1b[24m bold\x1b[22m"
			)
		})

		it("handles foreground, background, and styles together", () => {
			assert.equal(
				c`{F001}{B033}{<BU}text{BU>}{/}`,
				"\x1b[38;5;001m\x1b[48;5;033m\x1b[1m\x1b[4mtext\x1b[22m\x1b[24m\x1b[0m"
			)
		})

		it("handles alias with interpolation", () => {
			c.alias.set("warn", "{F226}")
			const msg = "warning"
			assert.equal(c`{warn}${msg}{/}`, "\x1b[38;5;226mwarning\x1b[0m")
			c.alias.del("warn")
		})
	})

	describe("edge cases", () => {
		it("handles empty string", () => {
			assert.equal(c``, "")
		})

		it("handles string with only spaces", () => {
			assert.equal(c`   `, "   ")
		})

		it("handles malformed codes gracefully", () => {
			assert.equal(c`{F}`, "{F}")
			assert.equal(c`{B}`, "{B}")
			assert.equal(c`{<}`, "{<}")
			assert.equal(c`{>}`, "{>}")
		})

		it("handles negative color codes", () => {
			assert.equal(c`{F-1}`, "{F-1}")
		})

		it("handles very long strings", () => {
			const long = "x".repeat(10000)
			assert.equal(c`{F196}${long}{/}`, `\x1b[38;5;196m${long}\x1b[0m`)
		})

		it("handles unicode characters", () => {
			assert.equal(c`{F196}🎨{/}`, "\x1b[38;5;196m🎨\x1b[0m")
		})

		it("handles special characters", () => {
			assert.equal(c`{F196}\n\t{/}`, "\x1b[38;5;196m\n\t\x1b[0m")
		})
	})

	describe("processing order", () => {
		it("processes in correct order: aliases -> numbered -> styles -> reset", () => {
			c.alias.set("mycolor", "{F100}")
			// Alias should be replaced first, then converted to ANSI
			assert.equal(c`{mycolor}text{/}`, "\x1b[38;5;100mtext\x1b[0m")
			c.alias.del("mycolor")
		})

		it("does not double-process alias replacements", () => {
			// If alias contains {F196}, it should not be treated as another alias
			c.alias.set("red", "{F196}")
			c.alias.set("{F196}", "should-not-trigger")
			assert.equal(c`{red}text`, "\x1b[38;5;196mtext")
			c.alias.del("red")
			c.alias.del("{F196}")
		})
	})
})
