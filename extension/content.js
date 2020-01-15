(function () {
  var el = document.querySelectorAll('.tabnav-pr .tabnav-tabs')[0];
  if (el) {
    var spl = window.location.pathname.split("/");
    var a = document.createElement("a");
    a.href = "https://prhero.dev/pr?owner=" + spl[1] + "&repo=" + spl[2] + "&pr=" + spl[4];
    a.className = "tabnav-tab js-pjax-history-navigate";
    a.target = "_blank";
    a.innerText = "Review in PRHero";
    el.appendChild(a);
  }
})();
