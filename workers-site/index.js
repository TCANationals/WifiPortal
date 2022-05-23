import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import { Liquid } from 'liquidjs'

import loginHtml from '../public/index.html'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

const htmlEngine = new Liquid()

addEventListener('fetch', event => {
  event.respondWith(
    routeEvent(event)
  )
})

async function routeEvent(event) {
  const request = event.request
  if (request.url.includes('/static')) {
    return handleStaticAssets(event)
  } else {
    const renderedResp = await htmlEngine.parseAndRender(
      loginHtml,
      {
        request: {
          body: request.body,
          headers: request.headers,
          method: request.method,
          url: request.url,
        }
      }
    )

    const response = new Response(renderedResp, { status: 200 })
    setResponseHeaders(response)
    response.headers.set('Content-Type', 'text/html')

    return response
  }
}

async function handleStaticAssets(event) {
  let options = {}

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }

    const page = await getAssetFromKV(event, options)

    // allow headers to be altered
    const response = new Response(page.body, page)

    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'unsafe-url')
    response.headers.set('Feature-Policy', 'none')

    return response

  } catch (e) {
    // if an error is thrown try to serve the asset at index.html
    if (!DEBUG) {
      try {
        let notFoundResponse = new Response("URL not found", { status: 404 })
        notFoundResponse.headers.set('Content-Type', 'text/plain')

        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}

function setResponseHeaders(resp) {
  resp.headers.set('X-XSS-Protection', '1; mode=block')
  resp.headers.set('X-Content-Type-Options', 'nosniff')
  resp.headers.set('X-Frame-Options', 'DENY')
  resp.headers.set('Referrer-Policy', 'unsafe-url')
  resp.headers.set('Feature-Policy', 'none')
  // Disable all caching
  resp.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  resp.headers.set('Pragma', 'no-cache')
  resp.headers.set('Expires', '0')
}

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
  return request => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request)
    let url = new URL(defaultAssetKey.url)

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, '/')

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey)
  }
}
