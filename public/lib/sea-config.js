
seajs.config({
  base: "/",
  alias: {
    'pagerbar':'js/pagerbar.js',
    'dialog':'js/dialog.js',
    'ejs':'lib/ejs/ejs.js'

  },
  map: [
    [".js", ".js?" + new Date().getTime()]
  ],
  debug :true
});