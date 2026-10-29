/**
 * LEVEL.JS - ARQUITECTURA DE NIVELES TÁCTICOS EXTENDIDOS Y CAJAS DE SUMINISTRO PIXEL-ART
 * Campaña de larga duración (7,500px a 9,200px) con cajas de armamento, munición y botiquines.
 */

import { sound } from './audio.js?v=4';

export class Platform {
  constructor(x, y, w, h, type = 'solid', themeColor = '#00f0ff') {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type; // 'solid', 'oneway', 'hazard'
    this.themeColor = themeColor;
  }

  draw(ctx) {
    ctx.save();

    if (this.type === 'solid') {
      // Bloque blindado pixel art con remaches y acabado de acero
      ctx.fillStyle = '#080c14';
      ctx.fillRect(this.x, this.y, this.w, this.h);

      // Franja superior de metal estriado con color temático
      ctx.fillStyle = '#111924';
      ctx.fillRect(this.x, this.y, this.w, 8);
      ctx.strokeStyle = this.themeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Remaches y textura industrial pixelada
      ctx.fillStyle = this.themeColor;
      for (let rx = this.x + 8; rx < this.x + this.w; rx += 32) {
        ctx.fillRect(rx, this.y + 4, 3, 3);
      }

      // Rayas diagonales de advertencia en plataformas clave
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const step = 24;
      for (let offset = -this.h; offset < this.w; offset += step) {
        ctx.beginPath();
        ctx.moveTo(this.x + offset, this.y + this.h);
        ctx.lineTo(this.x + offset + this.h, this.y);
        ctx.stroke();
      }
    } else if (this.type === 'oneway') {
      // Pasarela industrial pixel-art suspendida
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.strokeStyle = this.themeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.w, this.y);
      ctx.stroke();

      // Malla perforada
      ctx.fillStyle = this.themeColor;
      for (let dotX = this.x + 6; dotX < this.x + this.w; dotX += 14) {
        ctx.fillRect(dotX, this.y + 3, 4, 3);
      }
    } else if (this.type === 'hazard') {
      // Fosa o barrera de energía láser de alto voltaje
      const pulse = (Math.sin(Date.now() / 140) + 1) / 2;
      ctx.fillStyle = `rgba(255, 26, 64, ${0.35 + pulse * 0.45})`;
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.strokeStyle = '#ff1a40';
      ctx.shadowColor = '#ff1a40';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // Rayos de plasma internos
      ctx.fillStyle = '#ffff66';
      ctx.fillRect(this.x + 2, this.y + this.h / 2 - 2, this.w - 4, 4);
    }

    ctx.restore();
  }
}

export class Pickup {
  constructor(x, y, type = 'health', value = 35, weaponId = 0) {
    this.x = x;
    this.y = y;
    this.w = 32;
    this.h = 28;
    this.type = type; // 'health', 'ammo', 'weapon'
    this.value = value;
    this.weaponId = weaponId; // 2: Plasma, 3: Escopeta, 4: Cañón Láser, 5: Lanzacohetes
    this.bobOffset = Math.random() * Math.PI * 2;
    this.collected = false;

    // Etiquetas de cajas de armas
    this.weaponNames = {
      2: 'FUSIL DE PLASMA',
      3: 'ESCOPETA DE ASALTO',
      4: 'CAÑÓN DE IONES',
      5: 'LANZACOHETES MK-IV'
    };
  }

  update(dt) {
    this.bobOffset += dt * 3;
  }

