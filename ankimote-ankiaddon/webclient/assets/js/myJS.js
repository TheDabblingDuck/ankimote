
// if( /Android/i.test(navigator.userAgent) ) {
//   var deeplink = "intent:#Intent;action=dabblingduckapps.ankimote.openfromweb;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;S.uri="+encodeURIComponent(wslink)+";S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.chrome.dev;end"
//   window.location.replace(deeplink);
// }

var dict = {
  0: "none",
  1: "good",
  2: "again",
  3: "easy",
  4: "hard",
  5: "undo",
  6: "scrollup",
  7: "scrolldown",
  8: "showhints"
};

function changeMode(newMode) {
  webSocket.send('setprefs-currentmode-'+newMode)
  if (newMode == "swipes") {
    $("#container").load("swipes.html #container", function() {
      generalInit();
      initSwipes();
    });
  }
  else if (newMode == "taps") {
    $("#container").load("taps.html #container", function() {
      generalInit();
      initTaps();
    });
  }
  else if (newMode == "gestures") {

  }
  else if (newMode == "switchdeck") {
    $("#container").load("switchdeck.html #container", function() {
      initSwitchdeck()
    });
  }
}

var wslink = "ws://"+window.location.hostname+":"+(parseInt(window.location.port)+1).toString()
var webSocket
var choosingMode = true

function createSocket() {
  webSocket = new WebSocket(wslink)

  webSocket.onopen = function(event) {
    webSocket.send('Hi');
    if(choosingMode) {
      webSocket.onmessage = function(event) {
        console.log(event.data)
        var msg = event.data.split('-')
        if (msg[0]=='currentmode') {
          choosingMode=false
          if (msg[1]=='X') {
            changeMode('swipes')
          } else {
            changeMode(msg[1])
          }
        }
      }
      webSocket.send('getprefs-currentmode')
    }
  };

  webSocket.onerror = function(event) {
    alert("Connection Error");
  };

  webSocket.onclose = function(event) {
    if(!document.hidden) alert("Connection Closed");
  };
}

createSocket()

function handleVisibilityChange() {
  if (document.hidden) {
    webSocket.close()
  } else  {
    if(webSocket.readyState!=1) createSocket();
    fixDimensions();
  }
}
document.addEventListener("visibilitychange", handleVisibilityChange, false);


function generalInit() {

  document.getElementById('gigaDiv').addEventListener('touchmove', function(e) {
      e.preventDefault();
  }, { passive: false });

  if(!document.webkitFullscreenEnabled) {
    $('#goFullscreenButton').remove()
  }

}


function initSwitchdeck() {
  if(!document.webkitFullscreenEnabled) {
    $('#goFullscreenButton').remove()
  }

  var listGroup = document.getElementById('listGroup')

  webSocket.onmessage = function (event) {
    console.log(event.data)
    var msg = event.data.split('~#$#~')
    if (msg[0]=='decklist') {
      decklist = JSON.parse(msg[1])
      for(i=0;i<decklist.length;i++) {
        var li = document.createElement("li");
        li.className = "list-group-item";
        li.setAttribute("style","background-color: rgb(0,0,0);")
        li.appendChild(document.createTextNode(decklist[i]));
        listGroup.appendChild(li);
      }
      $('#listGroup li').on('click', function (e) {
        e.preventDefault()
        webSocket.send('setdeck~#$#~'+$(this)[0].innerText)
      })
    }
  }
  webSocket.send('getdecklist')

}


var showAmbossBar = false
var ambossBar

function updateAmbossBarVisibility() {
  if(!showAmbossBar) {
    ambossBar.style.display = 'none'
  } else {
    ambossBar.style.display = 'flex'
  }
}

