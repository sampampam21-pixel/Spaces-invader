/**
 * three-background.js
 * Renders a retro synthwave scene (scrolling neon grid + star field +
 * glowing sun) using Three.js behind the Phaser canvas.
 */
class ThreeBackground {
  constructor(canvasId, width, height) {
    this.width  = width;
    this.height = height;
    this.time   = 0;

    /* ── Renderer ─────────────────────────────────────── */
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById(canvasId),
      antialias: false,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000311, 1);

    /* ── Scene & camera ───────────────────────────────── */
    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
    // Positioned slightly above the grid, looking toward the horizon
    this.camera.position.set(0, 2.4, 6);
    this.camera.lookAt(0, 0, -12);

    this._createStars();
    this._createGrid();
    this._createSun();
    this._createNebula();
  }

  /* ── Stars ────────────────────────────────────────────── */
  _createStars() {
    const COUNT = 500;
    const pos    = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 180;
      pos[i * 3 + 1] = (Math.random() - 0.3) * 80 + 4;
      pos[i * 3 + 2] = -Math.random() * 120 - 6;

      // Palette: white / electric-blue / cyan
      const r = Math.random();
      if (r < 0.5) {
        colors[i*3]=1; colors[i*3+1]=1; colors[i*3+2]=1;       // white
      } else if (r < 0.78) {
        colors[i*3]=0.1; colors[i*3+1]=0.4; colors[i*3+2]=1;  // blue
      } else {
        colors[i*3]=0; colors[i*3+1]=1; colors[i*3+2]=1;       // cyan
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos,    3));
    geom.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    this.stars = new THREE.Points(geom, new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    }));
    this.scene.add(this.stars);
  }

  /* ── Neon perspective grid ────────────────────────────── */
  _createGrid() {
    const COLS   = 20;
    const ROWS   = 40;
    const CELL_W = 2;
    const CELL_D = 2;
    const W      = COLS * CELL_W;
    const D      = ROWS * CELL_D;

    this.CELL_D = CELL_D;

    const dimMat = new THREE.LineBasicMaterial({
      color: 0x001177, transparent: true, opacity: 0.65,
    });
    const brightMat = new THREE.LineBasicMaterial({
      color: 0x0033bb, transparent: true, opacity: 0.90,
    });

    this.gridGroup = new THREE.Group();

    // Horizontal lines (along X)
    for (let r = 0; r <= ROWS; r++) {
      const z   = -r * CELL_D;
      const mat = (r % 5 === 0) ? brightMat : dimMat;
      const pts = [
        new THREE.Vector3(-W / 2, 0, z),
        new THREE.Vector3( W / 2, 0, z),
      ];
      this.gridGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts), mat,
      ));
    }

    // Vertical lines (along Z)
    for (let c = 0; c <= COLS; c++) {
      const x   = -W / 2 + c * CELL_W;
      const mat = (c % 5 === 0) ? brightMat : dimMat;
      const pts = [
        new THREE.Vector3(x, 0,  0),
        new THREE.Vector3(x, 0, -D),
      ];
      this.gridGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts), mat,
      ));
    }

    // Tilt and position the grid so it looks like a receding floor
    this.gridGroup.rotation.x = -Math.PI / 5.2;
    this.gridGroup.position.set(0, -1.8, 4);
    this.scene.add(this.gridGroup);
  }

  /* ── Synthwave sun ────────────────────────────────────── */
  _createSun() {
    const SUN_Z = -28;
    const SUN_Y =  0.6;

    // Layered glowing discs
    const layers = [
      { r: 3.2, col: 0xff0080, opacity: 0.12 },
      { r: 2.8, col: 0xff3300, opacity: 0.16 },
      { r: 2.4, col: 0xff8800, opacity: 0.20 },
    ];
    layers.forEach(({ r, col, opacity }) => {
      const mesh = new THREE.Mesh(
        new THREE.CircleGeometry(r, 64),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity, side: THREE.DoubleSide }),
      );
      mesh.position.set(0, SUN_Y, SUN_Z);
      this.scene.add(mesh);
    });

    // Hard rim
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(2.35, 2.55, 64),
      new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide }),
    );
    rim.position.set(0, SUN_Y, SUN_Z);
    this.scene.add(rim);

    // Horizontal stripe lines through the disc
    for (let i = -7; i <= 7; i++) {
      const y  = SUN_Y + i * 0.32;
      const dy = y - SUN_Y;
      const hw = Math.sqrt(Math.max(0, 2.35 * 2.35 - dy * dy)) * 0.92;
      if (hw < 0.05) continue;
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-hw, y, SUN_Z + 0.05),
          new THREE.Vector3( hw, y, SUN_Z + 0.05),
        ]),
        new THREE.LineBasicMaterial({ color: 0xff00aa }),
      );
      this.scene.add(line);
    }

    // Glowing horizon line
    this.scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-40, SUN_Y, SUN_Z + 1),
        new THREE.Vector3( 40, SUN_Y, SUN_Z + 1),
      ]),
      new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.55 }),
    ));
  }

  /* ── Faint nebula blobs ───────────────────────────────── */
  _createNebula() {
    const blobs = [
      { x: -12, y: 6, z: -35, col: 0x220044, r: 6 },
      { x:  14, y: 8, z: -40, col: 0x001133, r: 7 },
      { x:   2, y: 4, z: -30, col: 0x110033, r: 5 },
    ];
    blobs.forEach(({ x, y, z, col, r }) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 12, 12),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, side: THREE.BackSide }),
      );
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
    });
  }

  /* ── Called every animation frame ────────────────────── */
  update(delta) {
    this.time += delta;

    // Scroll the grid toward the viewer (wrap by one cell depth)
    const scroll = (this.time * 0.55) % this.CELL_D;
    this.gridGroup.position.z = 4 + scroll;

    // Star twinkle
    this.stars.material.opacity = 0.65 + 0.25 * Math.sin(this.time * 0.8);

    this.renderer.render(this.scene, this.camera);
  }
}