  draw(ctx) {
    if (this.collected) return;
    const drawY = this.y + Math.sin(this.bobOffset) * 4;

    ctx.save();
    ctx.translate(this.x + this.w / 2, drawY + this.h / 2);

    if (this.type === 'health') {
      // =====================================================================
      // CAJA MÉDICA MILITAR PIXEL-ART (Verde Esmeralda)
      // =====================================================================
      ctx.shadowColor = '#00ff77';
      ctx.shadowBlur = 10;

      // Caja exterior
      ctx.fillStyle = '#06170d';
      ctx.fillRect(-15, -12, 30, 24);
      ctx.strokeStyle = '#00ff77';
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -12, 30, 24);

      // Refuerzos esquineros metálicos
      ctx.fillStyle = '#00aa55';
      ctx.fillRect(-15, -12, 5, 5);
      ctx.fillRect(10, -12, 5, 5);
      ctx.fillRect(-15, 7, 5, 5);
      ctx.fillRect(10, 7, 5, 5);

      // Cruz médica blanca y verde reflectante
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -8, 6, 16);
      ctx.fillRect(-8, -3, 16, 6);
      ctx.fillStyle = '#00ff77';
      ctx.fillRect(-2, -6, 4, 12);
      ctx.fillRect(-6, -2, 12, 4);

    } else if (this.type === 'ammo') {
      // =====================================================================
      // CAJA DE MUNICIÓN PESADA PIXEL-ART (Verde Oliva / Franja Ámbar)
      // =====================================================================
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 10;

      // Caja metálica de munición con pestillo
      ctx.fillStyle = '#1c1507';
      ctx.fillRect(-16, -12, 32, 24);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      ctx.strokeRect(-16, -12, 32, 24);

      // Franja amarilla militar
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-16, -4, 32, 6);

      // Pestillo y asas
      ctx.fillStyle = '#3a2a0a';
      ctx.fillRect(-4, -10, 8, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -2, 6, 2);

      // Tipografía pixelada
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px "Share Tech Mono", monospace';
      ctx.fillText('AMMO', -12, 1);

    } else if (this.type === 'weapon') {
      // =====================================================================
      // CAJA MILITAR BLINDADA DE ARMAMENTO PIXEL-ART
      // =====================================================================
      const colors = {
        2: '#00ffaa', // Plasma
        3: '#ffaa00', // Escopeta
        4: '#33ccff', // Láser
        5: '#ff3300'  // Cohetes
      };
      const crateColor = colors[this.weaponId] || '#00f0ff';

      ctx.shadowColor = crateColor;
      ctx.shadowBlur = 16;

      // Caja blindada con cerradura electrónica
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(-18, -14, 36, 28);
      ctx.strokeStyle = crateColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-18, -14, 36, 28);

      // Refuerzos de esquinas
      ctx.fillStyle = crateColor;
      ctx.fillRect(-18, -14, 6, 6);
      ctx.fillRect(12, -14, 6, 6);
      ctx.fillRect(-18, 8, 6, 6);
      ctx.fillRect(12, 8, 6, 6);

      // Icono del arma o rayo central
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -4, 12, 8);
      ctx.fillStyle = crateColor;
      ctx.fillRect(-4, -2, 8, 4);

      // Etiqueta flotante con el nombre del arma sobre la caja
      ctx.restore();
      ctx.save();
      ctx.translate(this.x + this.w / 2, drawY - 14);
      ctx.font = 'bold 10px "Orbitron", sans-serif';
      ctx.fillStyle = crateColor;
      ctx.shadowColor = crateColor;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      const label = this.weaponNames[this.weaponId] || 'CAJA DE ARMA';
      ctx.fillText(`[${label}]`, 0, 0);
    }

    ctx.restore();
  }
}

export class TacticalMap {
  constructor(levelNumber = 1) {
    this.levelNumber = levelNumber;
    this.width = 7500;
    this.height = 720;
    this.platforms = [];
    this.pickups = [];
    this.themeColor = '#00f0ff';
    this.sectorTitle = '';

    this.buildSector(levelNumber);
  }