function initSwipes() {

  var waitSwipeEnd = false
  var lastX = -1
  var lastY = -1
  var numScrollEvents = 0
  var scrollDir = 0

  var swipeRightSelect = document.getElementById("swipeRightSelect");
  var swipeLeftSelect = document.getElementById("swipeLeftSelect");
  var swipeUpSelect = document.getElementById("swipeUpSelect");
  var swipeDownSelect = document.getElementById("swipeDownSelect");
  var longPressSelect = document.getElementById("longPressSelect");
  var doubleTapSelect = document.getElementById("doubleTapSelect")
  var showAmbossBarCheckbox = document.getElementById("ambossBarCheckbox");
  ambossBar = document.getElementById('ambossBar')

  var swipeRightAction=0;
  var swipeLeftAction=0;
  var swipeUpAction=0;
  var swipeDownAction=0
  var longPressAction=0;
  var doubleTapAction=0;

  webSocket.onmessage = function(event) {
    console.log(event.data)
    var msg = event.data.split('-')
    if (msg[0]=='swipeprefs') {
      if(msg[1]=='X') {
        $('#swipeSettingsModal').modal('show')
      } else {
        var split = msg[1].split(',')
        swipeRightAction=parseInt(split[0])
        swipeLeftAction=parseInt(split[1])
        swipeUpAction=parseInt(split[2])
        swipeDownAction=parseInt(split[3])
        longPressAction=parseInt(split[4])
        doubleTapAction=parseInt(split[5])
        showAmbossBar=(split[6]=='true')
        swipeRightSelect.selectedIndex = swipeRightAction
        swipeLeftSelect.selectedIndex = swipeLeftAction
        swipeUpSelect.selectedIndex = swipeUpAction
        swipeDownSelect.selectedIndex = swipeDownAction
        longPressSelect.selectedIndex = longPressAction
        doubleTapSelect.selectedIndex = doubleTapAction
        showAmbossBarCheckbox.checked = showAmbossBar
        updateAmbossBarVisibility()
      }
    }
  };

  if (webSocket.readyState==1) {
    webSocket.send('getprefs-swipeprefs');
    console.log('requested prefs')
  } else {
    webSocket.onopen = function(event) {
      webSocket.send('getprefs-swipeprefs');
      console.log('requested prefs')
    };
  }

  $('#swipeSettingsModal').on('hidden.bs.modal', function (e) {
    swipeRightAction=swipeRightSelect.selectedIndex
    swipeLeftAction=swipeLeftSelect.selectedIndex
    swipeUpAction=swipeUpSelect.selectedIndex
    swipeDownAction=swipeDownSelect.selectedIndex
    longPressAction=longPressSelect.selectedIndex
    doubleTapAction=doubleTapSelect.selectedIndex
    showAmbossBar=showAmbossBarCheckbox.checked
    updateAmbossBarVisibility()
    var save = 'setprefs-swipeprefs-'+ swipeRightAction+','+ swipeLeftAction+','+ swipeUpAction+','+ swipeDownAction+','+ longPressAction+','+ doubleTapAction+','+ showAmbossBar
    webSocket.send(save)
  })

  $('#swipeArea').on('drag', function(e) {
    if(!waitSwipeEnd) {
      waitSwipeEnd = true
      var delay=0
      if (webSocket.readyState!=1) {
        createSocket()
        delay=200
      }
      var actionstr=''
      if(e.orientation=='horizontal') {
        if(e.direction==1) {
          // swipe Right
          actionstr=dict[swipeRightAction]
        } else {
          // swipe left
          actionstr=dict[swipeLeftAction]
        }
      } else {
        if(e.direction==1) {
          // swipe Down
          actionstr=dict[swipeDownAction]
        } else {
          //swipe up
          actionstr=dict[swipeUpAction]
        }
      }
      if(actionstr=='scrollup' || actionstr=='scrolldown') {
        var pageupdown = false
        var flip = false
        var dx = e.x-lastX
        if (lastX==-1) dx=0
        var dy = e.y-lastY
        if (lastY==-1) dy=0
        if(e.orientation=='horizontal') {
          if (Math.abs(dx)<0.5) {
            actionstr = 'none'
          } else if (dx*e.direction<0) {
            flip=true
          }
          if(Math.abs(dx)>30) pageupdown=true
        } else {
          if (Math.abs(dy)<0.5) {
            actionstr = 'none'
          } else if(dy*e.direction<0) {
            flip=true
          }
          if(Math.abs(dy)>30) pageupdown = true
        }
        if(flip) {
          if(actionstr=='scrollup') {
            actionstr = 'scrolldown'
          } else if(actionstr=='scrolldown') {
            actionstr = 'scrollup'
          }
        }
        if(actionstr=='scrolldown') {
          scrollDir=1
        } else if(actionstr=='scrollup') {
          scrollDir=-1
        }
        numScrollEvents=numScrollEvents+1
        lastX=e.x
        lastY=e.y
        if(pageupdown && numScrollEvents<4) {
          if(actionstr=='scrolldown') {
            actionstr='pagedown'
            numScrollEvents=0
          } else if(actionstr=='scrollup') {
            actionstr='pageup'
            numScrollEvents=0
          }
        } else {
          setTimeout(function(){ waitSwipeEnd = false; }, 10);
        }
      }
      if(actionstr!='none') setTimeout(function(){ webSocket.send(actionstr); }, delay);
      e.preventDefault();
    }
  });

  $('#swipeArea').on('press', function(e) {
    //long Press
    var delay=0
    if(webSocket.readyState!=1) {
      createSocket()
      delay=200
    }
    setTimeout(function(){ webSocket.send(dict[longPressAction]); }, delay);
    if (window.navigator && window.navigator.vibrate) { window.navigator.vibrate(100); }
    e.preventDefault();
  });

  $('#swipeArea').on('doubletap', function(e) {
    //doubletap
    var delay=0
    if(webSocket.readyState!=1) {
      createSocket()
      delay=200
    }
    setTimeout(function(){ webSocket.send(dict[doubleTapAction]); }, delay);
    e.preventDefault();
  });

  function touchendfunc() {
    if(numScrollEvents>0 && numScrollEvents<10) {
      if(scrollDir==1) {
        webSocket.send('pagedown');
      } else if (scrollDir==-1) {
        webSocket.send('pageup');
      }
    };
    numScrollEvents=0;
    scrollDir=0;
    waitSwipeEnd=false;
    lastX=-1;
    lastY=-1;
  }

  $('#swipeArea').on('touchend', function(e) {
    //touchend
    setTimeout(function(){ touchendfunc(); }, 20);
  });


}


