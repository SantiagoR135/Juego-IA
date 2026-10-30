/**
 * LEVEL.JS - ARQUITECTURA DE NIVELES TÁCTICOS EXTENDIDOS Y CAJAS DE SUMINISTRO PIXEL-ART
 * Campaña de larga duración (7,500px a 9,200px) con cajas de armamento, munición y botiquines.
 */

import { sound } from './audio.js?v=4';

export class Platform {
  constructor(x, y, w, h, type = 'solid', themeColor = '#00f0ff', sector = null) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type; // 'solid', 'oneway', 'hazard'
    this.themeColor = themeColor;

    // Determinación precisa del sector militar (1: Trincheras, 2: Refinería, 3: Laboratorio, 4: Ciudadela)
    if (sector && sector >= 1 && sector <= 4) {
      this.sector = sector;
    } else if (themeColor === '#bd00ff') {
      this.sector = 2;
    } else if (themeColor === '#00ff77') {
      this.sector = 3;
    } else if (themeColor === '#ff1a40' || themeColor === '#ff3300') {
      this.sector = 4;
    } else {
      this.sector = 1;
    }

    // Suelo principal vs plataforma táctica suspendida
    this.isGround = y >= 550 && w > 800;
    // Semilla pseudoaleatoria determinista para distribuir remaches, sacos de arena y detalles
    this.seed = Math.abs(Math.sin(x * 12.9898 + y * 78.233)) * 43758.5453;
  }

  draw(ctx) {
    const time = Date.now();

    ctx.save();
    if (this.type === 'hazard') {
      this.drawHazard(ctx, time);
    } else if (this.type === 'oneway') {
      this.drawOneway(ctx, time);
    } else {
      // solid
      if (this.isGround) {
        this.drawGround(ctx, time);
      } else {
        this.drawElevatedSolid(ctx, time);
      }
    }
    ctx.restore();
  }

  // =========================================================================
  // 1. SUELO CONTINUO (GROUND) CON CAPAS TEMÁTICAS SEGÚN CADA SECTOR
  // =========================================================================
  drawGround(ctx, time) {
    const { x, y, w, h } = this;

    if (this.sector === 1) {
      // ---------------------------------------------------------------------
      // SECTOR 1: SUELO DE TRINCHERA MILITAR Y CAMPO DE BATALLA
      // ---------------------------------------------------------------------
      // Capa geológica base profunda
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, '#10161f');
      grad.addColorStop(0.3, '#0b0f15');
      grad.addColorStop(1, '#05070a');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Borde de trinchera superior: tablones de madera reforzada y barro compactado
      ctx.fillStyle = '#1c242e';
      ctx.fillRect(x, y, w, 14);
      ctx.fillStyle = '#2d3b4b';
      ctx.fillRect(x, y, w, 3); // Reborde superior metálico

      // Conducto de combustible militar blindado que corre horizontalmente
      ctx.fillStyle = '#0a1017';
      ctx.fillRect(x, y + 26, w, 10);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + 26);
      ctx.lineTo(x + w, y + 26);
      ctx.stroke();

      // Abrazaderas del conducto y remaches militares
      ctx.fillStyle = '#00f0ff';
      for (let cx = x + 20; cx < x + w; cx += 64) {
        ctx.fillRect(cx, y + 24, 6, 14);
      }

      // Sacos de arena tácticos distribuidos sobre la trinchera
      ctx.fillStyle = '#6e6244';
      ctx.strokeStyle = '#443c27';
      ctx.lineWidth = 1.5;
      for (let sx = x + 30; sx < x + w; sx += 96) {
        // Pila de 3 sacos de arena
        this.drawSandbag(ctx, sx, y - 6, 24, 8);
        this.drawSandbag(ctx, sx + 22, y - 6, 24, 8);
        this.drawSandbag(ctx, sx + 11, y - 13, 22, 8);
      }

      // Postes y estacas de trinchera
      ctx.fillStyle = '#221911';
      for (let px = x + 60; px < x + w; px += 160) {
        ctx.fillRect(px, y - 14, 6, 28);
      }

    } else if (this.sector === 2) {
      // ---------------------------------------------------------------------
      // SECTOR 2: SUELO DE REFINERÍA NEÓN CON TUBERÍAS DE PLASMA EXPUESTAS
      // ---------------------------------------------------------------------
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, '#110e1c');
      grad.addColorStop(0.4, '#0a0812');
      grad.addColorStop(1, '#040307');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Franja de peligro industrial (Hazard Chevron) amarillo y negro
      this.drawHazardStripes(ctx, x, y, w, 10);

      // Planchas de acero corrugado
      ctx.strokeStyle = 'rgba(189, 0, 255, 0.2)';
      ctx.lineWidth = 2;
      for (let px = x + 40; px < x + w; px += 120) {
        ctx.strokeRect(px, y + 14, 110, h - 20);
        // Remaches hexagonales
        ctx.fillStyle = '#bd00ff';
        ctx.fillRect(px + 4, y + 18, 3, 3);
        ctx.fillRect(px + 102, y + 18, 3, 3);
      }

      // Tubería de plasma subterránea iluminada visible
      const pipeY = y + 36;
      ctx.fillStyle = '#080510';
      ctx.fillRect(x, pipeY, w, 14);

      // Fluido de plasma magenta pulsante
      const pulse = (Math.sin(time / 200) + 1) / 2;
      ctx.fillStyle = `rgba(189, 0, 255, ${0.6 + pulse * 0.35})`;
      ctx.shadowColor = '#bd00ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, pipeY + 3, w, 8);
      ctx.shadowBlur = 0;

      // Anillos de refuerzo de la tubería
      ctx.fillStyle = '#ffd200';
      for (let rx = x + 30; rx < x + w; rx += 70) {
        ctx.fillRect(rx, pipeY - 2, 8, 18);
      }

      // Rejillas de drenaje de vapor
      ctx.fillStyle = '#000000';
      for (let gx = x + 80; gx < x + w; gx += 160) {
        for (let s = 0; s < 5; s++) {
          ctx.fillRect(gx + s * 6, y + 14, 3, 16);
        }
      }

    } else if (this.sector === 3) {
      // ---------------------------------------------------------------------
      // SECTOR 3: SUELO DE LABORATORIO CIBERNÉTICO SUPERCONDUCTOR
      // ---------------------------------------------------------------------
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, '#101d28');
      grad.addColorStop(0.3, '#09121a');
      grad.addColorStop(1, '#03070b');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Borde de aleación pulida con línea de superconductor esmeralda
      ctx.fillStyle = '#1e3345';
      ctx.fillRect(x, y, w, 12);
      ctx.fillStyle = '#00ff77';
      ctx.shadowColor = '#00ff77';
      ctx.shadowBlur = 8;
      ctx.fillRect(x, y, w, 3);
      ctx.shadowBlur = 0;

      // Baldosas de laboratorio de alta tecnología
      ctx.strokeStyle = 'rgba(0, 255, 119, 0.15)';
      ctx.lineWidth = 1;
      for (let tx = x; tx < x + w; tx += 80) {
        ctx.strokeRect(tx, y + 12, 80, 40);
        ctx.strokeRect(tx + 40, y + 52, 80, 40);
      }

      // Pistas de circuito impreso (PCB Data Bus) con pulsos de datos móviles
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 2;
      const busY = y + 32;
      ctx.beginPath();
      ctx.moveTo(x, busY);
      ctx.lineTo(x + w, busY);
      ctx.stroke();

      // Paquetes de datos viajando a lo largo del bus
      const dataOffset = (time * 0.12) % 180;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00ffaa';
      ctx.shadowBlur = 10;
      for (let dx = x + dataOffset; dx < x + w; dx += 180) {
        ctx.fillRect(dx, busY - 3, 14, 8);
        ctx.fillStyle = '#00ff77';
        ctx.fillRect(dx + 3, busY - 1, 8, 4);
      }
      ctx.shadowBlur = 0;

    } else {
      // ---------------------------------------------------------------------
      // SECTOR 4: CIUDADELA NEGRA Y LECHO VOLCÁNICO DEL TITÁN
      // ---------------------------------------------------------------------
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, '#180709');
      grad.addColorStop(0.3, '#0d0305');
      grad.addColorStop(1, '#050102');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Borde de basalto volcánico con roca agrietada
      ctx.fillStyle = '#260a0f';
      ctx.fillRect(x, y, w, 14);
      ctx.fillStyle = '#ff1a40';
      ctx.shadowColor = '#ff1a40';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, w, 2);
      ctx.shadowBlur = 0;

      // Fisuras profundas de magma líquido pulsante
      const magmaPulse = (Math.sin(time / 160) + 1) / 2;
      ctx.strokeStyle = '#ff3300';
      ctx.shadowColor = '#ff5500';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;

      for (let fx = x + 40; fx < x + w; fx += 140) {
        ctx.beginPath();
        ctx.moveTo(fx, y + 14);
        ctx.lineTo(fx + 25, y + 35);
        ctx.lineTo(fx + 55, y + 42);
        ctx.lineTo(fx + 90, y + 65);
        ctx.stroke();

        // Núcleo amarillo hirviente de la fisura
        ctx.fillStyle = `rgba(255, 230, 80, ${0.7 + magmaPulse * 0.3})`;
        ctx.fillRect(fx + 22, y + 33, 8, 5);
        ctx.fillRect(fx + 52, y + 40, 8, 5);
      }
      ctx.shadowBlur = 0;

      // Contrafuertes de aleación negra angular de la fortaleza
      ctx.fillStyle = '#140507';
      ctx.strokeStyle = '#4a0e16';
      ctx.lineWidth = 2;
      for (let bx = x + 100; bx < x + w; bx += 200) {
        ctx.beginPath();
        ctx.moveTo(bx, y + 14);
        ctx.lineTo(bx + 40, y + 60);
        ctx.lineTo(bx - 40, y + 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // =========================================================================
  // 2. PLATAFORMAS SÓLIDAS ELEVADAS CON SOPORTES ESTRUCTURALES Y DETALLES
  // =========================================================================
  drawElevatedSolid(ctx, time) {
    const { x, y, w, h } = this;

    // -----------------------------------------------------------------------
    // A. SOPORTES INFERIORES: Evita que floten como rectángulos mágicos
    // -----------------------------------------------------------------------
    if (this.sector === 1) {
      // Vigas de acero en I militares con tirantes diagonales
      ctx.strokeStyle = '#1a2432';
      ctx.lineWidth = 4;
      const strutStep = Math.min(w - 30, 140);
      for (let sx = x + 25; sx <= x + w - 25; sx += strutStep) {
        ctx.beginPath();
        ctx.moveTo(sx, y + h);
        ctx.lineTo(sx - 18, y + h + 42);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx, y + h);
        ctx.lineTo(sx + 18, y + h + 42);
        ctx.stroke();

        // Remaches de soporte
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(sx - 3, y + h + 3, 6, 6);
      }
    } else if (this.sector === 2) {
      // Pistones hidráulicos de aleación con cilindros cromados
      const pistonStep = Math.min(w - 30, 160);
      for (let px = x + 30; px <= x + w - 30; px += pistonStep) {
        // Cilindro exterior
        ctx.fillStyle = '#161222';
        ctx.fillRect(px - 7, y + h, 14, 34);
        ctx.strokeStyle = '#bd00ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - 7, y + h, 14, 34);

        // Vástago cromado
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(px - 3, y + h + 34, 6, 20);

        // Abrazadera neón
        ctx.fillStyle = '#bd00ff';
        ctx.fillRect(px - 9, y + h + 10, 18, 4);
      }
    } else if (this.sector === 3) {
      // Repulsores de levitación antigravitatoria iónicos (con haz emisor)
      const emitterStep = Math.min(w - 40, 140);
      const repPulse = (Math.sin(time / 150) + 1) / 2;
      for (let ex = x + 35; ex <= x + w - 35; ex += emitterStep) {
        // Cono emisor metálico
        ctx.fillStyle = '#1e3345';
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ex - 12, y + h);
        ctx.lineTo(ex + 12, y + h);
        ctx.lineTo(ex + 6, y + h + 10);
        ctx.lineTo(ex - 6, y + h + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Haz de plasma iónico de sustentación proyectado hacia abajo
        ctx.fillStyle = `rgba(0, 255, 170, ${0.15 + repPulse * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(ex - 6, y + h + 10);
        ctx.lineTo(ex + 6, y + h + 10);
        ctx.lineTo(ex + 18, y + h + 45);
        ctx.lineTo(ex - 18, y + h + 45);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Sector 4: Contrafuertes angulares de acero negro y púas basálticas
      ctx.fillStyle = '#140507';
      ctx.strokeStyle = '#ff1a40';
      ctx.lineWidth = 1.5;
      const clawStep = Math.min(w - 30, 140);
      for (let cx = x + 25; cx <= x + w - 25; cx += clawStep) {
        ctx.beginPath();
        ctx.moveTo(cx - 10, y + h);
        ctx.lineTo(cx + 10, y + h);
        ctx.lineTo(cx, y + h + 36);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vena de calor ardiente en la púa
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(cx - 2, y + h + 8, 4, 16);
      }
    }

    // -----------------------------------------------------------------------
    // B. CUERPO DE LA PLATAFORMA Y DETALLES TEMÁTICOS SUPERFICIALES
    // -----------------------------------------------------------------------
    if (this.sector === 1) {
      // ---------------------------------------------------------------------
      // SECTOR 1: BÚNKER BLINDADO Y PARAPETO CON SACOS DE ARENA
      // ---------------------------------------------------------------------
      // Bloque de hormigón militar reforzado
      ctx.fillStyle = '#121822';
      ctx.fillRect(x, y, w, h);

      // Franja superior de acero con bisel
      ctx.fillStyle = '#1b2636';
      ctx.fillRect(x, y, w, 6);
      ctx.strokeStyle = this.themeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Remaches dobles militares
      ctx.fillStyle = this.themeColor;
      for (let rx = x + 10; rx < x + w; rx += 28) {
        ctx.fillRect(rx, y + 3, 3, 3);
        ctx.fillRect(rx, y + h - 5, 3, 3);
      }

      // Parapetos de sacos de arena en los extremos de la plataforma (cobertura)
      if (w >= 140) {
        this.drawSandbag(ctx, x + 4, y - 6, 22, 7);
        this.drawSandbag(ctx, x + 22, y - 6, 22, 7);
        this.drawSandbag(ctx, x + w - 46, y - 6, 22, 7);
        this.drawSandbag(ctx, x + w - 26, y - 6, 22, 7);
      }

      // Alambre de púas táctico en la base inferior
      ctx.strokeStyle = '#607282';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + h - 2);
      ctx.lineTo(x + w - 10, y + h - 2);
      ctx.stroke();
      for (let bx = x + 24; bx < x + w - 10; bx += 32) {
        ctx.beginPath();
        ctx.moveTo(bx - 3, y + h - 6);
        ctx.lineTo(bx + 3, y + h + 2);
        ctx.moveTo(bx - 3, y + h + 2);
        ctx.lineTo(bx + 3, y + h - 6);
        ctx.stroke();
      }

      // Estarcido militar en plataformas anchas
      if (w >= 220) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        ctx.fillText('[BUNKER-MIL]', x + w / 2 - 32, y + h / 2 + 3);
      }

    } else if (this.sector === 2) {
      // ---------------------------------------------------------------------
      // SECTOR 2: MÓDULO INDUSTRIAL CON TUBERÍA DE PLASMA LUMINOSA
      // ---------------------------------------------------------------------
      ctx.fillStyle = '#0f0c18';
      ctx.fillRect(x, y, w, h);

      // Franja de advertencia industrial amarilla/negra (Hazard Chevron)
      this.drawHazardStripes(ctx, x, y, w, 6);

      ctx.strokeStyle = this.themeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Tubería cilíndrica de vidrio con plasma magenta fluyendo en el centro
      const tubeY = y + Math.floor(h / 2) - 3;
      const tubeH = 6;
      ctx.fillStyle = '#06040a';
      ctx.fillRect(x + 8, tubeY - 1, w - 16, tubeH + 2);

      const plasmaPulse = (Math.sin(time / 180 + x * 0.01) + 1) / 2;
      ctx.fillStyle = `rgba(189, 0, 255, ${0.7 + plasmaPulse * 0.3})`;
      ctx.shadowColor = '#bd00ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(x + 10, tubeY, w - 20, tubeH);
      ctx.shadowBlur = 0;

      // Abrazaderas metálicas doradas de la tubería
      ctx.fillStyle = '#ffd200';
      for (let bx = x + 24; bx < x + w - 20; bx += 48) {
        ctx.fillRect(bx, tubeY - 3, 6, tubeH + 6);
      }

      // Manómetro de presión analógico en plataformas grandes
      if (w >= 240) {
        const mx = x + w - 30;
        const my = y + h / 2;
        ctx.fillStyle = '#1c152a';
        ctx.beginPath();
        ctx.arc(mx, my, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd200';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Aguja indicadora roja
        const angle = (time * 0.003) % (Math.PI * 1.5);
        ctx.strokeStyle = '#ff1a40';
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.cos(angle) * 5, my + Math.sin(angle) * 5);
        ctx.stroke();
      }

    } else if (this.sector === 3) {
      // ---------------------------------------------------------------------
      // SECTOR 3: PLATAFORMA DE ALEACIÓN ESPACIAL Y NÚCLEO IÓNICO
      // ---------------------------------------------------------------------
      ctx.fillStyle = '#101c29';
      ctx.fillRect(x, y, w, h);

      // Franja de superconductor esmeralda superior
      ctx.fillStyle = '#00ff77';
      ctx.shadowColor = '#00ff77';
      ctx.shadowBlur = 8;
      ctx.fillRect(x, y, w, 4);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Pistas de bus de datos iluminadas
      ctx.strokeStyle = 'rgba(0, 255, 170, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + h / 2);
      ctx.lineTo(x + w - 10, y + h / 2);
      ctx.stroke();

      // Nodos de interconexión con LED parpadeantes
      ctx.fillStyle = '#00ff77';
      for (let nx = x + 20; nx < x + w - 10; nx += 36) {
        ctx.fillRect(nx, y + h / 2 - 2, 4, 4);
      }

      // Núcleo de cristal de contención de iones en el centro
      const coreX = x + w / 2;
      const coreY = y + h / 2;
      const corePulse = (Math.sin(time / 140) + 1) / 2;

      ctx.fillStyle = '#06131c';
      ctx.fillRect(coreX - 16, y + 5, 32, h - 10);
      ctx.strokeStyle = '#00ff77';
      ctx.strokeRect(coreX - 16, y + 5, 32, h - 10);

      ctx.fillStyle = `rgba(0, 255, 170, ${0.6 + corePulse * 0.4})`;
      ctx.shadowColor = '#00ff77';
      ctx.shadowBlur = 12;
      ctx.fillRect(coreX - 12, y + 7, 24, h - 14);
      ctx.shadowBlur = 0;

    } else {
      // ---------------------------------------------------------------------
      // SECTOR 4: BASTIÓN DE OBSIDIANA NEGRA Y GRIETAS DE MAGMA ARDIENTE
      // ---------------------------------------------------------------------
      ctx.fillStyle = '#120508';
      ctx.fillRect(x, y, w, h);

      // Borde de acero fundido carmesí
      ctx.fillStyle = '#ff1a40';
      ctx.shadowColor = '#ff1a40';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, w, 4);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#5a121c';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Fisuras incandescentes de magma talladas en la plataforma
      const crackPulse = (Math.sin(time / 160 + x) + 1) / 2;
      ctx.strokeStyle = `rgba(255, 68, 0, ${0.7 + crackPulse * 0.3})`;
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(x + 16, y + 6);
      ctx.lineTo(x + 40, y + h - 5);
      ctx.lineTo(x + 75, y + 8);
      ctx.lineTo(x + 110, y + h - 6);
      ctx.stroke();

      if (w >= 200) {
        ctx.beginPath();
        ctx.moveTo(x + w - 120, y + 8);
        ctx.lineTo(x + w - 85, y + h - 6);
        ctx.lineTo(x + w - 50, y + 7);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Disipadores térmicos al rojo vivo
      ctx.fillStyle = '#ff6600';
      for (let dx = x + 18; dx < x + w - 15; dx += 24) {
        ctx.fillRect(dx, y + h - 4, 10, 3);
      }
    }
  }

  // =========================================================================
  // 3. PASARELAS ATRAVESABLES (ONEWAY PLATFORMS) ESTILIZADAS POR SECTOR
  // =========================================================================
  drawOneway(ctx, time) {
    const { x, y, w, h } = this;

    if (this.sector === 1) {
      // SECTOR 1: Pasarela de rejilla militar de acero con tensores
      ctx.fillStyle = 'rgba(16, 24, 34, 0.85)';
      ctx.fillRect(x, y, w, h);

      // Borde superior estriado
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();

      // Malla romboidal de metal desplegado
      ctx.fillStyle = '#00f0ff';
      for (let dotX = x + 8; dotX < x + w; dotX += 16) {
        ctx.fillRect(dotX, y + 3, 5, 3);
        ctx.fillRect(dotX + 8, y + 8, 5, 3);
      }

      // Postes y tensores de anclaje en extremos
      ctx.fillStyle = '#223244';
      ctx.fillRect(x, y - 6, 6, h + 10);
      ctx.fillRect(x + w - 6, y - 6, 6, h + 10);

    } else if (this.sector === 2) {
      // SECTOR 2: Pasarela de refinería con halo neón púrpura y balizas
      const pulse = (Math.sin(time / 200) + 1) / 2;
      ctx.fillStyle = 'rgba(20, 14, 30, 0.88)';
      ctx.fillRect(x, y, w, h);

      // Halo inferior neón
      ctx.strokeStyle = `rgba(189, 0, 255, ${0.6 + pulse * 0.4})`;
      ctx.shadowColor = '#bd00ff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 1);
      ctx.lineTo(x + w, y + 1);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Rejilla de alta resistencia
      ctx.fillStyle = '#bd00ff';
      for (let rx = x + 6; rx < x + w; rx += 14) {
        ctx.fillRect(rx, y + 4, 6, 2);
        ctx.fillRect(rx + 3, y + 8, 6, 2);
      }

      // Balizas de señalización en los extremos
      ctx.fillStyle = pulse > 0.5 ? '#ffd200' : '#bd00ff';
      ctx.fillRect(x + 2, y - 5, 5, 5);
      ctx.fillRect(x + w - 7, y - 5, 5, 5);

    } else if (this.sector === 3) {
      // SECTOR 3: Pasarela holográfica de cristal de sílice blindado
      const pulse = (Math.sin(time / 160) + 1) / 2;
      ctx.fillStyle = `rgba(0, 255, 119, ${0.12 + pulse * 0.08})`;
      ctx.fillRect(x, y, w, h);

      // Rayo láser de contención superficial
      ctx.strokeStyle = '#00ffaa';
      ctx.shadowColor = '#00ffaa';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Cuadrícula holográfica
      ctx.strokeStyle = 'rgba(0, 255, 170, 0.25)';
      ctx.lineWidth = 1;
      for (let hx = x + 12; hx < x + w; hx += 20) {
        ctx.beginPath();
        ctx.moveTo(hx, y);
        ctx.lineTo(hx + 8, y + h);
        ctx.stroke();
      }

      // Proyectores ópticos en extremos
      ctx.fillStyle = '#00ff77';
      ctx.fillRect(x, y - 4, 4, 8);
      ctx.fillRect(x + w - 4, y - 4, 4, 8);

    } else {
      // SECTOR 4: Pasarela forjada de la Ciudadela con bordes al rojo vivo
      ctx.fillStyle = 'rgba(24, 7, 10, 0.9)';
      ctx.fillRect(x, y, w, h);

      // Borde al rojo vivo
      ctx.strokeStyle = '#ff3300';
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Rejilla de hierro forjado negro
      ctx.fillStyle = '#ff5500';
      for (let fx = x + 8; fx < x + w; fx += 18) {
        ctx.fillRect(fx, y + 4, 8, 3);
      }

      // Cadenas de suspensión en extremos
      ctx.fillStyle = '#3a0f15';
      ctx.fillRect(x + 2, y - 10, 5, 12);
      ctx.fillRect(x + w - 7, y - 10, 5, 12);
    }
  }

  // =========================================================================
  // 4. ZONAS DE PELIGRO (HAZARDS) ANIMADAS POR SECTOR
  // =========================================================================
  drawHazard(ctx, time) {
    const { x, y, w, h } = this;
    const pulse = (Math.sin(time / 130) + 1) / 2;

    if (this.sector === 2) {
      // Fosa de ácido químico / plasma tóxico violeta hirviendo
      ctx.fillStyle = `rgba(189, 0, 255, ${0.45 + pulse * 0.4})`;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = '#bd00ff';
      ctx.shadowColor = '#bd00ff';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Olas químicas superficiales
      ctx.fillStyle = '#ff00aa';
      for (let ox = x + 6; ox < x + w; ox += 20) {
        const waveY = y + Math.sin(time * 0.008 + ox * 0.1) * 4;
        ctx.beginPath();
        ctx.arc(ox, waveY + 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

    } else if (this.sector === 3) {
      // Barrera de rayos láser de contención electromagnética
      ctx.fillStyle = `rgba(0, 255, 119, ${0.25 + pulse * 0.35})`;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = '#00ff77';
      ctx.shadowColor = '#00ff77';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Haces de energía de alta frecuencia oscilantes
      const laserY = y + h / 2 + Math.sin(time * 0.02) * 4;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 2, laserY - 2, w - 4, 4);
      ctx.shadowBlur = 0;

    } else {
      // Sector 4 y 1: Caldera de magma / fosa de lava ardiente
      ctx.fillStyle = `rgba(255, 34, 0, ${0.5 + pulse * 0.45})`;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = '#ff3300';
      ctx.shadowColor = '#ff3300';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Superficie dorada incandescente
      ctx.fillStyle = '#ffff44';
      ctx.fillRect(x + 2, y + 2, w - 4, 4);

      // Burbujas de lava hirviendo
      ctx.fillStyle = '#ffaa00';
      for (let bx = x + 10; bx < x + w - 10; bx += 32) {
        const bob = Math.sin(time * 0.006 + bx) * 4;
        ctx.beginPath();
        ctx.arc(bx, y + 8 + bob, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  }

  // =========================================================================
  // UTILIDADES GRÁFICAS AUXILIARES
  // =========================================================================
  drawSandbag(ctx, bx, by, bw, bh) {
    ctx.save();
    ctx.fillStyle = '#7a6b4a';
    ctx.strokeStyle = '#4e442d';
    ctx.lineWidth = 1.2;

    // Saco de arena con esquinas redondeadas
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 3);
    ctx.fill();
    ctx.stroke();

    // Costura central de la lona
    ctx.strokeStyle = '#38301d';
    ctx.beginPath();
    ctx.moveTo(bx + 4, by + bh / 2);
    ctx.lineTo(bx + bw - 4, by + bh / 2);
    ctx.stroke();
    ctx.restore();
  }

  drawHazardStripes(ctx, sx, sy, sw, sh) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();

    ctx.fillStyle = '#ffd200'; // Amarillo advertencia
    ctx.fillRect(sx, sy, sw, sh);

    ctx.fillStyle = '#11141a'; // Negro azabache
    const stripeWidth = 12;
    for (let st = sx - sh; st < sx + sw + sh; st += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(st, sy);
      ctx.lineTo(st + stripeWidth, sy);
      ctx.lineTo(st + stripeWidth - sh, sy + sh);
      ctx.lineTo(st - sh, sy + sh);
      ctx.closePath();
      ctx.fill();
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
