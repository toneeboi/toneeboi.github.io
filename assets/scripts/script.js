function vh(v) {
  var h = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
  return (v * h) / 100;
}

function vw(v) {
  var w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  return (v * w) / 100;
}

// CSS CHANGE SCRIPTS
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    var mainTitle = document.getElementById("main-navTitle");

    mainTitle.style.setProperty("--iheight", "3vmin");
    // document.documentElement.style.setProperty("--iheight", "12vw");
    // document.getElementById("navbarLogo").style.fontSize = "25px";
  } else {
    document.documentElement.style.setProperty("--iheight", "20vw");
    // document.getElementById("navbarLogo").style.fontSize = "35px";
  }
}