function initTaps() {

  //taps.html specific

  // initialize variables

  var leftTapSelect = document.getElementById("leftTapSelect");
  var leftSwipeSelect = document.getElementById("leftSwipeSelect");
  var leftLongPressSelect = document.getElementById("leftLongPressSelect");
  var rightTapSelect = document.getElementById("rightTapSelect");
  var rightSwipeSelect = document.getElementById("rightSwipeSelect");
  var rightLongPressSelect = document.getElementById("rightLongPressSelect")
  var tapAmbossBarCheckbox = document.getElementById("tapAmbossBarCheckbox");
  ambossBar = document.getElementById('ambossBar')

  var leftTapAction=0;
  var leftSwipeAction=0;
  var leftLongPressAction=0;
  var rightTapAction=0
  var rightSwipeAction=0;
  var rightLongPressAction=0;

  // handle requesting settings and modal

  webSocket.onmessage = function(event) {
    console.log(event.data)
    var msg = event.data.split('-')
    if (msg[0]=='tapprefs') {
      if(msg[1]=='X') {
        $('#tapSettingsModal').modal('show')
      } else {
        var split = msg[1].split(',')
        leftTapAction=parseInt(split[0])
        leftSwipeAction=parseInt(split[1])
        leftLongPressAction=parseInt(split[2])
        rightTapAction=parseInt(split[3])
        rightSwipeAction=parseInt(split[4])
        rightLongPressAction=parseInt(split[5])
        showAmbossBar=(split[6]=='true')
        leftTapSelect.value = leftTapAction
        leftSwipeSelect.value = leftSwipeAction
        leftLongPressSelect.value = leftLongPressAction
        rightTapSelect.value = rightTapAction
        rightSwipeSelect.value = rightSwipeAction
        rightLongPressSelect.value = rightLongPressAction
        tapAmbossBarCheckbox.checked = showAmbossBar
        updateAmbossBarVisibility()
      }
    }
  };

  if (webSocket.readyState==1) {
    webSocket.send('getprefs-tapprefs');
    console.log('requested tapprefs')
  } else {
    webSocket.onopen = function(event) {
      webSocket.send('getprefs-tapprefs');
      console.log('requested tapprefs')
    };
  }

  $('#tapSettingsModal').on('hidden.bs.modal', function (e) {
    leftTapAction=leftTapSelect.value
    leftSwipeAction=leftSwipeSelect.value
    leftLongPressAction=leftLongPressSelect.value
    rightTapAction=rightTapSelect.value
    rightSwipeAction=rightSwipeSelect.value
    rightLongPressAction=rightLongPressSelect.value
    showAmbossBar=tapAmbossBarCheckbox.checked
    updateAmbossBarVisibility()
    var save = 'setprefs-tapprefs-'+ leftTapAction+','+ leftSwipeAction+','+ leftLongPressAction+','+ rightTapAction+','+ rightSwipeAction+','+ rightLongPressAction+','+ showAmbossBar
    webSocket.send(save)
  })

  // handle taps

  var leftTapAllowed = true
  $('#leftTapArea').on('tap doubletap', function(e) {
    if(leftTapAllowed) {
      var delay=0
      if (webSocket.readyState!=1) {
        createSocket()
        delay=200
      }
      setTimeout(function(){ webSocket.send(dict[leftTapAction]); }, delay);
    }
    e.preventDefault();
  });

  var rightTapAllowed = true
  $('#rightTapArea').on('tap doubletap', function(e) {
    if(rightTapAllowed) {
      var delay=0
      if (webSocket.readyState!=1) {
        createSocket()
        delay=200
      }
      setTimeout(function(){ webSocket.send(dict[rightTapAction]); }, delay);
    }
    e.preventDefault();
  });

  // handle swipes

  var waitLeftSwipeEnd = false
  var LlastY = -1
  var LnumScrollEvents = 0
  var LscrollDir = 0
  $('#leftTapArea').on('drag', function(e) {
    if(!waitLeftSwipeEnd) {
      waitLeftSwipeEnd=true
      var delay=0
      if (webSocket.readyState!=1) {
        createSocket()
        delay=200
      }
      if(leftSwipeAction!=9 && leftSwipeAction!=10) {
        setTimeout(function(){ webSocket.send(dict[leftSwipeAction]); }, delay);
      } else {
        if(e.orientation=='vertical') {
          var actionstr=''
          if(e.direction==1) {
            // swipe Down
            if(leftSwipeAction==9) actionstr='scrollup'
            else actionstr= 'scrolldown'
          } else {
            //swipe up
            if(leftSwipeAction==9) actionstr='scrolldown'
            else actionstr= 'scrollup'
          }
          var dy = e.y-LlastY
          if (LlastY==-1) dy=0
          if (Math.abs(dy)<0.5) {
            actionstr = 'none'
          } else if(dy*e.direction<0) {
            if(actionstr=='scrollup') actionstr = 'scrolldown'
            else actionstr = 'scrollup'
          }
          if(actionstr=='scrolldown') LscrollDir=1
          else LscrollDir=-1
          LnumScrollEvents=LnumScrollEvents+1
          LlastX=e.x
          LlastY=e.y
          if(Math.abs(dy)>30 && LnumScrollEvents<4) {
            if(actionstr=='scrolldown') {
              actionstr='pagedown'
              LnumScrollEvents=0
            } else if(actionstr=='scrollup') {
              actionstr='pageup'
              LnumScrollEvents=0
            }
          } else {
            setTimeout(function(){ waitLeftSwipeEnd = false; }, 10);
          }
          if(actionstr!='none') setTimeout(function(){ webSocket.send(actionstr); }, delay);
        }
      }
    }
    e.preventDefault();
  });
  function Ltouchendfunc() {
    if(LnumScrollEvents>0 && LnumScrollEvents<10) {
      if(LscrollDir==1) {
        webSocket.send('pagedown');
      } else if (LscrollDir==-1) {
        webSocket.send('pageup');
      }
    };
    LnumScrollEvents=0;
    LscrollDir=0;
    waitLeftSwipeEnd=false;
    LlastY=-1;
  }
  $('#leftTapArea').on('touchend', function(e) {
    //touchend
    setTimeout(function(){ Ltouchendfunc(); }, 20);
  });

  var waitRightSwipeEnd = false
  var RlastY = -1
  var RnumScrollEvents = 0
  var RscrollDir = 0
  $('#rightTapArea').on('drag', function(e) {
    if(!waitRightSwipeEnd) {
      waitRightSwipeEnd=true
      var delay=0
      if (webSocket.readyState!=1) {
        createSocket()
        delay=200
      }
      if(rightSwipeAction!=9 && rightSwipeAction!=10) {
        setTimeout(function(){ webSocket.send(dict[rightSwipeAction]); }, delay);
      } else {
        if(e.orientation=='vertical') {
          var actionstr=''
          if(e.direction==1) {
            // swipe Down
            if(rightSwipeAction==9) actionstr='scrollup'
            else actionstr= 'scrolldown'
          } else {
            //swipe up
            if(rightSwipeAction==9) actionstr='scrolldown'
            else actionstr= 'scrollup'
          }
          var dy = e.y-RlastY
          if (RlastY==-1) dy=0
          if (Math.abs(dy)<0.5) {
            actionstr = 'none'
          } else if(dy*e.direction<0) {
            if(actionstr=='scrollup') actionstr = 'scrolldown'
            else actionstr = 'scrollup'
          }
          if(actionstr=='scrolldown') RscrollDir=1
          else RscrollDir=-1
          RnumScrollEvents=RnumScrollEvents+1
          RlastX=e.x
          RlastY=e.y
          if(Math.abs(dy)>30 && RnumScrollEvents<4) {
            if(actionstr=='scrolldown') {
              actionstr='pagedown'
              RnumScrollEvents=0
            } else if(actionstr=='scrollup') {
              actionstr='pageup'
              RnumScrollEvents=0
            }
          } else {
            setTimeout(function(){ waitRightSwipeEnd = false; }, 10);
          }
          if(actionstr!='none') setTimeout(function(){ webSocket.send(actionstr); }, delay);
        }
      }
    }
    e.preventDefault();
  });
  function Rtouchendfunc() {
    if(RnumScrollEvents>0 && RnumScrollEvents<10) {
      if(RscrollDir==1) {
        webSocket.send('pagedown');
      } else if (RscrollDir==-1) {
        webSocket.send('pageup');
      }
    };
    RnumScrollEvents=0;
    RscrollDir=0;
    waitRightSwipeEnd=false;
    RlastY=-1;
  }
  $('#rightTapArea').on('touchend', function(e) {
    //touchend
    setTimeout(function(){ Rtouchendfunc(); }, 20);
  });

  // handle long press

  $('#leftTapArea').on('press', function(e) {
    //long Press
    var delay=0
    if(webSocket.readyState!=1) {
      createSocket()
      delay=200
    }
    setTimeout(function(){ webSocket.send(dict[leftLongPressAction]); }, delay);
    if (window.navigator && window.navigator.vibrate) { window.navigator.vibrate(100); }
    leftTapAllowed=false
    setTimeout(function(){ leftTapAllowed=true; }, 100);
    e.preventDefault();
  });

  $('#rightTapArea').on('press', function(e) {
    //long Press
    var delay=0
    if(webSocket.readyState!=1) {
      createSocket()
      delay=200
    }
    setTimeout(function(){ webSocket.send(dict[rightLongPressAction]); }, delay);
    if (window.navigator && window.navigator.vibrate) { window.navigator.vibrate(100); }
    rightTapAllowed = false
    setTimeout(function(){ rightTapAllowed=true; }, 100);
    e.preventDefault();
  });



}

