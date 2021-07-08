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
  var mainIntro = document.getElementById("main-intro");
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    // var mainTitle = document.getElementById("main-navTitle");

    mainIntro.style.setProperty("display", "none");

    // mainTitle.style.setProperty("--iheight", "3vmin");
    // document.documentElement.style.setProperty("--iheight", "12vw");
    // document.getElementById("navbarLogo").style.fontSize = "25px";
  } else {
    mainIntro.style.setProperty("display", "");
    // document.documentElement.style.setProperty("--iheight", "20vw");
    // document.getElementById("navbarLogo").style.fontSize = "35px";
  }
}

function accordion(labelID) {
  var label = document.getElementById(labelID);
  var checkID = labelID + "Check";
  var itemClass = labelID + "Content";
  var items = document.getElementsByClassName(itemClass);

  if (label.classList.contains("active") === false) {
    label.classList.add("active");
  } else {
    label.classList.remove("active");
  }

  var i;

  for (i = 0; i < items.length; i++) {
    var content = items[i];
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }
}
