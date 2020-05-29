



if(!window.location.pathname.endsWith("donate.html")) {

  var wslink = "ws://"+window.location.hostname+":"+(parseInt(window.location.port)+1).toString()

  if( /Android/i.test(navigator.userAgent) ) {
    var deeplink = "intent:#Intent;action=dabblingduckapps.ankimote.openfromweb;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;S.uri="+encodeURIComponent(wslink)+";S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.chrome.dev;end"
    // window.location.replace(deeplink);
  }

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

  var webSocket = new WebSocket(wslink)

  function attemptConnect() {
    if (webSocket.readyState==1) {
      webSocket.send("Hi");
    } else {
      alert("Connection Error")
    }
  }

  setTimeout(() => { attemptConnect() }, 500);

  document.getElementById('gigaDiv').addEventListener('touchmove', function(e) {
      e.preventDefault();
  }, { passive: false });

  if(!document.webkitFullscreenEnabled) {
    $('#fullscreenButtonCell').remove()
  }

  var ambossBar = document.getElementById('ambossBar')

  function updateAmbossBarVisibility() {
    if(!showAmbossBar) {
      ambossBar.style.display = 'none'
    } else {
      ambossBar.style.display = 'flex'
    }
  }

  if(!window.location.pathname.endsWith("taps.html")) {

    var waitSwipeEnd = false

    var swipeRightSelect = document.getElementById("swipeRightSelect");
    var swipeLeftSelect = document.getElementById("swipeLeftSelect");
    var swipeUpSelect = document.getElementById("swipeUpSelect");
    var swipeDownSelect = document.getElementById("swipeDownSelect");
    var longPressSelect = document.getElementById("longPressSelect");
    var doubleTapSelect = document.getElementById("doubleTapSelect")
    var showAmbossBarCheckbox = document.getElementById("ambossBarCheckbox");

    var swipeRightAction=0;
    var swipeLeftAction=0;
    var swipeUpAction=0;
    var swipeDownAction=0
    var longPressAction=0;
    var doubleTapAction=0;
    var showAmbossBar=false;

    if(Cookies.get("swipeRightAction")==undefined) {
      $('#swipeSettingsModal').modal('show')
    } else {
      swipeRightAction = parseInt(Cookies.get("swipeRightAction"))
      swipeRightSelect.selectedIndex = swipeRightAction
      swipeLeftAction = parseInt(Cookies.get("swipeLeftAction"))
      swipeLeftSelect.selectedIndex = swipeLeftAction
      swipeUpAction = parseInt(Cookies.get("swipeUpAction"))
      swipeUpSelect.selectedIndex = swipeUpAction
      swipeDownAction = parseInt(Cookies.get("swipeDownAction"))
      swipeDownSelect.selectedIndex = swipeDownAction
      longPressAction = parseInt(Cookies.get("longPressAction"))
      longPressSelect.selectedIndex = longPressAction
      doubleTapAction = parseInt(Cookies.get("doubleTapAction"))
      doubleTapSelect.selectedIndex = doubleTapAction
      showAmbossBar = (Cookies.get("showAmbossBar")=="true")
      showAmbossBarCheckbox.checked = showAmbossBar
      updateAmbossBarVisibility()
    }

    $('#swipeSettingsModal').on('hidden.bs.modal', function (e) {
      swipeRightAction=swipeRightSelect.selectedIndex
      Cookies.set("swipeRightAction",swipeRightAction.toString(), { expires: 365 })
      swipeLeftAction=swipeLeftSelect.selectedIndex
      Cookies.set("swipeLeftAction",swipeLeftAction.toString(), { expires: 365 })
      swipeUpAction=swipeUpSelect.selectedIndex
      Cookies.set("swipeUpAction",swipeUpAction.toString(), { expires: 365 })
      swipeDownAction=swipeDownSelect.selectedIndex
      Cookies.set("swipeDownAction",swipeDownAction.toString(), { expires: 365 })
      longPressAction=longPressSelect.selectedIndex
      Cookies.set("longPressAction",longPressAction.toString(), { expires: 365 })
      doubleTapAction=doubleTapSelect.selectedIndex
      Cookies.set("doubleTapAction",doubleTapAction.toString(), { expires: 365 })
      showAmbossBar=showAmbossBarCheckbox.checked
      Cookies.set("showAmbossBar",showAmbossBar.toString(), { expires: 365 })
      updateAmbossBarVisibility()
    })

    $('#swipeArea').on('drag', function(e) {
      if(!waitSwipeEnd) {
        waitSwipeEnd=true
        var delay=0
        if (webSocket.readyState==3) {
          webSocket = new WebSocket(wslink)
          setTimeout(() => { attemptConnect() }, 500);
          delay=200
        }
        if(e.orientation=='horizontal') {
          if(e.direction==1) {
            // swipe Right
            setTimeout(function(){ webSocket.send(dict[swipeRightAction]); }, delay);
          } else {
            // swipe left
            setTimeout(function(){ webSocket.send(dict[swipeLeftAction]); }, delay);
          }
        } else {
          if(e.direction==1) {
            // swipe Down
            setTimeout(function(){ webSocket.send(dict[swipeDownAction]); }, delay);
          } else {
            //swipe up
            setTimeout(function(){ webSocket.send(dict[swipeUpAction]); }, delay);
          }
        }
      }
      e.preventDefault();
    });

    $('#swipeArea').on('press', function(e) {
      //long Press
      var delay=0
      if(webSocket.readyState==3) {
        webSocket = new WebSocket(wslink)
        setTimeout(() => { attemptConnect() }, 500);
        delay=200
      }
      setTimeout(function(){ webSocket.send(dict[longPressAction]); }, delay);
      window.navigator.vibrate(100);
      e.preventDefault();
    });

    $('#swipeArea').on('doubletap', function(e) {
      //doubletap
      var delay=0
      if(webSocket.readyState==3) {
        webSocket = new WebSocket(wslink)
        setTimeout(() => { attemptConnect() }, 500);
        delay=200
      }
      setTimeout(function(){ webSocket.send(dict[doubleTapAction]); }, delay);
      e.preventDefault();
    });

    $('#swipeArea').on('touchend', function(e) {
      //touchend
      setTimeout(function(){ waitSwipeEnd=false; }, 20);
    });


  } else {

    //taps.html specific

    // initialize variables

    var leftTapSelect = document.getElementById("leftTapSelect");
    var leftSwipeSelect = document.getElementById("leftSwipeSelect");
    var leftLongPressSelect = document.getElementById("leftLongPressSelect");
    var rightTapSelect = document.getElementById("rightTapSelect");
    var rightSwipeSelect = document.getElementById("rightSwipeSelect");
    var rightLongPressSelect = document.getElementById("rightLongPressSelect")
    var tapAmbossBarCheckbox = document.getElementById("tapAmbossBarCheckbox");

    var leftTapAction=0;
    var leftSwipeAction=0;
    var leftLongPressAction=0;
    var rightTapAction=0
    var rightSwipeAction=0;
    var rightLongPressAction=0;
    var showAmbossBar=false;

    // handle cookies and modal

    if(Cookies.get("leftTapAction")==undefined) {
      $('#tapSettingsModal').modal('show')
    } else {
      leftTapAction = parseInt(Cookies.get("leftTapAction"))
      leftTapSelect.value = leftTapAction
      leftSwipeAction = parseInt(Cookies.get("leftSwipeAction"))
      leftSwipeSelect.value = leftSwipeAction
      leftLongPressAction = parseInt(Cookies.get("leftLongPressAction"))
      leftLongPressSelect.value = leftLongPressAction
      rightTapAction = parseInt(Cookies.get("rightTapAction"))
      rightTapSelect.value = rightTapAction
      rightSwipeAction = parseInt(Cookies.get("rightSwipeAction"))
      rightSwipeSelect.value = rightSwipeAction
      rightLongPressAction = parseInt(Cookies.get("rightLongPressAction"))
      rightLongPressSelect.value = rightLongPressAction
      showAmbossBar = (Cookies.get("tapAmbossBar")=="true")
      tapAmbossBarCheckbox.checked = showAmbossBar
      updateAmbossBarVisibility()
    }

    $('#tapSettingsModal').on('hidden.bs.modal', function (e) {
      leftTapAction=leftTapSelect.value
      Cookies.set("leftTapAction",leftTapAction.toString(), { expires: 365 })
      leftSwipeAction=leftSwipeSelect.value
      Cookies.set("leftSwipeAction",leftSwipeAction.toString(), { expires: 365 })
      leftLongPressAction=leftLongPressSelect.value
      Cookies.set("leftLongPressAction",leftLongPressAction.toString(), { expires: 365 })
      rightTapAction=rightTapSelect.value
      Cookies.set("rightTapAction",rightTapAction.toString(), { expires: 365 })
      rightSwipeAction=rightSwipeSelect.value
      Cookies.set("rightSwipeAction",rightSwipeAction.toString(), { expires: 365 })
      rightLongPressAction=rightLongPressSelect.value
      Cookies.set("rightLongPressAction",rightLongPressAction.toString(), { expires: 365 })
      showAmbossBar=tapAmbossBarCheckbox.checked
      Cookies.set("tapAmbossBar",showAmbossBar.toString(), { expires: 365 })
      updateAmbossBarVisibility()
    })

    // handle taps

    $('#leftTapArea').on('tap', function(e) {
      var delay=0
      if (webSocket.readyState==3) {
        webSocket = new WebSocket(wslink)
        setTimeout(() => { attemptConnect() }, 500);
        delay=200
      }
      setTimeout(function(){ webSocket.send(dict[leftTapAction]); }, delay);
      e.preventDefault();
    });

    $('#rightTapArea').on('tap', function(e) {
      var delay=0
      if (webSocket.readyState==3) {
        webSocket = new WebSocket(wslink)
        setTimeout(() => { attemptConnect() }, 500);
        delay=200
      }
      setTimeout(function(){ webSocket.send(dict[rightTapAction]); }, delay);
      e.preventDefault();
    });

    // handle swipes

    var waitLeftSwipeEnd = false
    $('#leftTapArea').on('drag', function(e) {
      if(!waitLeftSwipeEnd) {
        waitLeftSwipeEnd=true
        var delay=0
        if (webSocket.readyState==3) {
          webSocket = new WebSocket(wslink)
          setTimeout(() => { attemptConnect() }, 500);
          delay=200
        }
        if(leftSwipeAction!=9) {
          setTimeout(function(){ webSocket.send(dict[leftSwipeAction]); }, delay);
        } else {
          if(e.orientation=='vertical') {
            if(e.direction==1) {
              // swipe Down
              setTimeout(function(){ webSocket.send("scrollup"); }, delay);
            } else {
              //swipe up
              setTimeout(function(){ webSocket.send("scrolldown"); }, delay);
            }
          }
        }
      }
      e.preventDefault();
    });
    $('#leftTapArea').on('touchend', function(e) {
      //touchend
      setTimeout(function(){ waitLeftSwipeEnd=false; }, 20);
    });

    var waitRightSwipeEnd = false
    $('#rightTapArea').on('drag', function(e) {
      if(!waitRightSwipeEnd) {
        waitRightSwipeEnd=true
        var delay=0
        if (webSocket.readyState==3) {
          webSocket = new WebSocket(wslink)
          setTimeout(() => { attemptConnect() }, 500);
          delay=200
        }
        if(rightSwipeAction!=9) {
          setTimeout(function(){ webSocket.send(dict[rightSwipeAction]); }, delay);
        } else {
          if(e.orientation=='vertical') {
            if(e.direction==1) {
              // swipe Down
              setTimeout(function(){ webSocket.send("scrollup"); }, delay);
            } else {
              //swipe up
              setTimeout(function(){ webSocket.send("scrolldown"); }, delay);
            }
          }
        }
      }
      e.preventDefault();
    });
    $('#rightTapArea').on('touchend', function(e) {
      //touchend
      setTimeout(function(){ waitRightSwipeEnd=false; }, 20);
    });

    // handle long press

    $('#leftTapArea').on('press', function(e) {
      //long Press
      var delay=0
      if(webSocket.readyState==3) {
        webSocket = new WebSocket(wslink)
        setTimeout(() => { attemptConnect() }, 500);
        delay=200
      }
      setTimeout(function(){ webSocket.send(dict[leftLongPressAction]); }, delay);
      window.navigator.vibrate(100);
      e.preventDefault();
    });

    $('#rightTapArea').on('press', function(e) {
      //long Press
      var delay=0
      if(webSocket.readyState==3) {
        webSocket = new WebSocket(wslink)
        setTimeout(() => { attemptConnect() }, 500);
        delay=200
      }
      setTimeout(function(){ webSocket.send(dict[rightLongPressAction]); }, delay);
      window.navigator.vibrate(100);
      e.preventDefault();
    });



  }

  function amboss(a) {
    var delay=0
    if(webSocket.readyState==3) {
      webSocket = new WebSocket(wslink)
      setTimeout(() => { attemptConnect() }, 500);
      delay=200
    }
    var command="none"
    if(a==0) { command = "ambossprev" };
    if(a==1) { command = "ambossnext" };
    if(a==2) { command = "ambossclose" };
    setTimeout(function(){ webSocket.send(command); }, delay);
  }

  function goFullscreen() {
    if(document.documentElement.requestFullscreen) {
      if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } else if(document.documentElement.webkitRequestFullscreen) {
      if (!document.webkitFullscreenElement) {
          document.documentElement.webkitRequestFullscreen();
      } else {
        if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }
  }

}
