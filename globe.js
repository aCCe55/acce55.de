const TILT  = 23.5 * Math.PI / 180;
const PITCH = 20  * Math.PI / 180;  // slight forward tilt, north pole visible but upright
const ROLL  = -20 * Math.PI / 180;  // gentle left lean

const CONTINENTS = [
  // North America
  [[70,-140],[72,-130],[70,-95],[72,-80],[68,-75],[63,-64],[50,-55],[47,-53],[44,-66],[42,-70],[35,-75],[30,-80],[25,-80],[20,-87],[15,-83],[8,-77],[8,-77],[15,-85],[20,-105],[22,-106],[25,-110],[30,-117],[34,-120],[40,-124],[48,-124],[55,-130],[60,-140],[70,-140]],
  // Greenland
  [[60,-44],[65,-52],[70,-52],[76,-65],[83,-30],[80,-18],[75,-18],[70,-25],[65,-37],[60,-44]],
  // South America
  [[10,-75],[8,-77],[5,-77],[0,-78],[-5,-80],[-5,-81],[-4,-80],[-3,-78],[0,-75],[0,-70],[-5,-65],[-10,-68],[-15,-75],[-18,-70],[-22,-65],[-25,-65],[-28,-62],[-33,-60],[-38,-58],[-42,-63],[-45,-65],[-50,-68],[-53,-70],[-55,-67],[-52,-57],[-45,-56],[-40,-52],[-28,-48],[-22,-42],[-15,-38],[-10,-37],[-5,-35],[0,-48],[5,-52],[8,-60],[10,-62],[11,-70],[10,-75]],
  // Europe
  [[36,-5],[36,5],[40,3],[43,-9],[44,-8],[43,-5],[44,0],[46,2],[48,-2],[48,3],[51,2],[51,4],[54,8],[55,8],[57,10],[58,5],[60,5],[62,6],[63,10],[65,14],[68,14],[70,22],[72,26],[70,30],[65,26],[60,28],[58,26],[55,24],[54,18],[54,14],[54,10],[57,10],[55,8],[54,8],[51,12],[50,14],[49,18],[46,20],[44,28],[41,28],[38,26],[37,22],[37,15],[38,13],[38,8],[36,0],[36,-5]],
  // Scandinavia
  [[56,10],[58,8],[60,5],[62,6],[64,14],[68,18],[70,22],[72,26],[70,28],[68,26],[65,22],[63,18],[62,22],[60,25],[58,22],[56,16],[56,10]],
  // Africa
  [[37,-5],[37,10],[32,12],[30,32],[22,37],[12,43],[5,42],[0,42],[-5,40],[-10,38],[-15,36],[-18,36],[-22,35],[-28,32],[-34,26],[-35,20],[-30,17],[-25,15],[-18,12],[-15,12],[-10,13],[-5,10],[0,8],[5,3],[5,-3],[3,-8],[5,-15],[10,-17],[15,-17],[18,-16],[20,-17],[22,-17],[25,-15],[30,-10],[32,-5],[37,-5]],
  // Asia main
  [[70,30],[72,40],[70,60],[68,58],[65,58],[62,62],[60,55],[55,58],[52,58],[50,58],[45,58],[42,52],[40,52],[38,48],[35,48],[30,48],[25,57],[20,58],[12,44],[10,44],[10,78],[8,77],[10,80],[15,80],[20,86],[22,88],[20,90],[22,91],[18,92],[10,90],[8,77],[5,100],[2,104],[0,104],[-5,105],[2,108],[10,104],[15,108],[18,106],[20,110],[20,117],[22,114],[24,118],[28,121],[30,122],[34,120],[38,118],[40,120],[42,130],[45,135],[48,136],[50,140],[55,135],[56,138],[55,133],[52,140],[50,140],[48,142],[46,138],[44,136],[45,133],[48,138],[50,142],[55,140],[60,150],[65,145],[68,140],[70,140],[72,130],[72,100],[70,80],[72,70],[70,60],[72,50],[70,30]],
  // Japan
  [[30,130],[32,130],[34,132],[35,136],[36,138],[38,140],[40,140],[42,142],[40,140],[38,141],[35,137],[33,131],[30,130]],
  // Australia
  [[-16,136],[-14,130],[-14,126],[-16,122],[-20,114],[-22,114],[-26,114],[-30,115],[-32,116],[-34,118],[-34,122],[-34,126],[-32,128],[-34,136],[-38,140],[-38,146],[-36,148],[-34,151],[-30,153],[-28,153],[-24,152],[-22,150],[-20,148],[-16,144],[-14,142],[-12,136],[-12,132],[-14,130],[-16,136]],
  // New Zealand (south island)
  [[-44,168],[-46,168],[-46,170],[-44,172],[-42,172],[-44,168]],
  // UK
  [[50,-5],[52,-4],[54,-3],[56,0],[58,-5],[57,-7],[55,-6],[54,-3],[52,-4],[50,-5]],
  // Iceland
  [[64,-22],[65,-24],[66,-18],[65,-13],[64,-14],[63,-18],[64,-22]],
];


