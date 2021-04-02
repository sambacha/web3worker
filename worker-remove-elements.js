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
        // remove a specific script
        .on("script[src*='name-of-our-script.js']", new removeElement())
        // remove the third meta tag in the head
        .on("head > meta:nth-of-type(3)", new removeElement())
        // remove all div elements that start with 'prefix'
        .on("div[class^='prefix']", new removeElement())
        // remove all link elements that start with '/assets/' and end with '.css'
        .on("link[href^='/assets/'][href$='.css']", new removeElement())
        .transform(oldResponse)

        // return the modified page along with custom headers
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