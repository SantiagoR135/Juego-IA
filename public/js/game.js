/**
 * GAME.JS - MOTOR PRINCIPAL Y BUCLE DE JUEGO (GAME LOOP)
 * Administra el ciclo de vida, estados del juego, inputs, físicas, colisiones de combate y persistencia API.
 */

import { sound } from './audio.js?v=5';
import { Player } from './player.js?v=5';
import { WeaponManager } from './weapons.js?v=5';
import { TacticalMap } from './level.js?v=5';
import { EnemyManager } from './enemy.js?v=5';
import { ParticleSystem } from './particles.js?v=5';

export const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY'
};

export class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Dimensiones lógicas fijas
    this.width = 1280;
    this.height = 720;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Estado del juego
    this.state = GameState.MENU;
    this.score = 0;
    this.currentLevelIndex = 1;

    // Control de tiempo para delta time
    this.lastTime = 0;
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = 0;

    // Entrada de usuario
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      worldX: 0,
      worldY: 0,
      isDown: false,
      rightDown: false
    };

    // Cámara con suavizado (Lerp)
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    };

    // Subsistemas de Combate y Mundo
    this.particles = new ParticleSystem();
    this.weaponManager = new WeaponManager();
    this.map = new TacticalMap(this.currentLevelIndex);
    this.player = new Player(100, 500);
    this.enemyManager = new EnemyManager();

    // Carga de Fondos Pixel Art 16-Bit Realistas de cada Sector
    this.backgroundImages = {};
    for (let i = 1; i <= 4; i++) {
      const img = new Image();
      img.src = `assets/backgrounds/sector${i}.jpg`;
      this.backgroundImages[i] = img;
    }

    // Partículas Atmosféricas (Lluvia, Cenizas, Niebla de Plasma)
    this.weatherParticles = [];
    this.lightningTimer = 0;
    this.isLightningActive = false;
    this.initWeatherParticles();

    this.initInputs();
    this.initUIBindings();
  }

  // Inicialización de eventos de teclado, ratón y rueda
  initInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Tecla Escape para pausar / despausar
      if (e.code === 'Escape') {
        if (this.state === GameState.PLAYING) {
          this.pauseGame();
        } else if (this.state === GameState.PAUSED) {
          this.resumeGame();
        }
      }

      // Teclas numéricas 1 a 5 para selección de arma táctica
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        const slotIdx = parseInt(e.code.replace('Digit', ''), 10) - 1;
        this.weaponManager.selectWeapon(slotIdx);
      }

      // Recarga manual con 'R'
      if (e.code === 'KeyR' && this.state === GameState.PLAYING) {
        this.weaponManager.startReload();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Rueda del ratón para alternar armamento
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        this.weaponManager.nextWeapon();
      } else {
        this.weaponManager.prevWeapon();
      }
    }, { passive: false });

    // Movimiento y coordenadas relativas al Canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
      this.mouse.worldX = this.mouse.x + this.camera.x;
      this.mouse.worldY = this.mouse.y + this.camera.y;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      sound.ensureContext();
      if (e.button === 0) this.mouse.isDown = true;
      if (e.button === 2) this.mouse.rightDown = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.isDown = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    // Desactivar menú contextual en el canvas
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Enlace de botones de la interfaz de usuario
  initUIBindings() {
    // Menú Principal
    document.getElementById('btn-play')?.addEventListener('click', () => {
      this.startNewGame();
    });

    document.getElementById('btn-controls')?.addEventListener('click', () => {
      this.showScreen('controls-screen');
    });

    document.getElementById('btn-scores')?.addEventListener('click', () => {
      this.showScreen('scores-screen');
      this.fetchAndRenderScores();
    });

    document.getElementById('btn-credits')?.addEventListener('click', () => {
      this.showScreen('credits-screen');
    });

    document.getElementById('btn-back-controls')?.addEventListener('click', () => {
      this.showScreen('menu-screen');
    });

    document.getElementById('btn-back-scores')?.addEventListener('click', () => {
      this.showScreen('menu-screen');
    });

    document.getElementById('btn-back-credits')?.addEventListener('click', () => {
      this.showScreen('menu-screen');
    });

    // Pausa
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.resumeGame();
    });

    document.getElementById('btn-restart-pause')?.addEventListener('click', () => {
      this.startNewGame();
    });

    document.getElementById('btn-quit-menu')?.addEventListener('click', () => {
      this.returnToMenu();
    });

    // Game Over
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this.startNewGame();
    });

    document.getElementById('btn-gameover-menu')?.addEventListener('click', () => {
      this.returnToMenu();
    });

    // Victoria
    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      this.returnToMenu();
    });

    // Silenciar Audio
    document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      const soundIcon = document.getElementById('sound-icon');
      if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // Formularios de Guardado de Puntuaciones Reales (POST /api/scores)
    document.getElementById('save-score-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('player-name-input');
      const feedback = document.getElementById('save-score-feedback');
      this.submitScore(input.value, feedback, document.getElementById('btn-save-score'));
    });

    document.getElementById('victory-score-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('victory-name-input');
      const feedback = document.getElementById('victory-score-feedback');
      this.submitScore(input.value, feedback, document.getElementById('btn-victory-save'));
    });
  }

  showScreen(screenId) {
    const screens = [
      'menu-screen',
      'controls-screen',
      'scores-screen',
      'pause-screen',
      'gameover-screen',
      'victory-screen'
    ];
    screens.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
          el.classList.add('active');
        } else {
          el.classList.add('hidden');
          el.classList.remove('active');
        }
      }
    });

    const hud = document.getElementById('hud-overlay');
    if (hud) {
      if (screenId === null) {
        hud.classList.remove('hidden');
      } else {
        hud.classList.add('hidden');
      }
    }
  }

  startNewGame() {
    sound.ensureContext();
    sound.startBGM();
    this.score = 0;
    this.currentLevelIndex = 1;
    this.state = GameState.PLAYING;
    this.showScreen(null);

    this.particles.clear();
    this.weaponManager.reset();
    this.map = new TacticalMap(this.currentLevelIndex);
    this.player.reset(true);
    this.enemyManager.loadSectorEnemies(this.currentLevelIndex);

    this.updateScoreHUD();
    this.updateSectorHUD();

    // Limpiar mensajes previos de formularios
    const f1 = document.getElementById('save-score-feedback');
    const f2 = document.getElementById('victory-score-feedback');
    if (f1) { f1.textContent = ''; f1.className = 'feedback-msg'; }
    if (f2) { f2.textContent = ''; f2.className = 'feedback-msg'; }
  }

  pauseGame() {
    this.state = GameState.PAUSED;
    this.showScreen('pause-screen');
  }

  resumeGame() {
    this.state = GameState.PLAYING;
    this.showScreen(null);
  }

  returnToMenu() {
    this.state = GameState.MENU;
    sound.stopBGM();
    const bossHud = document.getElementById('boss-hud');
    if (bossHud) bossHud.classList.add('hidden');
    this.showScreen('menu-screen');
  }

  triggerGameOver() {
    this.state = GameState.GAMEOVER;
    sound.stopBGM();
    sound.playExplosion();
    const bossHud = document.getElementById('boss-hud');
    if (bossHud) bossHud.classList.add('hidden');
    const sc = document.getElementById('gameover-score');
    const lv = document.getElementById('gameover-level');
    if (sc) sc.textContent = this.score;
    if (lv) lv.textContent = this.currentLevelIndex;
    this.showScreen('gameover-screen');
  }

  triggerVictory() {
    this.state = GameState.VICTORY;
    sound.stopBGM();
    sound.playExtraLife();
    const bossHud = document.getElementById('boss-hud');
    if (bossHud) bossHud.classList.add('hidden');
    const vs = document.getElementById('victory-score');
    if (vs) vs.textContent = this.score;
    this.showScreen('victory-screen');
  }

  addScore(points) {
    this.score += points;
    this.updateScoreHUD();
  }

  updateScoreHUD() {
    const el = document.getElementById('score-text');
    if (el) {
      el.textContent = this.score.toString().padStart(6, '0');
    }
  }

  updateSectorHUD() {
    const el = document.getElementById('level-text');
    if (el) {
      el.textContent = this.map ? this.map.sectorTitle : `SECTOR ${this.currentLevelIndex}`;
    }
  }

  // =========================================================================
  // CONSUMO DE API REAL
  // =========================================================================

  async fetchAndRenderScores() {
    const tbody = document.getElementById('scores-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Solicitando datos a la red de comando...</td></tr>';

    try {
      const response = await fetch('/api/scores');
      const json = await response.json();

      if (!json.success || !Array.isArray(json.data)) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell error">Error en los datos del servidor.</td></tr>';
        return;
      }

      if (json.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No hay registros de combate aún. ¡Sé el primero!</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      json.data.forEach((item, index) => {
        const tr = document.createElement('tr');
        const formattedDate = new Date(item.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        tr.innerHTML = `
          <td><strong style="color: var(--cyan-neon)">#${index + 1}</strong></td>
          <td>${item.name}</td>
          <td style="color: var(--orange-neon); font-weight: bold;">${item.score.toLocaleString()}</td>
          <td>SECTOR ${item.level}</td>
          <td style="color: var(--text-muted);">${formattedDate}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error al consultar /api/scores:', err);
      tbody.innerHTML = '<tr><td colspan="5" class="loading-cell error">Servidor backend no disponible (Modo Local).</td></tr>';
    }
  }

  async submitScore(playerName, feedbackEl, submitBtn) {
    if (!playerName || playerName.trim().length === 0) {
      if (feedbackEl) {
        feedbackEl.className = 'feedback-msg error';
        feedbackEl.textContent = 'Ingrese un nombre de agente válido.';
      }
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (feedbackEl) {
      feedbackEl.className = 'feedback-msg';
      feedbackEl.textContent = 'Transmitiendo puntuación a la base central...';
    }

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: playerName.trim(),
          score: this.score,
          level: this.currentLevelIndex
        })
      });

      const resData = await response.json();
      if (resData.success) {
        if (feedbackEl) {
          feedbackEl.className = 'feedback-msg success';
          feedbackEl.textContent = '¡Registro encriptado y guardado exitosamente en el ranking!';
        }
      } else {
        if (feedbackEl) {
          feedbackEl.className = 'feedback-msg error';
          feedbackEl.textContent = resData.error || 'Fallo al procesar el registro.';
        }
        if (submitBtn) submitBtn.disabled = false;
      }
    } catch (error) {
      console.error('Error al enviar puntuación:', error);
      if (feedbackEl) {
        feedbackEl.className = 'feedback-msg error';
        feedbackEl.textContent = 'Servidor Node.js no activo. Puntuación retenida en memoria local.';
      }
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  // =========================================================================
  // CICLO DE ACTUALIZACIÓN Y DIBUJADO (GAME LOOP)
  // =========================================================================

  update(dt) {
    if (this.state !== GameState.PLAYING) return;

    // Actualización de coordenadas de ratón en el mundo
    this.mouse.worldX = this.mouse.x + this.camera.x;
    this.mouse.worldY = this.mouse.y + this.camera.y;

    // 1. Manejo de Entrada del Jugador
    this.player.handleInputs(this.keys, this.mouse, dt, this.particles);

    // 2. Disparo del Jugador
    if (this.mouse.isDown) {
      const originX = this.player.x + this.player.w / 2;
      const originY = this.player.y + this.player.h / 2 - 4;
      this.weaponManager.triggerFire(originX, originY, this.mouse.worldX, this.mouse.worldY, this.particles);
    }

    // 3. Actualización de Físicas del Jugador
    this.player.update(dt, this.map.platforms, this.particles);

    // Si el jugador se queda sin vidas -> Game Over
    if (this.player.isDead) {
      this.triggerGameOver();
      return;
    }

    // 4. Actualización de Armas y Proyectiles
    this.weaponManager.update(dt, this.particles);

    // 5. Actualización del Mapa y Consumibles
    this.map.update(dt, this.player, this.weaponManager, this.particles);

    // 6. Actualización de Enemigos con IA
    this.enemyManager.update(
      dt,
      this.player,
      this.map.platforms,
      this.weaponManager.projectiles,
      this.particles,
      (points) => this.addScore(points)
    );

    // 7. Colisiones de Proyectiles con el Mundo, Enemigos y Jugador
    this.handleProjectileCollisions();

    // 8. Actualización de Partículas y Clima Atmosférico
    this.particles.update(dt);
    this.updateWeatherParticles(dt);

    // 9. Seguimiento de Cámara suave (Lerp)
    this.updateCamera(dt);

    // 10. Comprobación de Zona de Extracción / Avance de Nivel
    this.checkLevelProgression();
  }

  handleProjectileCollisions() {
    const projectiles = this.weaponManager.projectiles;

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i];
      let bulletRemoved = false;

      // Colisión de proyectil con plataformas sólidas
      for (const plat of this.map.platforms) {
        if (plat.type === 'solid') {
          if (
            proj.x >= plat.x &&
            proj.x <= plat.x + plat.w &&
            proj.y >= plat.y &&
            proj.y <= plat.y + plat.h
          ) {
            this.handleBulletImpact(proj);
            projectiles.splice(i, 1);
            bulletRemoved = true;
            break;
          }
        }
      }

      if (bulletRemoved) continue;

      // Proyectiles del Jugador impactando Enemigos
      if (proj.source === 'player') {
        for (const enemy of this.enemyManager.enemies) {
          if (
            proj.x >= enemy.x &&
            proj.x <= enemy.x + enemy.w &&
            proj.y >= enemy.y &&
            proj.y <= enemy.y + enemy.h
          ) {
            enemy.takeDamage(proj.damage, this.particles);
            this.handleBulletImpact(proj);

            proj.penetration--;
            if (proj.penetration <= 0) {
              projectiles.splice(i, 1);
              bulletRemoved = true;
              break;
            }
          }
        }
      } else if (proj.source === 'enemy') {
        // Proyectiles Enemigos impactando al Jugador
        if (
          proj.x >= this.player.x &&
          proj.x <= this.player.x + this.player.w &&
          proj.y >= this.player.y &&
          proj.y <= this.player.y + this.player.h
        ) {
          this.player.takeDamage(proj.damage, this.particles);
          this.handleBulletImpact(proj);
          projectiles.splice(i, 1);
          bulletRemoved = true;
        }
      }
    }
  }

  handleBulletImpact(proj) {
    if (proj.isRocket) {
      sound.playExplosion();
      this.particles.createExplosion(proj.x, proj.y, proj.blastRadius || 60, '#ff6600');

      // Daño de área por explosión
      const radius = proj.blastRadius || 80;
      if (proj.source === 'player') {
        for (const enemy of this.enemyManager.enemies) {
          const d = Math.hypot(enemy.x + enemy.w / 2 - proj.x, enemy.y + enemy.h / 2 - proj.y);
          if (d <= radius) {
            const splashDmg = Math.round(proj.damage * (1 - d / radius));
            enemy.takeDamage(splashDmg, this.particles);
          }
        }
      } else {
        const d = Math.hypot(this.player.x + this.player.w / 2 - proj.x, this.player.y + this.player.h / 2 - proj.y);
        if (d <= radius) {
          const splashDmg = Math.round(proj.damage * (1 - d / radius));
          this.player.takeDamage(splashDmg, this.particles);
        }
      }
    } else {
      this.particles.createHitSparks(proj.x, proj.y, Math.atan2(proj.vy, proj.vx), proj.color, 6);
    }
  }

  updateCamera(dt) {
    // Centrar la cámara en el jugador
    const targetX = this.player.x + this.player.w / 2 - this.width / 2;
    const targetY = this.player.y + this.player.h / 2 - this.height / 2;

    // Suavizado Lerp
    this.camera.x += (targetX - this.camera.x) * dt * 5.0;
    this.camera.y += (targetY - this.camera.y) * dt * 5.0;

    // Límites de la cámara dentro del mapa
    this.camera.x = Math.max(0, Math.min(this.camera.x, this.map.width - this.width));
    this.camera.y = Math.max(0, Math.min(this.camera.y, this.map.height - this.height));
  }

  checkLevelProgression() {
    const ez = this.map.extractionZone;
    if (
      this.player.x < ez.x + ez.w &&
      this.player.x + this.player.w > ez.x &&
      this.player.y < ez.y + ez.h &&
      this.player.y + this.player.h > ez.y
    ) {
      if (this.currentLevelIndex < 4) {
        // Avanzar al siguiente sector militar (1 -> 2, 2 -> 3, 3 -> 4)
        this.currentLevelIndex++;
        const sectorBonus = this.currentLevelIndex * 2000;
        this.addScore(sectorBonus);
        this.map = new TacticalMap(this.currentLevelIndex);
        this.player.x = 120;
        this.player.y = 500;
        this.player.vx = 0;
        this.player.vy = 0;
        this.enemyManager.loadSectorEnemies(this.currentLevelIndex);
        this.updateSectorHUD();
        sound.playExtraLife();

        const bossHud = document.getElementById('boss-hud');
        if (bossHud) bossHud.classList.add('hidden');

        this.particles.addFloatingText(
          this.player.x + 50,
          this.player.y - 40,
          `¡${this.map.sectorTitle} DESBLOQUEADO! +${sectorBonus} PTS`,
          this.map.themeColor
        );
      } else {
        // Victoria definitiva de la campaña militar
        this.addScore(20000);
        const bossHud = document.getElementById('boss-hud');
        if (bossHud) bossHud.classList.add('hidden');
        this.triggerVictory();
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Fondo táctico militar con cuadrícula procedural temática
    this.renderTacticalBackground();

    if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
      this.ctx.save();
      this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

      // 1. Dibujado del mapa, trampas y plataformas
      this.map.draw(this.ctx);

      // 2. Dibujado de enemigos y jefes
      this.enemyManager.draw(this.ctx);

      // 3. Dibujado de proyectiles
      this.weaponManager.drawProjectiles(this.ctx);

      // 4. Dibujado del comando jugador
      this.player.draw(this.ctx);

      // 5. Dibujado de partículas y textos flotantes
      this.particles.draw(this.ctx);

      this.ctx.restore();
    }

    // Dibujado de retícula de puntería personalizada si estamos jugando
    if (this.state === GameState.PLAYING) {
      this.renderCrosshair();
    }

    // Diagnósticos del motor (FPS, Estado)
    this.renderEngineDiagnostics();
  }

  initWeatherParticles() {
    this.weatherParticles = [];
    const count = 75;
    for (let i = 0; i < count; i++) {
      this.weatherParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: -60 - Math.random() * 80,
        vy: 360 + Math.random() * 200,
        size: 1 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  updateWeatherParticles(dt) {
    const isSector1 = this.currentLevelIndex === 1; // Lluvia
    const isSector2 = this.currentLevelIndex === 2; // Vapor tóxico
    const isSector3 = this.currentLevelIndex === 3; // Energía cuántica
    const isSector4 = this.currentLevelIndex === 4; // Cenizas volcánicas y Rayos

    for (const p of this.weatherParticles) {
      if (isSector1) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y > this.height) { p.y = -10; p.x = Math.random() * (this.width + 200); }
        if (p.x < -10) { p.x = this.width + 10; }
      } else if (isSector2) {
        p.x += (Math.random() - 0.5) * 30 * dt;
        p.y -= (50 + Math.random() * 40) * dt;
        if (p.y < -10) { p.y = this.height + 10; p.x = Math.random() * this.width; }
      } else if (isSector3) {
        p.x += Math.sin(p.y * 0.02) * 20 * dt;
        p.y += (Math.random() - 0.5) * 35 * dt;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
      } else {
        p.x += (Math.sin(p.y * 0.05) * 35 - 15) * dt;
        p.y -= (80 + Math.random() * 60) * dt;
        if (p.y < -10) { p.y = this.height + 10; p.x = Math.random() * this.width; }
      }
    }

    if (isSector4) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.isLightningActive = Math.random() < 0.12;
        if (this.isLightningActive) {
          this.lightningTimer = 0.08;
        } else {
          this.lightningTimer = 2.0 + Math.random() * 3.5;
        }
      }
    } else {
      this.isLightningActive = false;
    }
  }

  renderTacticalBackground() {
    this.ctx.imageSmoothingEnabled = false;
    const bgImg = this.backgroundImages[this.currentLevelIndex];

    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      // Parallax horizontal suave sobre el arte pixel art realista
      const bgW = 1280;
      const bgH = 720;
      const parallaxFactor = 0.20;
      const offsetX = -(this.camera.x * parallaxFactor) % bgW;

      this.ctx.drawImage(bgImg, offsetX, 0, bgW, bgH);
      if (offsetX < 0) {
        this.ctx.drawImage(bgImg, offsetX + bgW, 0, bgW, bgH);
      } else if (offsetX > 0) {
        this.ctx.drawImage(bgImg, offsetX - bgW, 0, bgW, bgH);
      }
    } else {
      // Fallback si la imagen aún carga
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      if (this.currentLevelIndex === 1) {
        gradient.addColorStop(0, '#04070c');
        gradient.addColorStop(1, '#0c1524');
      } else if (this.currentLevelIndex === 2) {
        gradient.addColorStop(0, '#0b0312');
        gradient.addColorStop(1, '#1b0826');
      } else if (this.currentLevelIndex === 3) {
        gradient.addColorStop(0, '#030f07');
        gradient.addColorStop(1, '#082112');
      } else {
        gradient.addColorStop(0, '#140306');
        gradient.addColorStop(1, '#29060b');
      }
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Efectos atmosféricos del sector (Lluvia, Vaho, Motes, Cenizas)
    this.drawWeather(this.ctx);
  }

  drawWeather(ctx) {
    ctx.save();
    const isSector1 = this.currentLevelIndex === 1;
    const isSector2 = this.currentLevelIndex === 2;
    const isSector3 = this.currentLevelIndex === 3;

    if (isSector1) {
      // Lluvia cibernética con reflejo de neón
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      for (const p of this.weatherParticles) {
        ctx.globalAlpha = p.alpha * 0.55;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 3, p.y + 14);
        ctx.stroke();
      }
    } else if (isSector2) {
      // Vapor tóxico violeta
      ctx.fillStyle = '#bd00ff';
      for (const p of this.weatherParticles) {
        ctx.globalAlpha = p.alpha * 0.28;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (isSector3) {
      // Motes cuánticos esmeralda
      ctx.fillStyle = '#00ff77';
      ctx.shadowColor = '#00ff77';
      ctx.shadowBlur = 6;
      for (const p of this.weatherParticles) {
        ctx.globalAlpha = p.alpha * 0.65;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    } else {
      // Cenizas incandescentes y relámpago en el Trono del Titán
      if (this.isLightningActive) {
        ctx.fillStyle = 'rgba(255, 0, 85, 0.28)';
        ctx.fillRect(0, 0, this.width, this.height);
      }
      ctx.fillStyle = '#ff3300';
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 8;
      for (const p of this.weatherParticles) {
        ctx.globalAlpha = p.alpha * 0.75;
        ctx.fillRect(p.x, p.y, p.size * 1.5, p.size * 1.5);
      }
    }

    ctx.restore();
  }

  renderCrosshair() {
    const mx = this.mouse.x;
    const my = this.mouse.y;

    this.ctx.save();
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 1.5;

    // Círculo exterior
    this.ctx.beginPath();
    this.ctx.arc(mx, my, 8, 0, Math.PI * 2);
    this.ctx.stroke();

    // Marcadores cardinales
    this.ctx.beginPath();
    this.ctx.moveTo(mx - 12, my);
    this.ctx.lineTo(mx - 3, my);
    this.ctx.moveTo(mx + 3, my);
    this.ctx.lineTo(mx + 12, my);
    this.ctx.moveTo(mx, my - 12);
    this.ctx.lineTo(mx, my - 3);
    this.ctx.moveTo(mx, my + 3);
    this.ctx.lineTo(mx, my + 12);
    this.ctx.stroke();

    // Punto central
    this.ctx.fillStyle = '#ff6600';
    this.ctx.beginPath();
    this.ctx.arc(mx, my, 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  renderEngineDiagnostics() {
    this.ctx.save();
    this.ctx.font = '11px "Share Tech Mono", monospace';
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    this.ctx.fillText(`MOTOR: ONLINE | FPS: ${this.fps} | ESTADO: ${this.state}`, 15, 20);
    this.ctx.restore();
  }

  start() {
    this.lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      // Cálculo de FPS
      this.frameCount++;
      this.fpsTimer += dt;
      if (this.fpsTimer >= 1) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.fpsTimer = 0;
      }

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
