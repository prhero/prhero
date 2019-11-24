const CLIENT_ID = '';
const CLIENT_SECRET = '';
const BASE_URL = '';
const LOGIN_URL = `https://github.com/login/oauth/authorize?scope=user&client_id=${CLIENT_ID}&redirect_uri=${BASE_URL}/login/cb`;
const ERROR = `<h1>Not found</h1>`
const KEY = {
  alg: "A256GCM",
  ext: true,
  k: "hLOTn51w7AHedRA6verQreHivWlDw86rzSi75vaY5UI",
  key_ops: ["encrypt", "decrypt"],
  kty: "oct",
};

function importKey() {
  return window.crypto.subtle.importKey(
    "jwk",
    {
      kty: KEY.kty,
      k: KEY.k,
      alg: KEY.alg,
      ext: KEY.ext,
    },
    {
      name: "AES-GCM",
    },
    false,
    KEY.key_ops,
  );
}

function encrypt(data) {
  const enc = new TextEncoder();
  const key = await importKey();
  return window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: window.crypto.getRandomValues(new Uint8Array(12)),
      additionalData: ArrayBuffer,
      tagLength: 128,
    },
    key,
    enc.encode(data)
  );
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetches an access token from GitHub.
 * @param {string} code
 */
async function accessToken(code) {
  const resp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code
    })
  });
  const body = await resp.json();
  return body["access_token"];
}

/**
 * Fetch querystring from the request.
 * @param {Request} request
 */
function query(request) {
  const result = {};
  const q = request.url.split("?")[1] || "";
  const vars = q.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return result;
}

/**
 * Handle the request.
 * @param {Request} req
 */
async function handleRequest(req) {
  const q = query(req);
  if (q.code) {
    return handleCode(req);
  }
}

/**
 *
 * @param {Request} req
 */
async function handleCode(req) {
  try {
    const token = await accessToken(req.query.code);
    const key = await importKey();

    return new Response({
    });
  } catch (error) {
    return new Response(errNoUrl, {
      status: 500,
      headers: { "content-type": "text/html" }
    });
  }
}
