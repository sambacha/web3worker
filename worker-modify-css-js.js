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
        /**
         * Make your HTML changes here
         */
        .transform(oldResponse)

        // return the modified page along with custom headers
        return newResponse
    } else if(acceptHeader && acceptHeader.indexOf('text/css') >= 0){// Change CSS here
        // grab the CSS response
        const response = await fetch(url.toString(), request);
        // extract the body of the request
        let body = await response.text();
        // modify the CSS response body
        body = body.replace(/Arial, Helvetica Neue, Helvetica, sans-serif;/gi,'Georgia, Times, Times New Roman, serif;').replace(/Arial,Helvetica Neue,Helvetica,sans-serif;/gi,'Georgia, Times, Times New Roman, serif;')
        // return the modified response
        return new Response(body, {
            headers: response.headers
        });
    } else if(acceptHeader && acceptHeader.indexOf('*/*') >= 0){// Change JavaScript here (uses the generic Accept directive)
      // being granular we only modify a single response for a specific JavaScript file
      if(url.toString().includes('our-specific-js-filename.js')){
        // grab the JS response
        const response = await fetch(url.toString(), request);
        // extract the JS body of the request
        var body = await response.text();
        // using template literals we add a console.log to the end
        body = `${body} console.log('String added last');`;
        // return the modified response
        return new Response(body, {
          headers: response.headers
        });
      }
    }
  }

  // otherwise just proxy the request unmodified
  return fetch(url.toString(), request)
}
