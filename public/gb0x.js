var GB0X = (function(opts){
  opts = opts || {};
  var TO_RAD = Math.PI/180, TO_DEG = 180/Math.PI;
  var canvas = opts.canvas || document.getElementsByTagName('canvas')[0];
  var ctx = canvas ? canvas.getContext('2d') : undefined;
  var assets = {};

  function assetsLoaded(){
    for(var k in assets){
      if(assets.hasOwnProperty(k) && assets[k].loaded == false){
        return false;
      }
    }
    return true;
  }

  function adaptCanvas(parent){
    canvas.height = (parent||window).innerHeight;
    canvas.width = (parent||window).innerWidth;
  }

  function autoAdaptCanvas(cb, parent){
    cb = cb || function(){};
    (parent||window).addEventListener('resize', function(){adaptCanvas(parent); cb();});
    adaptCanvas(parent); cb();
  }

  function loadImage(url, cb){
    var image = new Image();
    // assets[url] = {asset: image, loaded: false};
    // var canvas = document.createElement('canvas');
    // image.onload = function(){
    //   canvas.width = image.width;
    //   canvas.height = image.height;
    //   canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
    //   if(cb)cb(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data);
    //   assets[url].loaded = true;
    // };
    image.src = url;
    return image;
    // return canvas;
  }

  function drawImage(image, x,y, angle, w,h){
    if(!image.complete) return false;
    angle = angle || 0;
    w = w || image.width;
    h = h || image.height;
    if(angle != 0){
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * TO_RAD);
      ctx.drawImage(image, -(w/2), -(h/2), w, h);
      ctx.restore();
    }else{
      ctx.drawImage(image, x-(w/2), y-(h/2), w, h);
    }
  }

  function ajax(o){
    var xhr = new XMLHttpRequest(), o=o||{};
    o.method=o.method||'GET', o.url=o.url||'', o.headers=o.headers||{}, o.async=o.async||true, o.success=o.success||function(){}, o.error=o.error||function(){};
    o.headers['Content-Type'] = o.headers['Content-Type'] || 'application/x-www-form-urlencoded';
    xhr.open(o.method, o.url, o.async);
    for(var key in o.headers){if(o.headers.hasOwnProperty(key)){xhr.setRequestHeader(key, o.headers[key])}}
    xhr.onreadystatechange = function(){if(this.readyState===4){if(this.status>=200 && this.status<400){o.success(this.responseText, this.status)}else{o.error(this.status)}}};
    xhr.send(o.data); xhr = null;
  }

  function loadSound(url){
    var sound;
    if(typeof buzz === 'undefined'){
      console.warn('Using fallback audio. Please consider using https://github.com/jaysalvat/buzz');
      sound = new Audio(url);
      assets[url] = {asset: image, loaded: false};
      sound.onload = function(){
        assets[url].loaded = true;
      };
      sound.preload = true;
    } else {
      sound = new buzz.sound(url, {preload: true, webAudioApi: true});
    }
    return sound;
  }

  function vibrate(pattern){ //int millis or array of millis
    window.navigator.vibrate(pattern);
  }

  function createAnimation(frames, duration){
    var _frames = [], i = 0;
    for(i=0; i<frames.length; i++) _frames.push([frames[i], duration / frames.length]);
    return createSequence(_frames);
  }

  function createSequence(frames){ // TODO: make frame function take argument duration
     return (function(frames){
      var lastTime=0, t, i=-1;
      return {
        frame: function(){
          t = Date.now();
          if(i==-1 || t - lastTime >= frames[i][1]){
            lastTime = t;
            i = (i+1) % frames.length;
          }
          return frames[i][0];
        }
      }
    })(frames);
  }

  function drawAnimation(animation, x, y, rotation){
    drawImage(animation.frame(), x, y, rotation);
  }

  function inBox(x,y, x1,y1,x2,y2){
    return x1 <= x && x <= x2 && y1 <= y && y <= y2;
  }

  function createMask(img){
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canvas;
  }

  function deltaWindow(windowSize){
    var deltas = [], windowSize;
    for(var i=-windowSize; i<=windowSize; i++){
      for(var j=-windowSize; j<=windowSize; j++){
        if(i==0 && j==0) continue;
        deltas.push([i,j]);
      }
    }
    return deltas;
  }

  function maskCollision(obj, maskCanvas){
    var ctx = maskCanvas.getContext('2d');
        xf = maskCanvas.width / canvas.width, yf = maskCanvas.height / canvas.height,
        x = obj.x*xf, y = obj.y*yf,
        p = ctx.getImageData(x, y, 1, 1);
    if(p){p = p.data}else{return false;}
    //console.log(pixel);
    //console.log(maskCanvas.width, canvas.width, xf, x);
    if(p[0]!=255 || p[1]!=255 || p[2]!=255){
      //trace back to at least one white pixel in the opposite direction of player velocity vector
      var magnitude = Math.ceil(vectorMagnitude(obj.vx, obj.vy));
      var vnx = obj.vx / magnitude;
      var vny = obj.vy / magnitude;
      for(var i=0; i<magnitude; i++){
        //console.log(magnitude, x,y, vnx,vny, xf,yf);
        x -= vnx*xf
        y -= vny*yf
        p = ctx.getImageData(x, y, 1, 1).data;
        if(p[0]==255 && p[1]==255 && p[2]==255){console.log('break');break};
      }
      console.log('done',x,y);
      var deltas = deltaWindow(3), v = [0,0], count = 0;
      for(var i=0; i<deltas.length; i++){
        p = ctx.getImageData(x+deltas[i][0], y+deltas[i][1], 1, 1).data;
        if(p[0]!=255 || p[1]!=255 || p[2]!=255){
          v[0] += deltas[i][0] == 0 ? 0 : deltas[i][0] / Math.abs(deltas[i][0]);
          v[1] += deltas[i][1] == 0 ? 0 : deltas[i][1] / Math.abs(deltas[i][1]);
          // v[0] += deltas[i][0];
          // v[1] += deltas[i][1];
          // v[0] += deltas[i][0] / Math.abs(deltas[i][0]);
          // v[1] += deltas[i][1] / Math.abs(deltas[i][1]);
          count++;
        }
      }

      // var vWall = [-v[1], v[0]],
      //     vOut = [];

      // if(obj.vy<0 && vWall[1]>0 || obj.vy>0 && vWall[1]<0 ||
      //    obj.vx>0 && vWall[0]<0 || obj.vx<0 && vWall[0]>0){ vWall[0] *= -1; vWall[1] *= -1; }


      // vOut[0] = 2 * vWall[0] - obj.vx;
      // vOut[1] = 2 * vWall[1] - obj.vy;

      // vOut = normalizeVector(vOut[0], vOut[1]);

      var vOut = velocityReflection(v, [obj.vx, obj.vy]);

      // vOut[0] = vOrth[0] - 1 - obj.vx;
      // vOut[1] = vOrth[1] - obj.vy;
      // console.log(
      //   (dxdy2angle(obj.vx, obj.vy) * TO_DEG),
      //   (dxdy2angle(vOrth[0], vOrth[1]) * TO_DEG),
      //   (dxdy2angle(vOut[0], vOut[1]) * TO_DEG)
      // );

      console.log("voutx: "+vOut[0]+" vouty: "+vOut[1]+" pos x: "+x/xf+" pos y: "+y/yf);
      return [vOut, [x/xf,y/yf]]; // new velocity, new position
    }else{
      return false;
    }
  }

  /*
    http://www.matheprofi.at/Spiegeln%20eines%20Punktes%20an%20einer%20Geraden%20im%20R2.pdf
    g = s * [x,y]
    h = [p0, p1] + t * [-y,x]
    s = (p0*x + p1*y) / (y*y + x*x)
    PS = S - P
    P' = S + PS
  */
  function velocityReflection(line, velocity){
    var p = [-velocity[0], -velocity[1]];
    var s = (p[0]*line[0] + p[1]*line[1]) / (line[1]*line[1] + line[0]*line[0]);
    var S = [s*line[0], s*line[1]];
    var PS = [S[0]-p[0], S[1]-p[1]];
    return [S[0]+PS[0], S[1]+PS[1]];
  }

  function rectangleCollision(a, b){ /* objects need x, y, width, height */
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.height + a.y > b.y;
  }

  function circleCollision(a,b){ /* objects need x,y,radius */
    var dx = b.x - a.x, dy = b.y - a.y, r = a.radius + b.radius;
    return (dx * dx) + (dy * dy) < r * r;
  }

  function collisions(arr, callback){
    var colliding = [], i, j, callback = callback || circleCollision;
    for(i=0; i<arr.length; i++){
      for(j=i+1; j<arr.length; j++){
        if(callback(arr[i], arr[j])){
          colliding.push([i, j]);
        }
      }
    }
    return colliding;
  }

  function collisionResolver(obj1, obj2){
    var vecN, absN, vecUN, vecUT, v1n, v2n, v1t, v2t, v1nC, v2nC,
        vecV1n, vecV2n, vecV1t, vecV2t, vecV1f, vecV2f, d, r1, r2, dx, dy;
    // 1. Find unit normal and unit tangent vectors
    vecN    = [obj2.x - obj1.x, obj2.y - obj1.y];
    absN    = Math.sqrt(vecN[0] * vecN[0] + vecN[1] * vecN[1]);
    vecUN   = [vecN[0]/absN, vecN[1]/absN];
    //console.log(absN, vecUN);
    vecUT   = [-vecUN[1], vecUN[0]];
    // 2. scalar velocity in normal direction
    v1n     = vecUN[0] * obj1.vx + vecUN[1] * obj1.vy;
    v2n     = vecUN[0] * obj2.vx + vecUN[1] * obj2.vy;
    // 3. scalar velocity in tangent direction
    v1t     = vecUT[0] * obj1.vx + vecUT[1] * obj1.vy;
    v2t     = vecUT[0] * obj2.vx + vecUT[1] * obj2.vy;
    // 4. tangential velocity after collision = tangential velocity before collision (v1t, v2t) new velocities after collision
    v1nC    = (v1n * (obj1.weight - obj2.weight) + 2 * obj2.weight * v2n) / (obj1.weight + obj2.weight);
    v2nC    = (v2n * (obj2.weight - obj1.weight) + 2 * obj1.weight * v1n) / (obj1.weight + obj2.weight);
    vecV1n  = [v1nC * vecUN[0], v1nC * vecUN[1]];
    vecV2n  = [v2nC * vecUN[0], v2nC * vecUN[1]];
    vecV1t  = [v1t * vecUT[0], v1t * vecUT[1]];
    vecV2t  = [v2t * vecUT[0], v2t * vecUT[1]];
    vecV1f  = [vecV1n[0] + vecV1t[0], vecV1n[1] + vecV1t[1]];
    vecV2f  = [vecV2n[0] + vecV2t[0], vecV2n[1] + vecV2t[1]];

    d = Math.ceil((obj1.radius + obj2.radius - absN) / 2); //TODO: depend on weight?
    r1 = obj1.restitution || 1;
    r2 = obj2.restitution || 1;

    dx = obj1.x > obj2.x ? d : -d;
    dy = obj1.y > obj2.y ? d : -d;

    if(obj1.vx != 0) obj1.x += dx;
    if(obj1.vy != 0) obj1.y += dy;
    if(obj2.vx != 0) obj2.x -= dx;
    if(obj2.vy != 0) obj2.y -= dy;

    if(isNaN(vecV1f[0])) vecV1f[0] = Math.random() * 0.5 - 0.25;
    if(isNaN(vecV1f[1])) vecV1f[1] = Math.random() * 0.5 - 0.25;
    if(isNaN(vecV2f[0])) vecV2f[0] = Math.random() * 0.5 - 0.25;
    if(isNaN(vecV2f[1])) vecV2f[1] = Math.random() * 0.5 - 0.25;

    return {
      p1: [obj1.x, obj1.y],
      p2: [obj2.x, obj2.y],
      v1: [vecV1f[0]*r1, vecV1f[1]*r1],
      v2: [vecV2f[0]*r2, vecV2f[1]*r2]
    };
  }

  function distance(obj1, obj2){
    var xd = obj1.x - obj2.x, yd = obj1.y - obj2.y;
    return Math.sqrt(xd*xd + yd*yd);
  }

  function vectorMagnitude(x,y){
    return Math.sqrt(x*x + y*y);
  }

  function normalizeVector(x, y){
    var magnitude = vectorMagnitude(x,y);
    return [x/magnitude, y/magnitude];
  }

  function angle2dxdy(angleRad){
    return [Math.cos(angleRad), Math.sin(angleRad)];
  }

  /*     270°
     180°    0°
          90°
  */
  function dxdy2angle(dx,dy){
    return -Math.atan2(dy, -dx) + Math.PI;
  }


  function createRunner(draw, fps){
    return (function(draw, fps){
      var running = false, fpsCounter = 0, fpsCount = 0, lastTime = 0, t;
      function cycle(){
        draw();
        t = Date.now();
        if(t - lastTime >= 1000){
          fpsCount = fpsCounter;
          fpsCounter = 0;
          lastTime = t;
        } else {
          fpsCounter++;
        }
        setTimeout(function(){
          if(running) requestAnimationFrame(cycle);
        }, 1000 / fps);
      }
      return {
        run:    function(){running=true; cycle(); return this},
        stop:   function(){running=false; return this},
        toggle: function(){if(running=!running) cycle(); return this},
        step:   function(){running=false; cycle(); return this},
        fps:    function(f){return f !== undefined ? fps=f : fps},
      }
    })(draw, fps||60);
  }

  var benchmarks = {};
  function benchmark(f){
    return function(){
      var time, result,
          name = (''+f).split(/\W/,2)[1];
      time = performance.now();
      result = f.apply(this, arguments);
      time = performance.now() - time;
      if(!benchmarks[name]){
        benchmarks[name] = {
          min: time,
          max: time,
          avg: time,
          cnt: 1
        }
      }else{
        if(benchmarks[name].min > time) benchmarks[name].min = time;
        if(benchmarks[name].max < time) benchmarks[name].max = time;
        benchmarks[name].avg = (benchmarks[name].avg + time) * 0.5;
        benchmarks[name].cnt++;
      }
      return result;
    }
  }
  function showBenchmarks(){
    var arr = [];
    for(var k in benchmarks){ benchmarks[k].name = k; arr.push(benchmarks[k]) }
    arr.sort(function(a,b){ return b.avg - a.avg});
    for(var i=0; i<arr.length; i++){ console.log(arr[i].name, arr[i].avg) }
  }

  return {
    TO_RAD: TO_RAD,
    TO_DEG: TO_DEG,
    assetsLoaded: assetsLoaded,
    benchmarks: benchmarks,
    showBenchmarks: showBenchmarks,
    adaptCanvas: adaptCanvas,
    autoAdaptCanvas: autoAdaptCanvas,
    loadImage: loadImage,
    drawImage: benchmark(drawImage),
    ajax: ajax,
    loadSound: loadSound,
    vibrate: vibrate,
    createAnimation: createAnimation,
    drawAnimation: benchmark(drawAnimation),
    inBox: benchmark(inBox),
    createMask: createMask,
    maskCollision: benchmark(maskCollision),
    rectangleCollision: rectangleCollision,
    circleCollision: benchmark(circleCollision),
    collisions: benchmark(collisions),
    collisionResolver: benchmark(collisionResolver),
    distance: distance,
    vectorMagnitude: vectorMagnitude,
    normalizeVector: normalizeVector,
    angle2dxdy: angle2dxdy,
    createRunner: createRunner,
  }
});
