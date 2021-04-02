##

### Latency numbers every programmer should know

    L1 cache reference ......................... 0.5 ns
    Branch mispredict ............................ 5 ns
    L2 cache reference ........................... 7 ns
    Mutex lock/unlock ........................... 25 ns
    Main memory reference ...................... 100 ns
    Compress 1K bytes with Zippy ............. 3,000 ns  =   3 µs
    Send 2K bytes over 1 Gbps network ....... 20,000 ns  =  20 µs
    SSD random read ........................ 150,000 ns  = 150 µs
    Read 1 MB sequentially from memory ..... 250,000 ns  = 250 µs
    Round trip within same datacenter ...... 500,000 ns  = 0.5 ms
    Read 1 MB sequentially from SSD* ..... 1,000,000 ns  =   1 ms
    Disk seek ........................... 10,000,000 ns  =  10 ms
    Read 1 MB sequentially from disk .... 20,000,000 ns  =  20 ms
    Send packet CA->Netherlands->CA .... 150,000,000 ns  = 150 ms

Assuming ~1GB/sec SSD

![Visual representation of latencies](http://i.imgur.com/k0t1e.png)

Visual chart provided by [ayshen](https://gist.github.com/ayshen)

Data by [Jeff Dean](http://research.google.com/people/jeff/)

Originally by [Peter Norvig](http://norvig.com/21-days.html#answers)

Lets multiply all these durations by a billion:

Magnitudes:

### Minute:

    L1 cache reference                  0.5 s         One heart beat (0.5 s)
    Branch mispredict                   5 s           Yawn
    L2 cache reference                  7 s           Long yawn
    Mutex lock/unlock                   25 s          Making a coffee

### Hour:

    Main memory reference               100 s         Brushing your teeth
    Compress 1K bytes with Zippy        50 min        One episode of a TV show (including ad breaks)

### Day:

    Send 2K bytes over 1 Gbps network   5.5 hr        From lunch to end of work day

### Week

    SSD random read                     1.7 days      A normal weekend
    Read 1 MB sequentially from memory  2.9 days      A long weekend
    Round trip within same datacenter   5.8 days      A medium vacation
    Read 1 MB sequentially from SSD    11.6 days      Waiting for almost 2 weeks for a delivery

### Year

    Disk seek                           16.5 weeks    A semester in university
    Read 1 MB sequentially from disk    7.8 months    Almost producing a new human being
    The above 2 together                1 year

### Decade

    Send packet CA->Netherlands->CA     4.8 years     Average time it takes to complete a bachelor's degree

## [Charles Proxy](https://www.charlesproxy.com/) Map Remote over HTTP or HTTPS

    The Map Remote tool changes the request location, per the configured mappings, so that the response is transparently served from the new location as if that was the original request.

### HTTP

Using this feature for `http` resources does't require anything else apart from just configuring your Map Remote entry.

    Always make sure you are clearing your cache before you test. Even if Charles is configured properly you might not see the changes unless the browser gets the resource again from the server and not for its local cache.

## HTTPS

In order to use Map Remote over https you need to create a self signed certificate and launch your local server with that.

### Step 1 - Create a self signed certificate

Use

- https://zerossl.com/free-ssl/#self
- https://letsencrypt.org/docs/certificates-for-localhost/
- https://github.com/FiloSottile/mkcert

or do it manually using the following commands.

```shell
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt
```

Running the command above will prompt for additional information. Add whatever details you want but use localhost for `Common Name` (or whatever domain name you want like local.dev).

```
Common Name (e.g. server FQDN or YOUR name) []:localhost
```

Once you are done 2 files will be created a `localhost.cert` and a `localhost.key`. Store them in a folder you can easily access when needed.

### Step 2 - Add the created certificate to your Keychain

On a Mac open Keychain and use the `File \ Import` menu to import the newly created certificate. Make sure you select the `System` tab before you do it as it need to go in there.

Next, double click your new certificate and under `Trust` dropdown menu select `Always Trust`.

Sometimes you might need to restart your machine for this to take effect.

This will make the browser trust your certificate. The https icon on Chrome and others will be green now.

#### Step 2 - Alternative

##### That browser warning

When you navigate to the server’s address (most likely `https://localhost:3000`), you will probably get a warning about the connection being insecure similar to the following:

![Chrome warning about an insecure certificate](https://raw.githubusercontent.com/GoogleChrome/simplehttp2server/master/warning.png)

This is **normal** and correct, since the certificate generated by simplehttp2server is self-signed and doesn’t carry the signature of any common certificate authority (CA). All browsers offer a way to temporarily ignore this error and proceed. This is safe to do.

When using Chrome you can enable the [allow-insecure-localhost flag](http://peter.sh/experiments/chromium-command-line-switches/#allow-insecure-localhost) on chrome://flags which disableѕ the certificate warning for localhost. **This flag is required if you want to use ServiceWorkers on https://localhost with a self-signed certificate you haven't explicitly "trusted".**

### Step 3 - Tell Charles to Proxy SSL

Open Charles and from the menu select `Proxy \ SSL Proxy Settings`.

Add 2 items in the list. One will be your remote domain name Ex: `radumicu.com` or `dev.radumicu.com`, and another for localhost `localhost:{PORT}` (replace port with your port).

### Step 4 - Tell Charles to install its own signed certificates

Charles in order to proxy SSL connections needs to install its own certificates. With Charles open click on the Help menu and then select `SSL Proxying \ Install Charles Root Certificate`

## How to map remote a file

To use Map Remote, you need to have a local server running that handles your requests. You could use Pythons simple http server, but that is not very good these days and it is slower than others.

A good tool is [http-server](https://www.npmjs.com/package/http-server) NodeJs package, but a better tool is [local-web-server](https://github.com/75lb/local-web-server). `local-web-server` is better because it can gzip your requests, and this helps with performance profiling.

Install it globally using:

```shell
npm install -g local-web-server
```

And from the path you want to serve your files run:

```shell
ws -p {port} -z --key {PATH}/localhost.key --cert {PATH}/localhost.crt
```

Replace `{port}` and `{PATH}` with your settings.

Next configure in Charles a Map Remote entry with your current settings and your remote resource will be replaced with your local one. Remember to clear cache before you test or use Disable cache in Dev Tools.

## Notes

- [Alternative for openssl generated certificate steps](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-with-a-new-self-signed-certificate)
- [Common name no longer supported in Chrome](https://www.chromestatus.com/feature/4981025180483584)
- All cert components must be SHA256 (Chrome)
- Due to a long-running bug in openssl, must explicitly pass -extfile and extensions in order for the extensions to copy from the certificate request to the certificate. See [here](https://mta.openssl.org/pipermail/openssl-users/2016-January/002764.html).
- https://github.com/lukejacksonn/servor
