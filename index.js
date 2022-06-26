/**
 * Single-use/Expiring redirect URLs
 * 
 * SPDX-License-Identifier: Jam
 */
import homepage from "./index.html"
/**
 * 
 */
export default {
  async fetch(req, env) {
    // 
    const {
      method,
      url,
    } = req
    //
    const { pathname } = new URL(url)
    // Load homepage
    if (pathname === "/" && (method === "GET" || method === "HEAD")) {
      return new Response(homepage, {
        headers: {
          'Content-Type': 'text/html;charset=utf-8'
        }
      })
    }
    // For redirect
    else if (method === "GET"
      // HEAD would delete single-use link
      /* || method === "HEAD" */) {
      const code = pathname.slice(1)
      try {
        const {value, metadata} = await env.REDIRECT_STORE.getWithMetadata(`code:${code}`)
        if (value) {
          // Delete single-use links.
          if (metadata.single_use)
            await env.REDIRECT_STORE.delete(`code:${code}`)
          // Redirect
          return new Response(`Redirecting to ${value}`, {
            status: 301,
            headers: {
              'Referrer-Policy': 'no-referrer',
              Location: value,
              // Other headers...
            }
          })
        }
        // Throw
        throw new Error("Invalid code")
      } catch(e) {
        // Could return HTML page here...
        return new Response(e, { status: 404 })
      }
    }
    // Code creation
    else if (method === "POST") {
      console.log("in post...")
      try {
        const formData = await req.formData()
        const toURL = formData.get('to_url') || undefined
        const single = formData.get('singlexpire') === "single" ? true : false
        // Might happen
        if (toURL === undefined)
          return new Response(null, { status: 400 })
        // Generate code
        const code = Array.from(
          { length: Number(env.CODE_LENGTH) },
          () => env.CODE_CHARS[Math.floor(Math.random() * env.CODE_CHARS.length)]
        ).join('')
        // Add to KV...
        if (single)
          await env.REDIRECT_STORE.put(`code:${code}`, toURL, { metadata: { single_use: true }})
        else
          // Set expiry to 24 hours from creation
          await env.REDIRECT_STORE.put(`code:${code}`, toURL, {
            metadata: { single_use: false, },
            expirationTtl: 86400
          })
        // Return URL
        return new Response(`${env.LINK_DOMAIN}/${code}`, {
          status: 201,
          headers: {
            // Headers...
          }
        })
     } catch(e) {
        // Error... WHY?
        return new Response("Error creating code.", { status: 500 })
      }
    }
    // Otherwise...
    else {
      return new Response("Bad Request", { status: 400 })
    }
  }
}