function amboss(a) {
  var delay=0
  if(webSocket.readyState!=1) {
    createSocket()
    delay=200
  }
  var command="none"
  if(a==0) { command = "ambossprev" };
  if(a==1) { command = "ambossnext" };
  if(a==2) { command = "ambossclose" };
  setTimeout(function(){ webSocket.send(command); }, delay);
}

function fixDimensions() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    var matches = "true"
    var newHeight = document.documentElement.clientHeight
  } else {
    var matches = "false"
    var newHeight = window.innerHeight
  }
  //alert("innerHeight: " + window.innerHeight + "\ninnerWidth: " + window.innerWidth + "\norientation: " + window.orientation + "\nscreenheight: " + screen.height + "\nscreenwidth" + screen.width + "\nscreenavailheight" + screen.availHeight + "\nscreenavailwidth"+ screen.availWidth+ "\nclientheight" + document.documentElement.clientHeight + "\nclientwidth"+ document.documentElement.clientWidth+ "\nstandalone: "+matches)

  document.body.style.height=newHeight.toString()+'px';
  window.scroll(0,0);
}
window.addEventListener('resize', fixDimensions);
fixDimensions();

function goFullscreen() {
  if(document.documentElement.requestFullscreen) {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.getElementById('topMenuDiv').style.marginTop="20px";
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        document.getElementById('topMenuDiv').style.marginTop="10px";
      }
    }
  } else if(document.documentElement.webkitRequestFullscreen) {
    if (!document.webkitFullscreenElement) {
        document.documentElement.webkitRequestFullscreen();
        document.getElementById('topMenuDiv').style.marginTop="20px";
    } else {
      if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        document.getElementById('topMenuDiv').style.marginTop="10px";
      }
    }
  }
}
