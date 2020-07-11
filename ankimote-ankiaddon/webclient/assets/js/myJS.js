
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
  8: "showhints",
  21: "cmd1",
  22: "cmd2",
  23: "cmd3",
  24: "cmd4",
  25: "cmd5",
  31: "hook1",
  32: "hook2",
  33: "hook3"
};

var names = {
  0: "none",
  1: "Good",
  2: "Again",
  3: "Easy",
  4: "Hard",
  5: "Unfo",
  6: "▲",
  7: "▼",
  8: "Hints",
  21: "CMD 1",
  22: "CMD 2",
  23: "CMD 3",
  24: "CMD 4",
  25: "CMD 5",
  31: "Hook 1",
  32: "Hook 2",
  33: "Hook 3"
};

function changeMode(newMode) {
  if (newMode == "swipes") {
    webSocket.send('setprefs-currentmode-'+newMode)
    $("#container").load("swipes.html?v=2 #container", function() {
      generalInit();
      initSwipes();
    });
  }
  else if (newMode == "taps") {
    webSocket.send('setprefs-currentmode-'+newMode)
    $("#container").load("taps.html?v=2 #container", function() {
      generalInit();
      initTaps();
    });
  }
  else if (newMode == "switchdeck") {
    $("#container").load("switchdeck.html?v=2 #container", function() {
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

  if(!document.webkitFullscreenEnabled) {
    $('#goFullscreenButton').remove()
  }

  fixDimensions()
  setTimeout(function(){ fixDimensions(); }, 250);
  handleFullscreenChange()

  document.getElementById('gigaDiv').addEventListener('touchmove', function(e) {
      e.preventDefault();
  }, { passive: false });

}


function initSwitchdeck() {
  if(!document.webkitFullscreenEnabled) {
    $('#goFullscreenButton').remove()
  }

  fixDimensions()
  handleFullscreenChange()

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
        webSocket.send('setdeck~#$#~'+$(this)[0].innerHTML)
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

var action1Action=0;
var action2Action=0;
var action3Action=0;
var action4Action=0;

function refreshCmdLabels(selectArray, callback) {
  webSocket.onmessage = function(event) {
    console.log(event.data)
    var msg = event.data.split('~#$#~')
    if (msg[0]=='cmdlabels') {
      for(cmdnum=1;cmdnum<6;cmdnum++) {
        names[20+cmdnum] = msg[cmdnum]
      }
      for(selectIndex=0;selectIndex<selectArray.length;selectIndex++){
        var thisSelect = selectArray[selectIndex];
        for(optionsIndex=0;optionsIndex<thisSelect.options.length;optionsIndex++){
          var thisOption = thisSelect.options[optionsIndex];
          for(cmdnum=1;cmdnum<6;cmdnum++) {
            var cmdnumstr = "2" + cmdnum.toString();
            if(thisOption.value == cmdnumstr) {
              thisOption.text = msg[cmdnum];
            }
          }
        }
      }
    }
    callback();
  };
  webSocket.send('getcmdlabels');
  console.log('requested cmdlabels');
}

function initSwipes() {

  var actionBar = document.getElementById("actionBar")
  var action1 = document.getElementById("action1")
  var action2 = document.getElementById("action2")
  var action3 = document.getElementById("action3")
  var action4 = document.getElementById("action4")
  function updateActionBarVisibility() {
    if(action1Action+action2Action+action3Action+action4Action==0) {
      actionBar.style.display = 'none'
    } else {

      actionBar.style.display = 'inline-flex'

      for(i=1;i<5;i++) {
        var actioniAction = eval("action"+i+"Action")
        var actioni = eval("action"+i)
        if(actioniAction==0) {
          actioni.style.display = 'none'
        } else {
          actioni.style.display = 'inline-block'
          actioni.innerText = names[actioniAction]
        }
      }

    }
  }

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
  var action1Select = document.getElementById("action1Select")
  var action2Select = document.getElementById("action2Select")
  var action3Select = document.getElementById("action3Select")
  var action4Select = document.getElementById("action4Select")
  var showAmbossBarCheckbox = document.getElementById("ambossBarCheckbox");

  var swipeRightAction=0;
  var swipeLeftAction=0;
  var swipeUpAction=0;
  var swipeDownAction=0
  var longPressAction=0;
  var doubleTapAction=0;

  var swipeSelectArray = [swipeRightSelect, swipeLeftSelect, swipeUpSelect, swipeDownSelect, longPressSelect, doubleTapSelect, action1Select, action2Select, action3Select, action4Select]

  $('#swipeSettingsModal').on('show.bs.modal', function (e) {
    refreshCmdLabels(swipeSelectArray, updateActionBarVisibility)
  });

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
        action1Action=parseInt(split[7])
        action2Action=parseInt(split[8])
        action3Action=parseInt(split[9])
        action4Action=parseInt(split[10])
        swipeRightSelect.value = swipeRightAction
        swipeLeftSelect.value = swipeLeftAction
        swipeUpSelect.value = swipeUpAction
        swipeDownSelect.value = swipeDownAction
        longPressSelect.value = longPressAction
        doubleTapSelect.value = doubleTapAction
        showAmbossBarCheckbox.checked = showAmbossBar
        action1Select.value = action1Action
        action2Select.value = action2Action
        action3Select.value = action3Action
        action4Select.value = action4Action

        updateAmbossBarVisibility()
        refreshCmdLabels(swipeSelectArray, updateActionBarVisibility)
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
    swipeRightAction=swipeRightSelect.value
    swipeLeftAction=swipeLeftSelect.value
    swipeUpAction=swipeUpSelect.value
    swipeDownAction=swipeDownSelect.value
    longPressAction=longPressSelect.value
    doubleTapAction=doubleTapSelect.value
    showAmbossBar=showAmbossBarCheckbox.checked
    action1Action=action1Select.value
    action2Action=action2Select.value
    action3Action=action3Select.value
    action4Action=action4Select.value
    updateAmbossBarVisibility()
    updateActionBarVisibility()
    var save = 'setprefs-swipeprefs-'+ swipeRightAction+','+ swipeLeftAction+','+ swipeUpAction+','+ swipeDownAction+','+ longPressAction+','+ doubleTapAction+','+ showAmbossBar+','+ action1Action+','+ action2Action+','+ action3Action+','+ action4Action
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
  var leftSwipeLeftSelect = document.getElementById("leftSwipeLeftSelect");
  var leftSwipeRightSelect = document.getElementById("leftSwipeRightSelect");
  var rightSwipeLeftSelect = document.getElementById("rightSwipeLeftSelect");
  var rightSwipeRightSelect = document.getElementById("rightSwipeRightSelect");

  var leftTapAction=0;
  var leftSwipeAction=0;
  var leftLongPressAction=0;
  var rightTapAction=0
  var rightSwipeAction=0;
  var rightLongPressAction=0;
  var leftSwipeLeftAction=0;
  var leftSwipeRightAction=0;
  var rightSwipeLeftAction=0;
  var rightSwipeRightAction=0;

  // handle custom action labels

  var tapSelectArray = [leftTapSelect, leftSwipeSelect, leftLongPressSelect, rightTapSelect, rightSwipeSelect, rightLongPressSelect, leftSwipeLeftSelect, leftSwipeRightSelect, rightSwipeLeftSelect, rightSwipeRightSelect];

  $('#tapSettingsModal').on('show.bs.modal', function (e) {
    refreshCmdLabels(tapSelectArray, function () {})
  });

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
        leftSwipeLeftAction=parseInt(split[7])
        leftSwipeRightAction=parseInt(split[8])
        rightSwipeLeftAction=parseInt(split[9])
        rightSwipeRightAction=parseInt(split[10])
        leftTapSelect.value = leftTapAction
        leftSwipeSelect.value = leftSwipeAction
        leftLongPressSelect.value = leftLongPressAction
        rightTapSelect.value = rightTapAction
        rightSwipeSelect.value = rightSwipeAction
        rightLongPressSelect.value = rightLongPressAction
        tapAmbossBarCheckbox.checked = showAmbossBar
        leftSwipeLeftSelect.value = leftSwipeLeftAction
        leftSwipeRightSelect.value = leftSwipeRightAction
        rightSwipeLeftSelect.value = rightSwipeLeftAction
        rightSwipeRightSelect.value = rightSwipeRightAction
        updateAmbossBarVisibility()
        refreshCmdLabels(tapSelectArray, function () {})
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
    leftSwipeLeftAction=leftSwipeLeftSelect.value
    leftSwipeRightAction=leftSwipeRightSelect.value
    rightSwipeLeftAction=rightSwipeLeftSelect.value
    rightSwipeRightAction=rightSwipeRightSelect.value
    updateAmbossBarVisibility()
    var save = 'setprefs-tapprefs-'+ leftTapAction+','+ leftSwipeAction+','+ leftLongPressAction+','+ rightTapAction+','+ rightSwipeAction+','+ rightLongPressAction+','+ showAmbossBar+','+ leftSwipeLeftAction+','+ leftSwipeRightAction+','+ rightSwipeLeftAction+','+ rightSwipeRightAction
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
      if(e.orientation=='vertical') {
        //vertical swipe
        if(leftSwipeAction!=9 && leftSwipeAction!=10) {
          setTimeout(function(){ webSocket.send(dict[leftSwipeAction]); }, delay);
        } else {
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
      } else {
        //horizontal swipe
        var actionstr=''
        if(e.direction==1) {
          // swipe Right
          actionstr=dict[leftSwipeRightAction]
        } else {
          // swipe left
          actionstr=dict[leftSwipeLeftAction]
        }
        if(actionstr=='scrolldown') {
          actionstr='pagedown'
        } else if(actionstr=='scrollup') {
          actionstr='pageup'
        }
        if(actionstr!='none') setTimeout(function(){ webSocket.send(actionstr); }, delay);
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
      if(e.orientation=='vertical') {
        if(rightSwipeAction!=9 && rightSwipeAction!=10) {
          setTimeout(function(){ webSocket.send(dict[rightSwipeAction]); }, delay);
        } else {
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
      } else {
        //horizontal swipe
        var actionstr=''
        if(e.direction==1) {
          // swipe Right
          actionstr=dict[rightSwipeRightAction]
        } else {
          // swipe left
          actionstr=dict[rightSwipeLeftAction]
        }
        if(actionstr=='scrolldown') {
          actionstr='pagedown'
        } else if(actionstr=='scrollup') {
          actionstr='pageup'
        }
        if(actionstr!='none') setTimeout(function(){ webSocket.send(actionstr); }, delay);
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

function onActionBarClicked(i) {
  var delay=0
  if(webSocket.readyState!=1) {
    createSocket()
    delay=200
  }
  var actionstr = dict[eval("action"+i+"Action")]
  if(actionstr=='scrolldown') {
    actionstr='pagedown'
  } else if(actionstr=='scrollup') {
    actionstr='pageup'
  }
  setTimeout(function(){ webSocket.send(actionstr); }, delay);
}

function fixDimensions() {
  if(document.getElementById('ambossBarHoriz')) {
    if(window.innerHeight>window.innerWidth) {
      document.getElementById('ambossBar').style.display = "none"
      document.getElementById('ambossBarHoriz').style.display = "flex"
      ambossBar=document.getElementById('ambossBarHoriz')
    } else {
      document.getElementById('ambossBar').style.display = "flex"
      document.getElementById('ambossBarHoriz').style.display = "none"
      ambossBar=document.getElementById('ambossBar')
    }
    updateAmbossBarVisibility()
  } else if (document.getElementById('ambossBar')) {
    ambossBar=document.getElementById('ambossBar')
  }

  if (window.matchMedia('(display-mode: standalone)').matches) {
    var newHeight = document.documentElement.clientHeight
  } else {
    var newHeight = window.innerHeight
  }

  document.body.style.height=newHeight.toString()+'px';
  window.scroll(0,0);
}
window.addEventListener('resize', fixDimensions);

function handleFullscreenChange() {
  if (document.fullscreenElement) {
      document.getElementById('container').style.marginTop="10px";
      if(document.getElementById("fullscreenIcon")) document.getElementById("fullscreenIcon").innerHTML="fullscreen_exit"
  } else if (document.webkitFullscreenElement) {
      document.getElementById('container').style.marginTop="10px";
      if(document.getElementById("fullscreenIcon")) document.getElementById("fullscreenIcon").innerHTML="fullscreen_exit"
  } else {
      document.getElementById('container').style.marginTop="0px";
      if(document.getElementById("fullscreenIcon")) document.getElementById("fullscreenIcon").innerHTML="fullscreen"
  }
}

document.onfullscreenchange = function ( event ) {
    handleFullscreenChange()
};

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
