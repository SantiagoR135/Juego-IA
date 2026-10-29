/**
 * SPRITES.JS - MOTOR PROCEDURAL DE RASTERIZADO PIXEL ART 16-BIT REALISTA
 * Dibuja y cachea sprites pixel-art detallados: soldados tácticos, drones, mechas y bosses estilo Metal Slug.
 */

// Utilidad para crear lienzos pixel-art en caché
function createPixelCanvas(w, h, drawFn) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx);
  return c;
}

export class SpriteRenderer {
  constructor() {
    this.cache = new Map();
    this.initCaches();
  }

  initCaches() {
    // 1. Sprites del Soldado Jugador (Comando Cibernético)
    this.cache.set('player_torso', this.createPlayerTorso());
    this.cache.set('player_head', this.createPlayerHead());
    this.cache.set('player_jetpack', this.createPlayerJetpack());
    this.cache.set('gun_1', this.createPixelGun('pistol'));
    this.cache.set('gun_2', this.createPixelGun('plasma'));
    this.cache.set('gun_3', this.createPixelGun('shotgun'));
    this.cache.set('gun_4', this.createPixelGun('laser'));
    this.cache.set('gun_5', this.createPixelGun('rocket'));

    // 2. Sprites de Enemigos
    this.cache.set('enemy_soldier', this.createEnemySoldier());
    this.cache.set('enemy_drone', this.createEnemyDrone());
    this.cache.set('enemy_kamikaze', this.createEnemyKamikaze());
    this.cache.set('enemy_heavy', this.createEnemyHeavy());
  }

  // =========================================================================
  // PIXEL ART: JUGADOR (COMANDO CIBERNÉTICO)
  // =========================================================================

  createPlayerHead() {
    return createPixelCanvas(20, 18, (ctx) => {
      // Casco táctico militar de titanio oscuro con sombreado 16-bit
      ctx.fillStyle = '#0f1722';
      ctx.fillRect(4, 0, 12, 16);
      ctx.fillStyle = '#1c2b3d';
      ctx.fillRect(5, 1, 10, 14);

      // Cresta superior reforzada
      ctx.fillStyle = '#2d4460';
      ctx.fillRect(6, 1, 8, 3);

      // Visor táctico cian con reflejo de cristal (pixel art realista)
      ctx.fillStyle = '#00384d';
      ctx.fillRect(10, 5, 8, 6);
      ctx.fillStyle = '#00a3cc';
      ctx.fillRect(11, 6, 6, 4);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(12, 7, 4, 2);
      ctx.fillStyle = '#ffffff'; // Destello especular
      ctx.fillRect(14, 7, 1, 1);

      // Respirador / máscara táctica inferior
      ctx.fillStyle = '#0a1018';
      ctx.fillRect(8, 12, 10, 5);
      ctx.fillStyle = '#ff6600'; // Indicador de radio/comunicación
      ctx.fillRect(9, 13, 2, 2);

      // Antena táctica lateral
      ctx.fillStyle = '#405878';
      ctx.fillRect(3, 2, 2, 8);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(3, 1, 2, 2);
    });
  }

  createPlayerTorso() {
    return createPixelCanvas(26, 30, (ctx) => {
      // Chaleco balístico modular oscuro
      ctx.fillStyle = '#0a1018';
      ctx.fillRect(1, 0, 24, 28);
      ctx.fillStyle = '#141e2b';
      ctx.fillRect(3, 2, 20, 24);

      // Placas de blindaje pectoral de kevlar/cerámica
      ctx.fillStyle = '#1e3045';
      ctx.fillRect(4, 3, 8, 10);
      ctx.fillRect(14, 3, 8, 10);
      ctx.fillStyle = '#2f4968'; // Resalte de luz superior
      ctx.fillRect(5, 4, 6, 2);
      ctx.fillRect(15, 4, 6, 2);

      // Líneas de neon de telemetría militar
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(12, 3, 2, 12);

      // Bolsillos modulares y canana táctica con cartuchos
      ctx.fillStyle = '#221a12';
      ctx.fillRect(4, 15, 8, 7);
      ctx.fillRect(14, 15, 8, 7);
      ctx.fillStyle = '#d4a017'; // Puntas de balas doradas
      ctx.fillRect(5, 17, 2, 3);
      ctx.fillRect(8, 17, 2, 3);
      ctx.fillRect(15, 17, 2, 3);
      ctx.fillRect(18, 17, 2, 3);

      // Cinturón táctico con hebilla
      ctx.fillStyle = '#05080c';
      ctx.fillRect(2, 23, 22, 5);
      ctx.fillStyle = '#7a8e9e';
      ctx.fillRect(11, 24, 4, 3);
    });
  }

