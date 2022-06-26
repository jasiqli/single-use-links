# Single-use/Expiring Links

Use a Cloudflare Worker and Workers KV to generate and store links.

As codes are removed after use, there is a potential for regeneration of the same code. With a higher code length and more characters to select from *(67^21 as default)* this is reduced *(hopefully.)*
