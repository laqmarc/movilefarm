(function loadMovileFarmBundles() {
  const chunks = [
    'js/01-bootstrap.js',
    'js/02-model.js',
    'js/03-contracts-network.js',
    'js/04-economy.js',
    'js/05-actions.js',
    'js/06-ui-panels.js',
    'js/07-input.js',
    'js/08-render.js',
    'js/09-events-loop.js',
  ];

  for (const src of chunks) {
    const tag = document.createElement('script');
    tag.src = src;
    tag.async = false;
    document.body.appendChild(tag);
  }
})();