  createPlayerJetpack() {
    return createPixelCanvas(12, 26, (ctx) => {
      // Carcasa del propulsor
      ctx.fillStyle = '#090e14';
      ctx.fillRect(0, 0, 12, 24);
      ctx.fillStyle = '#182433';
      ctx.fillRect(2, 2, 8, 20);

      // Celda de combustible de plasma
      ctx.fillStyle = '#004455';
      ctx.fillRect(3, 4, 6, 12);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(4, 6, 4, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 8, 2, 4);

      // Tobera de escape inferior
      ctx.fillStyle = '#05080c';
      ctx.fillRect(2, 22, 8, 4);
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(4, 24, 4, 2);
    });
  }

  createPixelGun(type) {
    return createPixelCanvas(38, 16, (ctx) => {
      if (type === 'pistol') {
        // Pistola táctica semiautomática con compensador
        ctx.fillStyle = '#0a0d12';
        ctx.fillRect(0, 5, 20, 7);
        ctx.fillStyle = '#1f2a38';
        ctx.fillRect(2, 4, 16, 4);
        ctx.fillStyle = '#00f0ff'; // Mira láser
        ctx.fillRect(16, 3, 2, 2);
        ctx.fillStyle = '#3a4e66';
        ctx.fillRect(18, 5, 3, 3);
      } else if (type === 'plasma') {
        // Fusil de plasma con bobina incandescente
        ctx.fillStyle = '#080c10';
        ctx.fillRect(0, 4, 28, 9);
        ctx.fillStyle = '#1c2836';
        ctx.fillRect(2, 3, 24, 5);
        ctx.fillStyle = '#00ffaa'; // Bobina de plasma
        ctx.fillRect(8, 5, 12, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, 6, 4, 1);
        ctx.fillStyle = '#00ffaa';
        ctx.fillRect(26, 4, 4, 4);
      } else if (type === 'shotgun') {
        // Escopeta pesada táctica con cañón estriado
        ctx.fillStyle = '#080a0e';
        ctx.fillRect(0, 4, 30, 8);
        ctx.fillStyle = '#263445';
        ctx.fillRect(2, 3, 26, 4);
        ctx.fillStyle = '#5c4028'; // Guardamanos de madera/polímero
        ctx.fillRect(8, 8, 10, 4);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(28, 4, 3, 5);
      } else if (type === 'laser') {
        // Cañón de iones / Railgun de precisión
        ctx.fillStyle = '#05080c';
        ctx.fillRect(0, 3, 34, 10);
        ctx.fillStyle = '#1c2d40';
        ctx.fillRect(4, 2, 28, 5);
        ctx.fillStyle = '#33ccff'; // Carril acelerador magnético
        ctx.fillRect(8, 4, 18, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, 4, 6, 2);
        // Mira telescópica con lente azul
        ctx.fillStyle = '#003344';
        ctx.fillRect(6, 0, 10, 3);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(15, 0, 2, 3);
      } else {
        // Lanzacohetes MK-IV con ojiva visible
        ctx.fillStyle = '#100608';
        ctx.fillRect(0, 2, 32, 12);
        ctx.fillStyle = '#2a1a1f';
        ctx.fillRect(2, 3, 28, 10);
        // Rayas de advertencia industrial
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(6, 4, 3, 8);
        ctx.fillRect(12, 4, 3, 8);
        ctx.fillStyle = '#ff3300'; // Ojiva del misil asomando
        ctx.fillRect(30, 4, 4, 8);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(34, 6, 2, 4);
      }
    });
  }

  // =========================================================================
  // PIXEL ART: ENEMIGOS
  // =========================================================================

