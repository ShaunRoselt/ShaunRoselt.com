(function () {
  const script = document.createElement('script');
  script.src = new URL('../components/site-header/site-header.js', document.currentScript.src).toString();
  document.head.appendChild(script);
})();
