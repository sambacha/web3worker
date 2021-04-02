// set the site we are modifying
const site = 'www.example.com';

// domain rewriter vars
const OLD_URL = "https://www.example.com/";
const NEW_URL = "/";

// do this on a fetch
addEventListener('fetch', event => {
  const request = event.request
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

  // If the `x-host` header is missing, abort and tell us
  if(!xhost) {
    return new Response('x-host header missing', {status: 403});
  }

  // set our hostname to that listed in the x-host header
  url.hostname = xhost;

  // look for header that allows us to bypass the transform entirely
  const bypassTransform = request.headers.get('x-bypass-transform');

  // get the accept header to allow us to examine the type of request it is
  const acceptHeader = request.headers.get('accept');

  // check that the x-host header matches what is contained in the site
  // make sure we aren't wanting to bypass the transformations
  if(xhost === site && (!bypassTransform || (bypassTransform && bypassTransform.indexOf('true') === -1))){
    // check for an accept header and what it contains
    if(acceptHeader && acceptHeader.indexOf('text/html') >= 0){
      // store this particular HTML response for modification
      let oldResponse = await fetch(url.toString(), request)
      // create a new response
      let newResponse = new HTMLRewriter()
        // rewrite the links from the following page elements
        .on("a", new AttributeRewriter("href"))
        .on("link", new AttributeRewriter("href"))
        .on("img", new AttributeRewriter("src"))
        .on("script", new AttributeRewriter("src"))
        .on("image", new AttributeRewriter("src"))
        .on("meta", new AttributeRewriter("content"))
        // transform the old response
        .transform(oldResponse)

        // return the modified page
        return newResponse
    }
  }

  // otherwise just proxy the request unmodified
  return fetch(url.toString(), request);
}

// https://developers.cloudflare.com/workers/examples/rewrite-links
class AttributeRewriter {
    constructor(attributeName) {
        this.attributeName = attributeName
    }
    element(element) {
        const attribute = element.getAttribute(this.attributeName)
        if (attribute) {
            element.setAttribute(
                this.attributeName,
                attribute.replace(OLD_URL, NEW_URL),
            )
        }
    }
}
