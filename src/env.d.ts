/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace Astro {
	interface ClientDirectives {
		'client:tina'?: boolean
	}
}

declare namespace App {
	interface Locals {
		token?: string
		referer?: string
		host?: string
	}
}
