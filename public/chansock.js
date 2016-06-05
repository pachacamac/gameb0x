function createChannelSocket(url){
  var ws = new WebSocket(url || 'ws://' + window.location.host + window.location.pathname.split('/').slice(0,-1).join('/'));
  ws._defaultChannel = 'message';
  ws._serverChannel = 'server';
  ws._channels = {};
  ws._batchTime = 100;
  ws._send = ws.send;
  ws.batchTime = function(t){
    if(t!==undefined){
      ws._batchTime = t;
      clearTimeout(ws._batchHandler);
      ws._batchHandler = setInterval(function(){
        if(ws._currentBatch.length != 0){
          // console.log(Date.now(), ws._currentBatch.length);
          ws._send( JSON.stringify(ws._currentBatch) );
          ws._currentBatch.length = 0;
        }
      }, ws._batchTime);
    }
    return ws._batchTime;
  };
  ws._buildPacket = function(d,c){ return {data: d, channel: (c||ws._defaultChannel)} };
  ws._handlePacket = function(d){
    d.channel = d.channel || ws._defaultChannel;
    if(ws._channels[d.channel]){ ws._channels[d.channel](d.data, d.from, d.channel, d.uid) }
  };
  ws.send = function(d,c){ return ws._send(JSON.stringify( ws._buildPacket(d,c) ))};
  ws.sendMultiple = function(m){
    var _m = [], i;
    for(i=0;i<m.length;i++){
      if(!m[i] instanceof Array){ m[i] = [m[i], ws._defaultChannel] }
      _m.push(ws._buildPacket(m[i][0],m[i][1]))
    }
    return ws._send( JSON.stringify(_m) )
  };
  ws._currentBatch = [];
  ws.sendBatched = function(d,c){
    if(ws._batchHandler === undefined) ws.batchTime(ws._batchTime);
    ws._currentBatch.push(ws._buildPacket(d,c));
  };
  ws._onmessage = ws.onmessage;
  ws.onmessage = function(m){
    var d = JSON.parse(m.data);
    if(d instanceof Array){ for(var i=0;i<d.length;i++){ ws._handlePacket(d[i]) } }
    else ws._handlePacket(d);
  };
  ws.subscribe   = function(c){ return ws.send({subscribe: c}, ws._serverChannel) };
  ws.unsubscribe = function(c){ return ws.send({unsubscribe: c}, ws._serverChannel) };
  ws.on  = function(c,f){ ws._channels[c] = f; ws.subscribe(c) };
  ws.off = function(c){ delete ws._channels[c]; ws.unsubscribe(c) };
  return ws;
}
