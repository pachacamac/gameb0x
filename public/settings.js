var SettingsHelper = (function(opts){
  opts = opts || {};

  function createStyleSheet() {
    var style = document.createElement("style");
    // style.setAttribute("media", "screen") // Add a media (and/or media query) here if you'd like!
    style.appendChild(document.createTextNode("")); // WebKit hack
    document.head.appendChild(style);

    return {
      addCSSRule: function(selector, rules, index){
        index = index || 0;
        if("insertRule" in style.sheet){ style.sheet.insertRule(selector + "{" + rules + "}", index) }
        else if("addRule" in style.sheet){ style.sheet.addRule(selector, rules, index) }
      },
      sheet: style.sheet
    }
  }

  var style = createStyleSheet();
  style.addCSSRule('html, body', 'height:100%;overflow:auto');//fixing disappearing button in fullscreen

  // style.addCSSRule('#settingsHelperButton',
  //   'height: 20vh; width: 20vh; z-index: 998;'+
  //   'background-color: #77f; border-radius: 50%; background-image: url(../z_button.png); background-size: cover;'
  // );

  style.addCSSRule('.settingsHelperButton',
    'background-image: -webkit-linear-gradient(top, #f4f1ee, #fff);'+
    'background-image: linear-gradient(top, #f4f1ee, #fff);'+
    'z-index: 998; border-radius: 50%; transition: all .1s linear;'+
    'box-shadow: 0 .4vh .5vh 0 rgba(0, 0, 0, .3), inset 0 4px 1px 1px white, inset 0px -3px 1px 1px rgba(204,198,197,.5);'+
    'height: 16vh; width: 16vh;'
  );
  style.addCSSRule('.settingsHelperButton:after',
    'content: "..."; color:#c9c6c4;'+
    'font-size: 8vh;'+
    'left:5.3vh; line-height: 12vh;'+
    'display: block; position: absolute;'+
    'height: 8vh; width: 8vh;'+
    'text-decoration: none; text-shadow: 0px -1px 1px #bdb5b4, 1px 1px 1px white;'
  );
  style.addCSSRule('.settingsHelperButton:active',
    'background-image: -webkit-linear-gradient(top, #efedec, #f7f4f4);'+
    'background-image: linear-gradient(top, #efedec, #f7f4f4);'+
    'box-shadow: 0 3px 5px 0 rgba(0,0,0,.4), inset 0px -3px 1px 1px rgba(204,198,197,.5);'
  );

  style.addCSSRule('.settingsHelperButton.centered', 'position: relative; margin-left: auto; margin-right: auto; top: 40vh;');
  style.addCSSRule('.settingsHelperButton.lowerCenter', 'position: relative; margin-left: auto; margin-right: auto; top: 80vh;');
  style.addCSSRule('.settingsHelperButton.lowerRight', 'position: absolute; right: 0; bottom: 0;');

  // style.addCSSRule('#settingsHelperButton:active', 'background-color: #f77; background-image: url(../z_button_pressed.png);');

  style.addCSSRule('#settingsHelperMenu',
    'display: none; position: absolute; left:0; top: 0; width: 100%; height: 100%; z-index: 999;'+
    'flex-wrap: wrap; font-weight: bold; color: #eee; font-size: 1em; font-family: arial;'
  );
  style.addCSSRule('#settingsHelperMenu.visible', 'display: flex;');
  style.addCSSRule('.settingsHelperMenuItem',
    'background-color: #111; flex: 1; border: 1px solid #aaa; width: 25%; min-width: 200px;'+
    'display: flex; justify-content: center; flex-direction: column; text-align: center;'
  );
  style.addCSSRule('.settingsHelperMenuItem:hover','color: #d22; background-color: #222;');
  style.addCSSRule('.settingsHelperMenuItem:active','background-color: #333;');

  var menuBtn = document.createElement('div');
  menuBtn.className = 'settingsHelperButton';
  opts.buttonPosition = opts.buttonPosition || 'centered';
  menuBtn.className += ' '+opts.buttonPosition;
  menuBtn.id = 'settingsHelperButton';
  document.body.appendChild(menuBtn);

  var menu = document.createElement('div');
  menu.id = 'settingsHelperMenu';
  document.body.appendChild(menu);

  function buttonClick(e){
    e.preventDefault();
    menu.classList.toggle('visible');
  }
  menuBtn.addEventListener('click', buttonClick);
  menuBtn.addEventListener('touchend', buttonClick);

  function callbackWrapper( callback){
    return function(e){
      e.preventDefault();
      var result = callback(e);
      menu.classList.toggle('visible');
      return result;
    }
  }
  function addItem(name, callback){
    var item = document.createElement('div');
    item.className = 'settingsHelperMenuItem';
    item.setAttribute('name', name);
    item.innerHTML = name;
    item.addEventListener('click', callbackWrapper(callback));
    item.addEventListener('touchend', callbackWrapper(callback));
    menu.appendChild(item);
  }

  function removeItem(name){
    var items = document.getElementsByName(name, menu);
    for(var i=0;i<items.length; i++) menu.removeChild(items[i]);
  }

  function changeSetting(name, text){
    text = text || "Change setting "+name;
    var value = prompt(text, localStorage.getItem(name));
    if(value !== null){ localStorage.setItem(name, value) }
    return value;
  }

  function getSetting(name){ return localStorage.getItem(name); }
  function setSetting(name, val){ return localStorage.setItem(name, val); }

  function isFullscreen(){ return window.innerHeight == screen.height }
  function requestFullscreen(){
    var e = document.body;
    if(e.requestFullscreen) e.requestFullscreen();
    else if(e.webkitRequestFullscreen) e.webkitRequestFullscreen();
    else if(e.mozRequestFullScreen) e.mozRequestFullScreen();
    else if(e.msRequestFullscreen) e.msRequestFullscreen();
  }
  function exitFullscreen(){
    if(document.exitFullscreen) document.exitFullscreen();
    else if(document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if(document.cancelFullscreen) document.cancelFullscreen();
  }
  function toggleFullscreen(){ isFullscreen() ? exitFullscreen() : requestFullscreen() }

  addItem('back', function(){});
  addItem('fullscreen', toggleFullscreen);
  addItem('reconnect', function(){document.location.reload()});

  return {
    addItem: addItem,
    removeItem: removeItem,
    changeSetting: changeSetting,
    getSetting: getSetting,
    setSetting: setSetting,
    isFullscreen: isFullscreen,
    requestFullscreen: requestFullscreen,
    exitFullscreen: exitFullscreen,
    toggleFullscreen: toggleFullscreen,
  };
});