let angle = 0;

function initGlobe(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Match canvas resolution to CSS size
  const rect = canvas.getBoundingClientRect();
  canvas.width  = Math.round(rect.width)  || 320;
  canvas.height = Math.round(rect.height) || 320;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.44;

  function rotate(lat, lon, yaw) {
    const phi = lat * Math.PI / 180;
    const lam = lon * Math.PI / 180 + yaw;
    let x = Math.cos(phi) * Math.sin(lam);
    let y = Math.sin(phi);
    let z = Math.cos(phi) * Math.cos(lam);
    const y1 = y * Math.cos(TILT) - z * Math.sin(TILT);
    const z1 = y * Math.sin(TILT) + z * Math.cos(TILT);
    // Pitch forward
    const y2 = y1 * Math.cos(PITCH) - z1 * Math.sin(PITCH);
    const z2 = y1 * Math.sin(PITCH) + z1 * Math.cos(PITCH);
    // Roll left
    const x2 = x  * Math.cos(ROLL) - y2 * Math.sin(ROLL);
    const y3 = x  * Math.sin(ROLL) + y2 * Math.cos(ROLL);
    return { x: cx + R * x2, y: cy - R * y3, visible: z2 > -0.05 };
  }

  function draw(yaw) {
    ctx.clearRect(0, 0, W, H);

    // Lat/lon grid
    ctx.strokeStyle = 'rgba(140,170,255,0.2)';
    ctx.lineWidth = 0.6;
    for (let lat = -80; lat <= 80; lat += 20) {
      ctx.beginPath(); let first = true;
      for (let lon = -180; lon <= 180; lon += 2) {
        const p = rotate(lat, lon, yaw);
        if (!p.visible) { first = true; continue; }
        first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        first = false;
      }
      ctx.stroke();
    }
    for (let lon = 0; lon < 360; lon += 20) {
      ctx.beginPath(); let first = true;
      for (let lat = -80; lat <= 80; lat += 2) {
        const p = rotate(lat, lon, yaw);
        if (!p.visible) { first = true; continue; }
        first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        first = false;
      }
      ctx.stroke();
    }

    // Continents
    ctx.strokeStyle = 'rgba(180,210,255,0.6)';
    ctx.lineWidth = 1.1;
    for (const continent of CONTINENTS) {
      ctx.beginPath(); let first = true; let prevV = false;
      for (const [lat, lon] of continent) {
        const p = rotate(lat, lon, yaw);
        if (!p.visible) { first = true; prevV = false; continue; }
        (first || !prevV) ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        first = false; prevV = true;
      }
      ctx.stroke();
    }
  }

  return draw;
}

// Init after layout is ready
window.addEventListener('load', () => {
  const draw = initGlobe('globe-bg');
  if (!draw) return;
  function animate() {
    angle += 0.002;
    draw(angle);
    requestAnimationFrame(animate);
  }
  animate();
});
