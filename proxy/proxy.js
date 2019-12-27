const config = {
  secret: "",
  client: {
    id: "",
    secret: ""
  },
  loginUrl() {
    return `https://github.com/login/oauth/authorize?scope=user&client_id=${this.client.id}`;
  },
  async signingKey() {
    if (this._signingKey) {
      return this._signingKey;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(this.secret);
    const key = await crypto.subtle.importKey(
      "raw",
      data,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );
    this._signingKey = key;
    return key;
  }
};

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Take base64 and return an array buffer.
 *
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
function base64Decode(base64) {
  const str = atob(base64);
  const len = str.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encode an array buffer to a string.
 *
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function base64Encode(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Sign session signs a string. Returns a string with the signature appended
 * and separated with a '.'.
 *
 * @param {string} session
 * @returns {Promise<string>}
 */
async function signSession(session) {
  const encoder = new TextEncoder();
  const data = encoder.encode(session);
  const buf = await crypto.subtle.sign("HMAC", await config.signingKey(), data);
  const signed = base64Encode(buf);
  return `${session}.${signed}`;
}

/**
 * Get session fetches a signed session string and errors if the signature is
 * invalid.
 *
 * @param {string} signedSession
 * @returns {Promise<string>}
 */
async function getSession(signedSession) {
  const encoder = new TextEncoder();
  const [session, signature] = signedSession.split(".");
  const verified = await crypto.subtle.verify(
    "HMAC",
    await config.signingKey(),
    base64Decode(signature),
    encoder.encode(session)
  );
  if (!verified) {
    throw new Error("Session not verified");
  }
  return session;
}

/**
 * Fetches an access token from GitHub.
 *
 * @param {string} code
 * @returns {Promise<string>}
 */
async function accessToken(code) {
  const resp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache",
      accept: "application/json"
    },
    body: JSON.stringify({
      client_id: config.client.id,
      client_secret: config.client.secret,
      code
    })
  });
  const body = await resp.json();
  if (body["error"]) {
    throw new Error(body["error"]);
  }
  return body["access_token"];
}

/**
 * Fetch querystring from the request.
 *
 * @param {Request} request
 * @returns {Object}
 */
function query(request) {
  const result = {};
  const q = request.url.split("?")[1] || "";
  const vars = q.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return result;
}

/**
 * Grabs the cookie with name from the request headers.
 *
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
function getCookie(request, name) {
  let result = null;
  let cookieString = request.headers.get("Cookie");
  if (cookieString) {
    let cookies = cookieString.split(";");
    cookies.forEach(cookie => {
      let cookieName = cookie.split("=")[0].trim();
      if (cookieName === name) {
        let cookieVal = cookie.split("=")[1];
        result = cookieVal;
      }
    });
  }
  return result;
}

/**
 * Handle the request.
 *
 * @param {Request} req
 * @returns {Response}
 */
async function handleRequest(req) {
  const path = new URL(req.url).pathname;
  switch (path) {
    case "/callback":
      return handleCode(req);
    case "/login":
      return handleLogin(req);
  }

  if (path.startsWith("/api")) {
    return handleApi(req);
  }

  return new Response("NotFound", {
    status: 404,
    headers: { "content-type": "text/plain" }
  });
}

/**
 * Handles proxying requests to the GitHub api.
 *
 * @param {Request} req
 * @returns {Promise<Response>}
 */
async function handleApi(req) {
  const cookie = getCookie(req, "_github_token");
  if (!cookie) {
    throw new Error("Unauthenticated");
  }
  const url = `https://api.github.com/${path.replace("/api/", "")}`;
  const next = new Request(url, req);
  const token = await getSession(cookie);
  next.headers.set("authorization", `Bearer ${token}`);
  return await fetch(next);
}

/**
 * Handle access code from GitHub.
 *
 * @param {Request} req
 * @returns {Response}
 */
async function handleLogin(req) {
  return Response.redirect(config.loginUrl(), 301);
}

/**
 * Handle access code from GitHub.
 *
 * @param {Request} req
 * @returns {Response}
 */
async function handleCode(req) {
  function expiry(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toUTCString();
  }

  const q = query(req);
  const token = await accessToken(q.code);
  const sess = await signSession(token);
  const exp = expiry(1);
  const cookie = `_github_token=${sess}; Expires=${exp}; Path='/'; HttpOnly`;
  return new Response("OK", {
    headers: {
      "content-type": "text/plain",
      "set-cookie": cookie
    }
  });
}
