import * as THREE from 'three';

const createDataTexture = (colors16x16) => {
  const data = new Uint8Array(16 * 16 * 4);
  for (let i = 0; i < 256; i++) {
    const hex = colors16x16[i];
    data[i * 4] = (hex >> 16) & 255;
    data[i * 4 + 1] = (hex >> 8) & 255;
    data[i * 4 + 2] = hex & 255;
    data[i * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, 16, 16, THREE.RGBAFormat);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
};

// Deepslate Base Colors
const DS1 = 0x1d2125;
const DS2 = 0x161a1d;
const DS3 = 0x22262b;
const DS4 = 0x111315;

export const Textures = {
  get DeepslateTiles() {
    const cols = [];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (x % 8 === 0 || y % 8 === 0) cols.push(DS4);
        else cols.push(Math.random() > 0.5 ? DS1 : Math.random() > 0.5 ? DS2 : DS3);
      }
    }
    return createDataTexture(cols);
  },

  get DeepslateBricks() {
    const cols = [];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isHorizontalGrout = y % 4 === 0;
        const isVerticalGrout = (x + (y >= 4 && y < 8 || y >= 12 ? 4 : 0)) % 8 === 0;
        if (isHorizontalGrout || isVerticalGrout) cols.push(DS4);
        else cols.push(Math.random() > 0.5 ? DS1 : DS2);
      }
    }
    return createDataTexture(cols);
  },

  get Sculk() {
    const map = [];
    const emissive = [];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isEmissive = Math.random() > 0.94;
        map.push(isEmissive ? 0x00fcf0 : (Math.random() > 0.5 ? 0x051012 : 0x081b1f));
        emissive.push(isEmissive ? 0xffffff : 0x000000);
      }
    }
    return { map: createDataTexture(map), emissiveMap: createDataTexture(emissive) };
  },

  get SoulLantern() {
    const map = [];
    const emissive = [];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isFrame = x < 2 || x > 13 || y < 2 || y > 13 || x === 8 || y === 8;
        if (isFrame) {
          map.push(0x111111);
          emissive.push(0x000000);
        } else {
          map.push(0x00ffff);
          emissive.push(0xffffff); // Full bloom on the inner part
        }
      }
    }
    return { map: createDataTexture(map), emissiveMap: createDataTexture(emissive) };
  },

  get WardenBody() {
    const cols = [];
    const baseCols = [0x061014, 0x07171b, 0x092126, 0x0b2b30];
    for (let i = 0; i < 256; i++) {
      cols.push(baseCols[Math.floor(Math.random() * baseCols.length)]);
    }
    return createDataTexture(cols);
  },

  get WardenBone() {
    const cols = [];
    const baseCols = [0x9b9585, 0x77786f, 0x56666a, 0x344b50];
    for (let i = 0; i < 256; i++) {
      cols.push(baseCols[Math.floor(Math.random() * baseCols.length)]);
    }
    return createDataTexture(cols);
  },

  get WardenArmUpper() {
    const cols = [];
    const baseCols = [0x9b9585, 0x77786f, 0x56666a];
    for (let i = 0; i < 256; i++) {
      cols.push(baseCols[Math.floor(Math.random() * baseCols.length)]);
    }
    return createDataTexture(cols);
  },

  get WardenArmMid() {
    const cols = [];
    const baseCols = [0x56666a, 0x344b50, 0x08262b];
    for (let i = 0; i < 256; i++) {
      cols.push(baseCols[Math.floor(Math.random() * baseCols.length)]);
    }
    return createDataTexture(cols);
  },

  get WardenSculk() {
    const cols = [];
    const emissive = [];
    const baseCols = [0x02090b, 0x041216, 0x061b20];
    for (let i = 0; i < 256; i++) {
      const isCyan = Math.random() > 0.9;
      cols.push(isCyan ? 0x00A89A : baseCols[Math.floor(Math.random() * baseCols.length)]);
      emissive.push(isCyan ? 0x00A89A : 0x000000);
    }
    return { map: createDataTexture(cols), emissiveMap: createDataTexture(emissive) };
  }
};