  buildSector(levelNumber) {
    this.platforms = [];
    this.pickups = [];

    if (levelNumber === 1) {
      // =====================================================================
      // SECTOR 1: TRINCHERAS Y PUESTO DE AVANZADA (7,500 PX)
      // =====================================================================
      this.width = 7500;
      this.themeColor = '#00f0ff';
      this.sectorTitle = 'SECTOR 1 - TRINCHERAS Y AVANZADA';

      // Suelo continuo
      this.platforms.push(new Platform(0, 580, this.width, 140, 'solid', this.themeColor));

      // TRAMO 1: Búnkeres y Trincheras iniciales (0 a 2,500px)
      this.platforms.push(new Platform(300, 470, 220, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(600, 390, 260, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(940, 460, 200, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(1220, 340, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(1600, 450, 240, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(1900, 380, 320, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(2100, 260, 220, 16, 'oneway', this.themeColor));

      // 🎁 CAJA DE ARMA 2: FUSIL DE PLASMA EN X = 2,400!
      this.pickups.push(new Pickup(2400, 340, 'weapon', 0, 2));
      this.pickups.push(new Pickup(650, 350, 'health', 40));
      this.pickups.push(new Pickup(1250, 300, 'ammo', 50));
      this.pickups.push(new Pickup(1950, 340, 'health', 40));

      // TRAMO 2: Perímetro fortificado con pasarelas multinivel (2,500 a 5,000px)
      this.platforms.push(new Platform(2600, 470, 280, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(2950, 360, 260, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(3300, 260, 300, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(3700, 380, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(4050, 480, 340, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(4450, 360, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(4800, 270, 320, 22, 'solid', this.themeColor));

      this.pickups.push(new Pickup(3000, 320, 'ammo', 60));
      this.pickups.push(new Pickup(3350, 220, 'health', 45));
      this.pickups.push(new Pickup(4100, 440, 'ammo', 80));
      this.pickups.push(new Pickup(4850, 230, 'health', 50));

      // TRAMO 3: Reducto final y arena de combate (5,000 a 7,500px)
      this.platforms.push(new Platform(5200, 440, 300, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(5600, 340, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(6000, 450, 320, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(6400, 360, 260, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(6750, 480, 380, 24, 'solid', this.themeColor));

      this.pickups.push(new Pickup(5650, 300, 'ammo', 90));
      this.pickups.push(new Pickup(6050, 410, 'health', 60));

      this.extractionZone = { x: 7300, y: 400, w: 90, h: 180 };

    } else if (levelNumber === 2) {
      // =====================================================================
      // SECTOR 2: REFINERÍA NEÓN Y PLATAFORMAS VERTICALES (8,200 PX)
      // =====================================================================
      this.width = 8200;
      this.themeColor = '#bd00ff';
      this.sectorTitle = 'SECTOR 2 - REFINERÍA NEÓN';

      // Suelo con fosas láser de plasma
      this.platforms.push(new Platform(0, 580, 1400, 140, 'solid', this.themeColor));
      this.platforms.push(new Platform(1400, 600, 180, 120, 'hazard', this.themeColor)); // Fosa 1
      this.platforms.push(new Platform(1580, 580, 2400, 140, 'solid', this.themeColor));
      this.platforms.push(new Platform(3980, 600, 220, 120, 'hazard', this.themeColor)); // Fosa 2
      this.platforms.push(new Platform(4200, 580, 2200, 140, 'solid', this.themeColor));
      this.platforms.push(new Platform(6400, 600, 240, 120, 'hazard', this.themeColor)); // Fosa 3
      this.platforms.push(new Platform(6640, 580, 1560, 140, 'solid', this.themeColor));

      // TRAMO 1: Pasarelas de vapor y tuberías (0 a 2,800px)
      this.platforms.push(new Platform(280, 460, 240, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(560, 360, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(900, 260, 320, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(1380, 380, 240, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(1700, 470, 260, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(2050, 350, 320, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(2450, 250, 260, 16, 'oneway', this.themeColor));

      // 🎁 CAJA DE ARMA 3: ESCOPETA DE ASALTO EN X = 2,750!
      this.pickups.push(new Pickup(2750, 210, 'weapon', 0, 3));
      this.pickups.push(new Pickup(600, 320, 'health', 45));
      this.pickups.push(new Pickup(950, 220, 'ammo', 70));
      this.pickups.push(new Pickup(1750, 430, 'health', 50));

      // TRAMO 2: Torres de plasma y plataformas suspendidas (2,800 a 5,600px)
      this.platforms.push(new Platform(2950, 450, 300, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(3350, 340, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(3720, 240, 340, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(4150, 360, 260, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(4500, 470, 320, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(4900, 350, 300, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(5300, 240, 320, 22, 'solid', this.themeColor));

      this.pickups.push(new Pickup(3400, 300, 'ammo', 80));
      this.pickups.push(new Pickup(3750, 200, 'health', 55));
      this.pickups.push(new Pickup(4550, 430, 'ammo', 90));
      this.pickups.push(new Pickup(5350, 200, 'health', 60));

      // TRAMO 3: Chimeneas gigantes y Arena del Centinela Apex (5,600 a 8,200px)
      this.platforms.push(new Platform(5700, 460, 300, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(6100, 350, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(6500, 440, 320, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(6950, 340, 300, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(7350, 450, 420, 26, 'solid', this.themeColor));

      this.pickups.push(new Pickup(6150, 310, 'ammo', 100));
      this.pickups.push(new Pickup(7000, 300, 'health', 70));

      this.extractionZone = { x: 8000, y: 400, w: 90, h: 180 };

    } else if (levelNumber === 3) {
      // =====================================================================
      // SECTOR 3: LABORATORIO CIBERNÉTICO SUBTERRÁNEO (8,600 PX)
      // =====================================================================
      this.width = 8600;
      this.themeColor = '#00ff77';
      this.sectorTitle = 'SECTOR 3 - LABORATORIO SUBTERRÁNEO';

      this.platforms.push(new Platform(0, 580, this.width, 140, 'solid', this.themeColor));

      // TRAMO 1: Cámaras criogénicas y pasarelas de seguridad (0 a 3,200px)
      this.platforms.push(new Platform(280, 470, 220, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(560, 380, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(900, 280, 300, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(1250, 390, 160, 20, 'hazard', this.themeColor)); // Campo de fuerza
      this.platforms.push(new Platform(1460, 460, 260, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(1800, 340, 320, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(2200, 240, 260, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(2550, 360, 280, 20, 'solid', this.themeColor));
      this.platforms.push(new Platform(2900, 220, 300, 22, 'solid', this.themeColor));

      // 🎁 CAJA DE ARMA 4: CAÑÓN DE IONES / RAILGUN EN X = 3,100!
      this.pickups.push(new Pickup(3100, 180, 'weapon', 0, 4));
      this.pickups.push(new Pickup(600, 340, 'health', 50));
      this.pickups.push(new Pickup(950, 240, 'ammo', 80));
      this.pickups.push(new Pickup(1850, 300, 'health', 55));
      this.pickups.push(new Pickup(2600, 320, 'ammo', 90));

      // TRAMO 2: Complejo de pruebas y barreras electromagnéticas (3,200 a 6,000px)
      this.platforms.push(new Platform(3350, 460, 300, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(3750, 340, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(4100, 220, 320, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(4500, 360, 180, 20, 'hazard', this.themeColor));
      this.platforms.push(new Platform(4750, 470, 300, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(5150, 350, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(5550, 240, 320, 24, 'solid', this.themeColor));

      this.pickups.push(new Pickup(3800, 300, 'health', 60));
      this.pickups.push(new Pickup(4150, 180, 'ammo', 100));
      this.pickups.push(new Pickup(4800, 430, 'health', 60));
      this.pickups.push(new Pickup(5600, 200, 'ammo', 110));

      // TRAMO 3: Laboratorio central y Arena del Mecha Bípedo MK-II (6,000 a 8,600px)
      this.platforms.push(new Platform(6000, 450, 340, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(6450, 340, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(6850, 220, 340, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(7300, 360, 300, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(7700, 470, 460, 28, 'solid', this.themeColor));

      this.pickups.push(new Pickup(6500, 300, 'health', 70));
      this.pickups.push(new Pickup(6900, 180, 'ammo', 120));

      this.extractionZone = { x: 8400, y: 400, w: 90, h: 180 };

    } else {
      // =====================================================================
      // SECTOR 4: LA CIUDADELA NEGRA: EL TRONO DEL TITÁN APLASTADOR (9,200 PX)
      // =====================================================================
      this.width = 9200;
      this.themeColor = '#ff1a40';
      this.sectorTitle = 'SECTOR 4 - CIUDADELA: TITÁN APLASTADOR';

      // Suelo con pozos masivos de radiación volcánica
      this.platforms.push(new Platform(0, 580, 2200, 140, 'solid', this.themeColor));
      this.platforms.push(new Platform(2200, 600, 260, 120, 'hazard', this.themeColor));
      this.platforms.push(new Platform(2460, 580, 2600, 140, 'solid', this.themeColor));
      this.platforms.push(new Platform(5060, 600, 300, 120, 'hazard', this.themeColor));
      this.platforms.push(new Platform(5360, 580, 3840, 140, 'solid', this.themeColor));

      // TRAMO 1: Defensas perimetrales y nidos de artillería (0 a 3,500px)
      this.platforms.push(new Platform(320, 460, 260, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(640, 350, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(980, 240, 320, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(1350, 360, 260, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(1680, 470, 300, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(2050, 340, 340, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(2500, 460, 320, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(2900, 340, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(3250, 230, 340, 24, 'solid', this.themeColor));

      // 🎁 CAJA DE ARMA 5: LANZACOHETES MK-IV EN X = 3,400!
      this.pickups.push(new Pickup(3400, 190, 'weapon', 0, 5));
      this.pickups.push(new Pickup(680, 310, 'health', 50));
      this.pickups.push(new Pickup(1020, 200, 'ammo', 100));
      this.pickups.push(new Pickup(1720, 430, 'health', 60));
      this.pickups.push(new Pickup(2550, 420, 'ammo', 120));

      // TRAMO 2: Puente del Abismo y bastiones de la guardia pretoriana (3,500 a 6,800px)
      this.platforms.push(new Platform(3650, 470, 300, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(4050, 350, 280, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(4450, 230, 340, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(4900, 360, 360, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(5400, 470, 320, 22, 'solid', this.themeColor));
      this.platforms.push(new Platform(5800, 350, 300, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(6200, 230, 340, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(6650, 360, 280, 16, 'oneway', this.themeColor));

      this.pickups.push(new Pickup(4100, 310, 'health', 70));
      this.pickups.push(new Pickup(4500, 190, 'ammo', 130));
      this.pickups.push(new Pickup(5450, 430, 'health', 75));
      this.pickups.push(new Pickup(6250, 190, 'ammo', 140));

      // TRAMO 3: TRONO DEL COLOSO Y LA GRAN ARENA DEL TITÁN OMEGA (6,800 a 9,200px)
      this.platforms.push(new Platform(7050, 470, 360, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(7500, 370, 320, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(7900, 260, 360, 24, 'solid', this.themeColor));
      this.platforms.push(new Platform(8350, 370, 320, 16, 'oneway', this.themeColor));
      this.platforms.push(new Platform(8750, 470, 420, 28, 'solid', this.themeColor));

      this.pickups.push(new Pickup(7100, 430, 'health', 80));
      this.pickups.push(new Pickup(7550, 330, 'ammo', 160));
      this.pickups.push(new Pickup(7950, 220, 'health', 90));

      this.extractionZone = { x: 9000, y: 400, w: 90, h: 180 };
    }

    // Paredes de contención
    this.platforms.push(new Platform(-40, 0, 40, this.height, 'solid', this.themeColor));
    this.platforms.push(new Platform(this.width, 0, 40, this.height, 'solid', this.themeColor));
  }

  update(dt, player, weaponManager, particleSystem) {
    // 1. Recolección de cajas de suministros
    for (const pickup of this.pickups) {
      if (pickup.collected) continue;
      pickup.update(dt);

      if (
        player.x < pickup.x + pickup.w &&
        player.x + player.w > pickup.x &&
        player.y < pickup.y + pickup.h &&
        player.y + player.h > pickup.y
      ) {
        pickup.collected = true;

        if (pickup.type === 'health') {
          sound.playPickup();
          player.heal(pickup.value);
          if (particleSystem) {
            particleSystem.createFleshHit(pickup.x + pickup.w / 2, pickup.y + pickup.h / 2, '#00ff77', 8);
            particleSystem.addFloatingText(pickup.x, pickup.y - 20, `+${pickup.value} HP`, '#00ff77');
          }
        } else if (pickup.type === 'ammo') {
          sound.playPickup();
          weaponManager.addAmmo(2, 64);
          weaponManager.addAmmo(3, 24);
          weaponManager.addAmmo(4, 10);
          weaponManager.addAmmo(5, 4);
          if (particleSystem) {
            particleSystem.createHitSparks(pickup.x + pickup.w / 2, pickup.y + pickup.h / 2, -Math.PI / 2, '#ffaa00', 8);
            particleSystem.addFloatingText(pickup.x, pickup.y - 20, `+MUNICIÓN PESADA`, '#ffaa00');
          }
        } else if (pickup.type === 'weapon') {
          // Desbloquear arma táctica
          const unlocked = weaponManager.unlockWeapon(pickup.weaponId);
          sound.playExtraLife();
          if (particleSystem && unlocked) {
            particleSystem.createExplosion(pickup.x + pickup.w / 2, pickup.y + pickup.h / 2, 60, '#00f0ff');
            particleSystem.addFloatingText(pickup.x - 30, pickup.y - 40, `¡${unlocked.name} ADQUIRIDA!`, '#00f0ff');
          }
        }
      }
    }

    // 2. Colisión del jugador con zonas de peligro (Hazard / Láseres)
    for (const plat of this.platforms) {
      if (plat.type === 'hazard') {
        if (
          player.x < plat.x + plat.w &&
          player.x + player.w > plat.x &&
          player.y < plat.y + plat.h &&
          player.y + player.h > plat.y
        ) {
          player.takeDamage(28 * dt, particleSystem);
          if (particleSystem && Math.random() < 0.3) {
            particleSystem.createHitSparks(player.x + player.w / 2, player.y + player.h / 2, Math.PI / 2, '#ff1a40', 4);
          }
        }
      }
    }
  }

  draw(ctx) {
    // Dibujar plataformas y trampas
    for (const plat of this.platforms) {
      plat.draw(ctx);
    }

    // Dibujar cajas de suministros
    for (const p of this.pickups) {
      p.draw(ctx);
    }

    // Dibujar Zona de Evacuación
    this.drawExtractionZone(ctx);
  }

  drawExtractionZone(ctx) {
    const ez = this.extractionZone;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(ez.x, ez.y, ez.w, ez.h);

    ctx.strokeStyle = this.themeColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(ez.x, ez.y, ez.w, ez.h);

    const pulse = (Math.sin(Date.now() / 180) + 1) / 2;
    ctx.fillStyle = `rgba(0, 240, 255, ${0.4 + pulse * 0.5})`;
    ctx.shadowColor = this.themeColor;
    ctx.shadowBlur = 15;
    ctx.fillRect(ez.x + 10, ez.y + 10, ez.w - 20, 24);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px "Orbitron", sans-serif';
    ctx.fillText('EVAC', ez.x + 20, ez.y + 27);

    ctx.restore();
  }
}
