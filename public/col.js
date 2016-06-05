function resolveElastic(a,b){
  // Find the mid points of the entity and player
  // var pMidX = player.getMidX();
  // var pMidY = player.getMidY();
  // var aMidX = entity.getMidX();
  // var aMidY = entity.getMidY();
  // To find the side of entry calculate based on the normalized sides
  // var dx = (aMidX - pMidX) / entity.halfWidth;
  // var dy = (aMidY - pMidY) / entity.halfHeight;
  var aw2   = a.width / 2, ah2 = a.height / 2,
      bw2   = b.width / 2, bh2 = b.height / 2,
      amx   = a.x + aw2, amy = a.y + ah2,
      bmx   = b.x + bw2, bmy = b.y + bh2,
      dx    = (bmx - amx) / 0.5 * (aw2 + bw2),
      dy    = (bmy - amy) / 0.5 * (ah2 + bh2),
      absDx = Math.abs(dx),
      absDy = Math.abs(dy);

  // If the distance between the normalized x and y position is less than a small threshold the object is approaching from a corner
  if(Math.abs(absDx - absDy) < 0.1){
    a.x = dx < 0 ? b.x + b.width : b.x - a.width;
    a.y = dy < 0 ? b.y + b.height : b.y - a.height;

  }


  if (abs(absDX - absDY) < .1) {

      // Randomly select a x/y direction to reflect velocity on
      if (Math.random() < .5) {

          // Reflect the velocity at a reduced rate
          player.vx = -player.vx * entity.restitution;

          // If the object's velocity is nearing 0, set it to 0
          // STICKY_THRESHOLD is set to .0004
          if (abs(player.vx) < STICKY_THRESHOLD) {
              player.vx = 0;
          }
      } else {

          player.vy = -player.vy * entity.restitution;
          if (abs(player.vy) < STICKY_THRESHOLD) {
              player.vy = 0;
          }
      }

  // If the object is approaching from the sides
  } else if (absDX > absDY) {

      // If the player is approaching from positive X
      if (dx < 0) {
          player.x = entity.getRight();

      } else {
      // If the player is approaching from negative X
          player.x = entity.getLeft() - player.width;
      }

      // Velocity component
      player.vx = -player.vx * entity.restitution;

      if (abs(player.vx) < STICKY_THRESHOLD) {
          player.vx = 0;
      }

  // If this collision is coming from the top or bottom more
  } else {

      // If the player is approaching from positive Y
      if (dy < 0) {
          player.y = entity.getBottom();

      } else {
      // If the player is approaching from negative Y
          player.y = entity.getTop() - player.height;
      }

      // Velocity component
      player.vy = -player.vy * entity.restitution;
      if (abs(player.vy) < STICKY_THRESHOLD) {
          player.vy = 0;
      }
  }
};
