
seajs.config({
  base: "/",
  alias: {
    'pagerbar':'js/pagerbar.js',
    'dialog':'js/dialog.js'

  },
  map: [
    [".js", ".js?" + new Date().getTime()]
  ],
  debug :true
});