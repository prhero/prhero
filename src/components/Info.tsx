import React from "react";

const environment = process.env.REACT_APP_ENV;
const login = `https://prhero-proxy.colinjfw.workers.dev/login?return=${environment}`;

export function Info() {
  return (
    <main className="Info text-center">
      <h1>A better way to review PR's</h1>
      <p><a href="https://colinjfw.github.io/prhero/#deliverybot/deploybot/24">Try the example</a> or review any pull request at https://colinjfw.github.io/prhero/#OWNER/REPO/PR.</p>
      <p>
        For more information visit the project <a href="https://github.com/colinjfw/prhero">README.</a>
      </p>
    </main>
  )
}
