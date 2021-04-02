// set the site we are modifying
const site = 'www.example.com';

// do this on a fetch
addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  event.respondWith(handleRequest(request))
});

async function handleRequest(request) {
  // store the URL
  const url = new URL(request.url);

  // disallow crawlers (write a robots.txt file)
  if(url.pathname === "/robots.txt") {
    return new Response('User-agent: *\nDisallow: /', {status: 200});
  }

  // when overrideHost is used in a WPT script, WPT sets x-host to original host i.e. site we want to proxy
  // store the value of x-host
  const xhost = request.headers.get('x-host');

  // If this header is missing, abort
  if(!xhost) {
    return new Response('x-host header missing', {status: 403});
  }

  // set our hostname to that listed in the xhost header
  url.hostname = xhost;

  // look for header that allows us to bypass the transform entirely
  const bypassTransform = request.headers.get('x-bypass-transform');

  // get the accept header to allow us to examine the type of request it is
  const acceptHeader = request.headers.get('accept');

  if(xhost === site && (!bypassTransform || (bypassTransform && bypassTransform.indexOf('true') === -1))){

    if(acceptHeader && acceptHeader.indexOf('text/html') >= 0){
      // store this particular request for modification
      let oldResponse = await fetch(url.toString(), request)
      // create a new response
      let newResponse = new HTMLRewriter()
        // blanket example of removing all resource hints
        .on("link[rel='preload']", new removeElement())
        .on("link[rel='prefetch']", new removeElement())
        .on("link[rel='dns-prefetch']", new removeElement())
        .on("link[rel='prerender']", new removeElement())
        .on("link[rel='preconnect']", new removeElement())
        // example were we only remove a selected preload hint for a font
        .on("link[rel='preload'][href*='our-woff2-font.woff2']", new removeElement())
        .transform(oldResponse)

        // return the modified page 
        return newResponse
    }
  }

  // otherwise just proxy the request unmodified
  return fetch(url.toString(), request)
}

class removeElement {
  element(element) {
    element.remove();
  }
}