  createEnemyDrone() {
    return createPixelCanvas(36, 36, (ctx) => {
      // Chasis esférico blindado militar
      ctx.fillStyle = '#0d121a';
      ctx.beginPath();
      ctx.arc(18, 18, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1a2330';
      ctx.beginPath();
      ctx.arc(18, 18, 11, 0, Math.PI * 2);
      ctx.fill();

      // Placas y remaches
      ctx.fillStyle = '#28374a';
      ctx.fillRect(10, 8, 16, 4);

      // Ojo escáner óptico rojo amenazante (con destello)
      ctx.fillStyle = '#40000a';
      ctx.beginPath();
      ctx.arc(22, 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff1a40';
      ctx.beginPath();
      ctx.arc(22, 18, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23, 17, 2, 2);

      // Toberas propulsoras laterales
      ctx.fillStyle = '#080c10';
      ctx.fillRect(2, 14, 6, 8);
      ctx.fillRect(28, 14, 6, 8);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(1, 16, 2, 4);
      ctx.fillRect(33, 16, 2, 4);
    });
  }

  createEnemyKamikaze() {
    return createPixelCanvas(32, 24, (ctx) => {
      // Forma de punta de flecha aerodinámica
      ctx.fillStyle = '#260a0a';
      ctx.beginPath();
      ctx.moveTo(30, 12);
      ctx.lineTo(2, 2);
      ctx.lineTo(8, 12);
      ctx.lineTo(2, 22);
      ctx.closePath();
      ctx.fill();

      // Blindaje carmesí con rayas amarillas de advertencia
      ctx.fillStyle = '#ff3300';
      ctx.beginPath();
      ctx.moveTo(26, 12);
      ctx.lineTo(6, 5);
      ctx.lineTo(10, 12);
      ctx.lineTo(6, 19);
      ctx.closePath();
      ctx.fill();

      // Núcleo inestable brillante
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(14, 10, 6, 4);
    });
  }

  createEnemySoldier() {
    return createPixelCanvas(34, 60, (ctx) => {
      // Casco con máscara de gas / visor carmesí
      ctx.fillStyle = '#0d1017';
      ctx.fillRect(10, 2, 14, 14);
      ctx.fillStyle = '#171d26';
      ctx.fillRect(12, 4, 11, 11);
      ctx.fillStyle = '#ff1a40'; // Visor rojo hostil
      ctx.fillRect(18, 7, 6, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 7, 1, 1);

      // Chaleco táctico oscuro con camuflaje urbano
      ctx.fillStyle = '#11151c';
      ctx.fillRect(6, 16, 22, 24);
      ctx.fillStyle = '#1c222e';
      ctx.fillRect(8, 18, 18, 20);
      ctx.fillStyle = '#ff1a40'; // Indicador de escuadrón enemigo
      ctx.fillRect(10, 20, 2, 6);

      // Bolsillos de munición
      ctx.fillStyle = '#2b2118';
      ctx.fillRect(10, 28, 6, 6);
      ctx.fillRect(18, 28, 6, 6);

      // Piernas y rodilleras reforzadas
      ctx.fillStyle = '#0a0d12';
      ctx.fillRect(8, 40, 8, 18);
      ctx.fillRect(18, 40, 8, 18);
      ctx.fillStyle = '#263140';
      ctx.fillRect(9, 44, 6, 6);
      ctx.fillRect(19, 44, 6, 6);

      // Botas militares
      ctx.fillStyle = '#040608';
      ctx.fillRect(7, 54, 10, 6);
      ctx.fillRect(17, 54, 10, 6);
    });
  }

  createEnemyHeavy() {
    return createPixelCanvas(54, 76, (ctx) => {
      // Chasis blindado pesado (Caminante biónico)
      ctx.fillStyle = '#140c0f';
      ctx.fillRect(4, 4, 46, 66);
      ctx.fillStyle = '#2b161b';
      ctx.fillRect(6, 6, 42, 62);

      // Placas de acero de alta resistencia
      ctx.fillStyle = '#3d2027';
      ctx.fillRect(10, 10, 34, 24);
      ctx.fillStyle = '#ff6600'; // Ranura del visor pesado
      ctx.fillRect(18, 16, 20, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(24, 17, 4, 2);

      // Chimeneas de escape con humo
      ctx.fillStyle = '#0a0608';
      ctx.fillRect(2, 6, 6, 16);
      ctx.fillRect(46, 6, 6, 16);
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(3, 4, 4, 2);
      ctx.fillRect(47, 4, 4, 2);

      // Cañón giratorio rotativo pesado
      ctx.fillStyle = '#08080a';
      ctx.fillRect(38, 36, 16, 14);
      ctx.fillStyle = '#505058';
      ctx.fillRect(44, 38, 10, 10);
    });
  }

  // =========================================================================
  // DIBUJADO EN CANVAS DE COMBATE
  // =========================================================================

  drawPlayer(ctx, player) {
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (player.facing === -1) {
      ctx.scale(-1, 1);
    }

    const halfW = player.w / 2;
    const halfH = player.h / 2;

    // 1. Jetpack en la espalda
    const jetpack = this.cache.get('player_jetpack');
    if (jetpack) {
      ctx.drawImage(jetpack, -halfW - 8, -halfH + 8);
    }

    // 2. Piernas animadas en ciclo de carrera pixel-art
    const legOffset = Math.sin(player.walkAnimTimer) * 7;
    ctx.fillStyle = '#0a0f16';
    ctx.fillRect(-halfW + 4, 4, 8, halfH - 4 + (player.isGrounded ? -legOffset : 0));
    ctx.fillRect(-halfW + 14, 4, 8, halfH - 4 + (player.isGrounded ? legOffset : 0));
    ctx.fillStyle = '#1c2838'; // Rodilleras tácticas
    ctx.fillRect(-halfW + 4, 12, 8, 8);
    ctx.fillRect(-halfW + 14, 12, 8, 8);
    ctx.fillStyle = '#05070a'; // Botas reforzadas
    ctx.fillRect(-halfW + 2, halfH - 6 + (player.isGrounded ? -legOffset : 0), 10, 6);
    ctx.fillRect(-halfW + 14, halfH - 6 + (player.isGrounded ? legOffset : 0), 10, 6);

    // 3. Torso blindado
    const torso = this.cache.get('player_torso');
    if (torso) {
      ctx.drawImage(torso, -halfW, -halfH + 12);
    }

    // 4. Cabeza con casco y visor
    const head = this.cache.get('player_head');
    if (head) {
      ctx.drawImage(head, -halfW + 3, -halfH - 2);
    }

    ctx.restore();

    // 5. Brazo y Arma apuntando en 360° con sprite correspondiente
    ctx.save();
    ctx.translate(cx, cy - 2);
    ctx.rotate(player.aimAngle);

    // Si apunta hacia la izquierda respecto a la vertical, evitar que el arma quede boca abajo
    if (Math.cos(player.aimAngle) < 0) {
      ctx.scale(1, -1);
    }

    // Manga del brazo táctico
    ctx.fillStyle = '#141e2b';
    ctx.fillRect(0, -3, 12, 7);
    ctx.fillStyle = '#1e3045';
    ctx.fillRect(2, -2, 8, 5);

    // Arma activa del arsenal
    const weaponId = (window.gameEngine && window.gameEngine.weaponManager) 
      ? window.gameEngine.weaponManager.getCurrentWeapon().id 
      : 1;
    const gunSprite = this.cache.get(`gun_${weaponId}`) || this.cache.get('gun_1');
    if (gunSprite) {
      ctx.drawImage(gunSprite, 8, -8);
    }

    ctx.restore();
  }

  drawEnemy(ctx, enemy) {
    const cx = enemy.x + enemy.w / 2;
    const cy = enemy.y + enemy.h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (enemy.facing === -1) {
      ctx.scale(-1, 1);
    }

    const halfW = enemy.w / 2;
    const halfH = enemy.h / 2;

    if (enemy.type === 'drone') {
      const droneSprite = this.cache.get('enemy_drone');
      if (droneSprite) {
        ctx.drawImage(droneSprite, -halfW, -halfH, enemy.w, enemy.h);
      }
    } else if (enemy.type === 'kamikaze') {
      const kamiSprite = this.cache.get('enemy_kamikaze');
      if (kamiSprite) {
        ctx.drawImage(kamiSprite, -halfW, -halfH, enemy.w, enemy.h);
      }
    } else if (enemy.type === 'soldier') {
      const soldierSprite = this.cache.get('enemy_soldier');
      if (soldierSprite) {
        ctx.drawImage(soldierSprite, -halfW, -halfH, enemy.w, enemy.h);
      }
      // Rifle del soldado
      ctx.fillStyle = '#080b0e';
      ctx.fillRect(4, -2, 22, 6);
      ctx.fillStyle = enemy.bulletColor;
      ctx.fillRect(22, -1, 3, 2);
    } else if (enemy.type === 'heavy') {
      const heavySprite = this.cache.get('enemy_heavy');
      if (heavySprite) {
        ctx.drawImage(heavySprite, -halfW, -halfH, enemy.w, enemy.h);
      }
    } else if (enemy.type === 'apex') {
      // JEFE APEX PIXEL ART
      ctx.fillStyle = '#1b0924';
      ctx.beginPath();
      ctx.arc(0, 0, halfW, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#361247';
      ctx.beginPath();
      ctx.arc(0, 0, halfW - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bd00ff';
      ctx.beginPath();
      ctx.arc(6, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, -2, 3, 3);
    } else if (enemy.type === 'mech') {
      // JEFE MECHA PIXEL ART
      ctx.fillStyle = '#091a10';
      ctx.fillRect(-halfW, -halfH, enemy.w, enemy.h);
      ctx.fillStyle = '#143822';
      ctx.fillRect(-halfW + 4, -halfH + 4, enemy.w - 8, enemy.h - 8);
      ctx.fillStyle = '#00ff77';
      ctx.fillRect(-halfW + 8, -halfH + 12, enemy.w - 16, 8);
    } else if (enemy.type === 'boss') {
      // TITÁN APLASTADOR OMEGA PIXEL ART
      ctx.fillStyle = '#1c080b';
      ctx.fillRect(-halfW, -halfH, enemy.w, enemy.h);
      ctx.fillStyle = '#381016';
      ctx.fillRect(-halfW + 4, -halfH + 4, enemy.w - 8, enemy.h - 8);
      ctx.fillStyle = '#ff0055'; // Núcleo del reactor
      ctx.fillRect(-halfW + 12, -halfH + 16, enemy.w - 24, 16);
      ctx.fillStyle = '#ffff55';
      ctx.fillRect(-halfW + 18, -halfH + 20, enemy.w - 36, 8);
    }

    ctx.restore();
  }
}

export const spriteRenderer = new SpriteRenderer();
