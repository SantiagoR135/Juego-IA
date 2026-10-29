/**
 * ENEMY.JS - INTELIGENCIA ARTIFICIAL DE AMENAZAS HOSTILES Y JEFES DE SECTOR (CAMPAÑA COMPLETA)
 * Drones centinela, soldados de asalto, droides pesados, mechas y el Titán Aplastador Omega.
 */

import { sound } from './audio.js?v=3';
import { Projectile } from './weapons.js?v=3';
import { spriteRenderer } from './sprites.js?v=3';

export class Enemy {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.w = config.w || 36;
    this.h = config.h || 60;
    this.type = config.type || 'soldier'; // 'drone', 'soldier', 'heavy', 'kamikaze', 'boss', 'apex', 'mech'
    this.health = config.health || 60;
    this.maxHealth = this.health;
    this.speed = config.speed || 100;
    this.scoreValue = config.scoreValue || 150;
    this.bossName = config.bossName || 'AMENAZA OMEGA';

    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
    this.isDead = false;

    // IA y Combate
    this.patrolLeft = config.patrolLeft || this.x - 200;
    this.patrolRight = config.patrolRight || this.x + 200;
    this.detectionRange = config.detectionRange || 650;
    this.attackRange = config.attackRange || 500;
    this.fireCooldown = 0;
    this.fireRate = config.fireRate || 1.3;
    this.bulletColor = config.bulletColor || '#ff1a40';

    // Drone hover
    this.hoverTimer = Math.random() * Math.PI * 2;

    // Boss y Mecha
    this.isBoss = config.isBoss || ['boss', 'apex', 'mech'].includes(this.type);
    this.bossPhase = 1;
    this.bossActionTimer = 2.5;
  }

  update(dt, player, platforms, projectiles, particleSystem) {
    if (this.isDead) return;

    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }

    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    const seesPlayer = distToPlayer < this.detectionRange;

    // Actualización según tipo de enemigo
    if (this.type === 'drone') {
      this.updateDrone(dt, player, seesPlayer, distToPlayer, projectiles, particleSystem);
    } else if (this.type === 'kamikaze') {
      this.updateKamikaze(dt, player, distToPlayer, particleSystem);
    } else if (this.type === 'soldier' || this.type === 'heavy') {
      this.updateGroundUnit(dt, player, platforms, seesPlayer, distToPlayer, projectiles, particleSystem);
    } else if (this.type === 'apex') {
      this.updateApexBoss(dt, player, distToPlayer, projectiles, particleSystem);
    } else if (this.type === 'mech') {
      this.updateMechBoss(dt, player, platforms, distToPlayer, projectiles, particleSystem);
    } else if (this.type === 'boss') {
      this.updateTitanBoss(dt, player, platforms, distToPlayer, projectiles, particleSystem);
    }
  }

  updateDrone(dt, player, seesPlayer, dist, projectiles, particleSystem) {
    this.hoverTimer += dt * 3;
    const hoverY = Math.sin(this.hoverTimer) * 15;

    if (seesPlayer) {
      this.facing = player.x > this.x ? 1 : -1;
      const targetX = player.x + (this.facing === 1 ? -220 : 220);
      this.x += (targetX - this.x) * dt * 1.5;
      this.y += (player.y - 120 + hoverY - this.y) * dt * 1.8;

      if (this.fireCooldown <= 0 && dist < this.attackRange) {
        this.fireCooldown = this.fireRate;
        this.fireAtPlayer(player, projectiles, 480, 15, this.bulletColor);
      }
    } else {
      this.x += this.facing * this.speed * 0.5 * dt;
      this.y += hoverY * dt;
      if (this.x < this.patrolLeft) this.facing = 1;
      if (this.x > this.patrolRight) this.facing = -1;
    }
  }

  updateKamikaze(dt, player, dist, particleSystem) {
    // Vuelo rápido en línea directa hacia el jugador
    this.facing = player.x > this.x ? 1 : -1;
    const angle = Math.atan2((player.y + player.h / 2) - this.y, (player.x + player.w / 2) - this.x);
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;

    if (particleSystem && Math.random() < 0.25) {
      particleSystem.createHitSparks(this.x + this.w / 2, this.y + this.h / 2, angle + Math.PI, '#ffaa00', 2);
    }

    // Si impacta al jugador, se autodestruye causando daño explosivo
    if (dist < 40) {
      player.takeDamage(35, particleSystem);
      this.takeDamage(this.health, particleSystem);
    }
  }

  updateGroundUnit(dt, player, platforms, seesPlayer, dist, projectiles, particleSystem) {
    this.vy += 1500 * dt;
    if (this.vy > 1000) this.vy = 1000;

    if (seesPlayer) {
      this.facing = player.x > this.x ? 1 : -1;
      if (dist > 280) {
        this.vx = this.facing * this.speed;
      } else {
        this.vx = 0;
      }

      if (this.fireCooldown <= 0 && dist < this.attackRange) {
        this.fireCooldown = this.type === 'heavy' ? 1.7 : this.fireRate;
        const count = this.type === 'heavy' ? 3 : 1;
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            if (!this.isDead) {
              this.fireAtPlayer(player, projectiles, 550, this.type === 'heavy' ? 22 : 12, this.bulletColor);
            }
          }, i * 150);
        }
      }
    } else {
      this.vx = this.facing * this.speed * 0.6;
      if (this.x < this.patrolLeft) this.facing = 1;
      if (this.x > this.patrolRight) this.facing = -1;
    }

    this.x += this.vx * dt;
    const prevY = this.y;
    this.y += this.vy * dt;

    for (const plat of platforms) {
      if (
        this.x + this.w > plat.x &&
        this.x < plat.x + plat.w &&
        this.y + this.h > plat.y &&
        prevY + this.h <= plat.y + 12 &&
        this.vy >= 0
      ) {
        this.y = plat.y - this.h;
        this.vy = 0;
      }
    }
  }

  updateApexBoss(dt, player, dist, projectiles, particleSystem) {
    // Jefe Sector 2: Dron Colosal que vuela en espiral y dispara ráfagas de plasma
    this.facing = player.x > this.x ? 1 : -1;
    this.hoverTimer += dt * 2.5;

    const targetX = player.x + (this.facing === 1 ? -260 : 260);
    const targetY = player.y - 180 + Math.sin(this.hoverTimer) * 35;
    this.x += (targetX - this.x) * dt * 2.0;
    this.y += (targetY - this.y) * dt * 2.0;

    this.bossActionTimer -= dt;
    if (this.bossActionTimer <= 0) {
      this.bossActionTimer = 2.4;
      // Anillo de 8 balas de plasma
      sound.playShootPlasma();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        projectiles.push(new Projectile({
          x: this.x + this.w / 2,
          y: this.y + this.h / 2,
          vx: Math.cos(a) * 360,
          vy: Math.sin(a) * 360,
          damage: 16,
          color: '#bd00ff',
          source: 'enemy'
        }));
      }
    }

    if (this.fireCooldown <= 0) {
      this.fireCooldown = 1.1;
      this.fireAtPlayer(player, projectiles, 600, 18, '#bd00ff');
    }

    this.syncBossHUD(dist);
  }

  updateMechBoss(dt, player, platforms, dist, projectiles, particleSystem) {
    // Jefe Sector 3: Mecha bípedo con cañones duales y salto pesado
    this.facing = player.x > this.x ? 1 : -1;
    this.vy += 1500 * dt;

    this.bossActionTimer -= dt;
    if (this.bossActionTimer <= 0) {
      this.bossActionTimer = 2.8;
      // Salto ofensivo
      this.vy = -680;
      this.vx = this.facing * 260;
      sound.playExplosion();
      // Misil disparado en el salto
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      projectiles.push(new Projectile({
        x: this.x + this.w / 2,
        y: this.y + 10,
        vx: Math.cos(angle) * 520,
        vy: Math.sin(angle) * 520,
        damage: 26,
        color: '#00ff77',
        source: 'enemy',
        isRocket: true,
        blastRadius: 50
      }));
    }

    if (this.fireCooldown <= 0) {
      this.fireCooldown = 1.0;
      this.fireAtPlayer(player, projectiles, 620, 20, '#00ff77');
    }

    this.x += (this.vx || 0) * dt;
    this.y += this.vy * dt;
    for (const plat of platforms) {
      if (
        this.x + this.w > plat.x &&
        this.x < plat.x + plat.w &&
        this.y + this.h >= plat.y &&
        this.vy >= 0
      ) {
        this.y = plat.y - this.h;
        this.vy = 0;
        this.vx = 0;
      }
    }

    this.syncBossHUD(dist);
  }

  updateTitanBoss(dt, player, platforms, dist, projectiles, particleSystem) {
    // Gran Jefe Final: Titán Aplastador Omega
    this.facing = player.x > this.x ? 1 : -1;
    this.vy += 1500 * dt;

    // Fases de combate del Titán
    const healthRatio = this.health / this.maxHealth;
    if (healthRatio < 0.35) {
      this.bossPhase = 3; // Modo Furia
    } else if (healthRatio < 0.70) {
      this.bossPhase = 2; // Modo Andanada
    }

    this.bossActionTimer -= dt;
    const actionInterval = this.bossPhase === 3 ? 1.8 : 2.5;

    if (this.bossActionTimer <= 0) {
      this.bossActionTimer = actionInterval;
      this.performTitanSpecialAttack(player, projectiles, particleSystem);
    }

    // Disparo regular constante
    if (this.fireCooldown <= 0) {
      this.fireCooldown = this.bossPhase === 3 ? 0.6 : 0.9;
      this.fireAtPlayer(player, projectiles, 650, 22, '#ff0055');
    }

    this.x += (this.vx || 0) * dt;
    this.y += this.vy * dt;

    for (const plat of platforms) {
      if (
        this.x + this.w > plat.x &&
        this.x < plat.x + plat.w &&
        this.y + this.h >= plat.y &&
        this.vy >= 0
      ) {
        this.y = plat.y - this.h;
        this.vy = 0;
        this.vx = 0;
      }
    }

    this.syncBossHUD(dist);
  }

  performTitanSpecialAttack(player, projectiles, particleSystem) {
    const action = Math.floor(Math.random() * 3);

    if (action === 0) {
      // Salto destructor con onda sísmica
      this.vy = -750;
      this.vx = this.facing * 340;
      if (particleSystem) {
        particleSystem.createExplosion(this.x + this.w / 2, this.y + this.h, 45, '#ff0055');
      }
    } else if (action === 1) {
      // Lluvia de 5 micro-misiles
      sound.playExplosion();
      for (let i = -2; i <= 2; i++) {
        const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
        const angle = baseAngle + (i * 0.18);
        projectiles.push(new Projectile({
          x: this.x + this.w / 2,
          y: this.y + 20,
          vx: Math.cos(angle) * 480,
          vy: Math.sin(angle) * 480,
          damage: 24,
          color: '#ff3300',
          source: 'enemy',
          isRocket: true,
          blastRadius: 45
        }));
      }
    } else {
      // Descarga radial de energía (Furia OMEGA: 12 proyectiles)
      sound.playShootLaser();
      const count = this.bossPhase === 3 ? 12 : 8;
      for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / count) {
        projectiles.push(new Projectile({
          x: this.x + this.w / 2,
          y: this.y + this.h / 2,
          vx: Math.cos(a) * 400,
          vy: Math.sin(a) * 400,
          damage: 18,
          color: '#ff0055',
          source: 'enemy'
        }));
      }
    }
  }

  syncBossHUD(distToPlayer) {
    const bossHud = document.getElementById('boss-hud');
    const bossNameEl = document.getElementById('boss-name');
    const bossBar = document.getElementById('boss-health-bar');

    // Mostrar barra de vida solo si el jugador está en combate en la arena del jefe
    if (distToPlayer < 900) {
      if (bossHud) bossHud.classList.remove('hidden');
      if (bossNameEl) bossNameEl.textContent = this.bossName;
      if (bossBar) {
        bossBar.style.width = `${Math.max(0, (this.health / this.maxHealth) * 100)}%`;
      }
    } else if (bossHud) {
      bossHud.classList.add('hidden');
    }
  }

  fireAtPlayer(player, projectiles, speed, damage, color) {
    const originX = this.x + (this.facing === 1 ? this.w : 0);
    const originY = this.y + this.h * 0.35;
    const angle = Math.atan2((player.y + player.h / 2) - originY, (player.x + player.w / 2) - originX);

    projectiles.push(new Projectile({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage,
      color,
      source: 'enemy',
      radius: 3
    }));

    sound.playShootStandard();
  }

  takeDamage(amount, particleSystem) {
    this.health -= amount;
    if (particleSystem) {
      particleSystem.createHitSparks(this.x + this.w / 2, this.y + this.h / 2, Math.PI / 2, '#ff1a40', 6);
      particleSystem.addFloatingText(this.x + this.w / 2, this.y - 10, `-${amount}`, '#ffaa00');
    }

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      sound.playExplosion();

      if (particleSystem) {
        particleSystem.createExplosion(this.x + this.w / 2, this.y + this.h / 2, this.isBoss ? 80 : 35, '#ff6600');
      }

      if (this.isBoss) {
        const bossHud = document.getElementById('boss-hud');
        if (bossHud) bossHud.classList.add('hidden');
      }
    }
  }

  draw(ctx) {
    if (this.isDead) return;

    spriteRenderer.drawEnemy(ctx, this);

    // Barra de vida superior para enemigos estándar
    if (!this.isBoss && this.health < this.maxHealth) {
      const barW = this.w;
      const barH = 4;
      const barX = this.x;
      const barY = this.y - 10;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#ff1a40';
      ctx.fillRect(barX, barY, (this.health / this.maxHealth) * barW, barH);
    }
  }
}

export class EnemyManager {
  constructor() {
    this.enemies = [];
  }

  loadSectorEnemies(levelNumber) {
    this.enemies = [];

    if (levelNumber === 1) {
      // =====================================================================
      // SECTOR 1: Trincheras y Avanzada (7,500 px)
      // =====================================================================
      this.enemies.push(new Enemy({ x: 700, y: 320, type: 'drone', patrolLeft: 600, patrolRight: 880 }));
      this.enemies.push(new Enemy({ x: 1000, y: 520, type: 'soldier', patrolLeft: 850, patrolRight: 1150 }));
      this.enemies.push(new Enemy({ x: 1350, y: 270, type: 'drone', patrolLeft: 1200, patrolRight: 1500 }));
      this.enemies.push(new Enemy({ x: 1650, y: 520, type: 'soldier', patrolLeft: 1550, patrolRight: 1850 }));
      this.enemies.push(new Enemy({ x: 2150, y: 320, type: 'heavy', health: 120, patrolLeft: 2050, patrolRight: 2350 }));
      this.enemies.push(new Enemy({ x: 2800, y: 520, type: 'drone', patrolLeft: 2600, patrolRight: 3000 }));
      this.enemies.push(new Enemy({ x: 3100, y: 300, type: 'soldier', patrolLeft: 2950, patrolRight: 3300 }));
      this.enemies.push(new Enemy({ x: 3500, y: 520, type: 'soldier', patrolLeft: 3350, patrolRight: 3700 }));
      this.enemies.push(new Enemy({ x: 4100, y: 320, type: 'drone', patrolLeft: 3950, patrolRight: 4300 }));
      this.enemies.push(new Enemy({ x: 4500, y: 520, type: 'heavy', health: 140, patrolLeft: 4350, patrolRight: 4700 }));
      this.enemies.push(new Enemy({ x: 4900, y: 210, type: 'soldier', patrolLeft: 4750, patrolRight: 5100 }));
      this.enemies.push(new Enemy({ x: 5300, y: 520, type: 'drone', patrolLeft: 5150, patrolRight: 5500 }));
      this.enemies.push(new Enemy({ x: 5800, y: 300, type: 'soldier', patrolLeft: 5650, patrolRight: 6000 }));
      this.enemies.push(new Enemy({ x: 6200, y: 520, type: 'heavy', health: 160, patrolLeft: 6050, patrolRight: 6400 }));

      // Mini-Jefe Centinela Pesado antes de evacuar en x = 6,800
      this.enemies.push(new Enemy({
        x: 6800,
        y: 490,
        w: 56,
        h: 78,
        type: 'heavy',
        health: 280,
        speed: 95,
        scoreValue: 2000,
        bossName: 'CENTINELA BLINDADO MK-I'
      }));

    } else if (levelNumber === 2) {
      // =====================================================================
      // SECTOR 2: Refinería Neón (8,200 px)
      // =====================================================================
      this.enemies.push(new Enemy({ x: 600, y: 280, type: 'drone', bulletColor: '#bd00ff', patrolLeft: 500, patrolRight: 800 }));
      this.enemies.push(new Enemy({ x: 920, y: 200, type: 'soldier', bulletColor: '#bd00ff', patrolLeft: 840, patrolRight: 1100 }));
      this.enemies.push(new Enemy({ x: 1450, y: 520, type: 'kamikaze', speed: 190, health: 30 }));
      this.enemies.push(new Enemy({ x: 1800, y: 280, type: 'drone', bulletColor: '#bd00ff', patrolLeft: 1700, patrolRight: 2050 }));
      this.enemies.push(new Enemy({ x: 2200, y: 180, type: 'soldier', bulletColor: '#bd00ff', patrolLeft: 2100, patrolRight: 2400 }));
      this.enemies.push(new Enemy({ x: 2600, y: 520, type: 'heavy', health: 160, bulletColor: '#bd00ff', patrolLeft: 2450, patrolRight: 2750 }));
      this.enemies.push(new Enemy({ x: 3100, y: 390, type: 'kamikaze', speed: 200, health: 35 }));
      this.enemies.push(new Enemy({ x: 3500, y: 280, type: 'drone', bulletColor: '#bd00ff', patrolLeft: 3350, patrolRight: 3700 }));
      this.enemies.push(new Enemy({ x: 3900, y: 520, type: 'soldier', bulletColor: '#bd00ff', patrolLeft: 3750, patrolRight: 4100 }));
      this.enemies.push(new Enemy({ x: 4300, y: 300, type: 'heavy', health: 180, bulletColor: '#bd00ff', patrolLeft: 4150, patrolRight: 4500 }));
      this.enemies.push(new Enemy({ x: 4700, y: 520, type: 'kamikaze', speed: 210, health: 35 }));
      this.enemies.push(new Enemy({ x: 5100, y: 200, type: 'soldier', bulletColor: '#bd00ff', patrolLeft: 4950, patrolRight: 5300 }));
      this.enemies.push(new Enemy({ x: 5500, y: 520, type: 'drone', bulletColor: '#bd00ff', patrolLeft: 5350, patrolRight: 5700 }));
      this.enemies.push(new Enemy({ x: 6000, y: 300, type: 'kamikaze', speed: 220, health: 40 }));
      this.enemies.push(new Enemy({ x: 6400, y: 520, type: 'heavy', health: 200, bulletColor: '#bd00ff', patrolLeft: 6250, patrolRight: 6600 }));
      this.enemies.push(new Enemy({ x: 6800, y: 280, type: 'drone', bulletColor: '#bd00ff', patrolLeft: 6650, patrolRight: 7000 }));

      // JEFE SECTOR 2: CENTINELA APEX v3.0 en x = 7,400
      this.enemies.push(new Enemy({
        x: 7400,
        y: 280,
        w: 68,
        h: 68,
        type: 'apex',
        health: 560,
        speed: 135,
        scoreValue: 4000,
        bossName: 'CENTINELA APEX v3.0',
        isBoss: true
      }));

    } else if (levelNumber === 3) {
      // =====================================================================
      // SECTOR 3: Laboratorio Subterráneo (8,600 px)
      // =====================================================================
      this.enemies.push(new Enemy({ x: 600, y: 320, type: 'soldier', bulletColor: '#00ff77', patrolLeft: 520, patrolRight: 800 }));
      this.enemies.push(new Enemy({ x: 920, y: 520, type: 'kamikaze', speed: 210, health: 35 }));
      this.enemies.push(new Enemy({ x: 1400, y: 240, type: 'heavy', health: 180, bulletColor: '#00ff77', patrolLeft: 1300, patrolRight: 1600 }));
      this.enemies.push(new Enemy({ x: 1800, y: 360, type: 'drone', bulletColor: '#00ff77', patrolLeft: 1650, patrolRight: 2000 }));
      this.enemies.push(new Enemy({ x: 2300, y: 320, type: 'soldier', bulletColor: '#00ff77', patrolLeft: 2200, patrolRight: 2500 }));
      this.enemies.push(new Enemy({ x: 2800, y: 140, type: 'kamikaze', speed: 220, health: 40 }));
      this.enemies.push(new Enemy({ x: 3300, y: 260, type: 'heavy', health: 200, bulletColor: '#00ff77', patrolLeft: 3150, patrolRight: 3500 }));
      this.enemies.push(new Enemy({ x: 3800, y: 520, type: 'drone', bulletColor: '#00ff77', patrolLeft: 3650, patrolRight: 4000 }));
      this.enemies.push(new Enemy({ x: 4300, y: 300, type: 'soldier', bulletColor: '#00ff77', patrolLeft: 4150, patrolRight: 4500 }));
      this.enemies.push(new Enemy({ x: 4700, y: 520, type: 'kamikaze', speed: 230, health: 40 }));
      this.enemies.push(new Enemy({ x: 5200, y: 200, type: 'heavy', health: 220, bulletColor: '#00ff77', patrolLeft: 5050, patrolRight: 5400 }));
      this.enemies.push(new Enemy({ x: 5700, y: 520, type: 'drone', bulletColor: '#00ff77', patrolLeft: 5550, patrolRight: 5900 }));
      this.enemies.push(new Enemy({ x: 6200, y: 300, type: 'soldier', bulletColor: '#00ff77', patrolLeft: 6050, patrolRight: 6400 }));
      this.enemies.push(new Enemy({ x: 6700, y: 180, type: 'kamikaze', speed: 240, health: 45 }));
      this.enemies.push(new Enemy({ x: 7200, y: 520, type: 'heavy', health: 240, bulletColor: '#00ff77', patrolLeft: 7050, patrolRight: 7400 }));

      // JEFE SECTOR 3: MECHA BÍPEDO MK-II en x = 7,800
      this.enemies.push(new Enemy({
        x: 7800,
        y: 480,
        w: 72,
        h: 96,
        type: 'mech',
        health: 700,
        speed: 125,
        scoreValue: 6000,
        bossName: 'MECHA BÍPEDO MK-II',
        isBoss: true
      }));

    } else {
      // =====================================================================
      // SECTOR 4: La Ciudadela Negra (9,200 px)
      // =====================================================================
      this.enemies.push(new Enemy({ x: 450, y: 400, type: 'soldier', bulletColor: '#ff0055', patrolLeft: 350, patrolRight: 600 }));
      this.enemies.push(new Enemy({ x: 800, y: 290, type: 'heavy', health: 180, bulletColor: '#ff0055', patrolLeft: 700, patrolRight: 950 }));
      this.enemies.push(new Enemy({ x: 1100, y: 200, type: 'kamikaze', speed: 230, health: 40 }));
      this.enemies.push(new Enemy({ x: 1500, y: 320, type: 'drone', bulletColor: '#ff0055', patrolLeft: 1400, patrolRight: 1650 }));
      this.enemies.push(new Enemy({ x: 1900, y: 420, type: 'heavy', health: 220, bulletColor: '#ff0055', patrolLeft: 1800, patrolRight: 2050 }));
      this.enemies.push(new Enemy({ x: 2500, y: 400, type: 'soldier', bulletColor: '#ff0055', patrolLeft: 2400, patrolRight: 2700 }));
      this.enemies.push(new Enemy({ x: 2950, y: 300, type: 'kamikaze', speed: 240, health: 45 }));
      this.enemies.push(new Enemy({ x: 3400, y: 200, type: 'heavy', health: 240, bulletColor: '#ff0055', patrolLeft: 3300, patrolRight: 3600 }));
      this.enemies.push(new Enemy({ x: 3900, y: 450, type: 'drone', bulletColor: '#ff0055', patrolLeft: 3750, patrolRight: 4100 }));
      this.enemies.push(new Enemy({ x: 4400, y: 300, type: 'soldier', bulletColor: '#ff0055', patrolLeft: 4250, patrolRight: 4600 }));
      this.enemies.push(new Enemy({ x: 4800, y: 190, type: 'kamikaze', speed: 250, health: 50 }));
      this.enemies.push(new Enemy({ x: 5300, y: 520, type: 'heavy', health: 260, bulletColor: '#ff0055', patrolLeft: 5150, patrolRight: 5500 }));
      this.enemies.push(new Enemy({ x: 5800, y: 320, type: 'drone', bulletColor: '#ff0055', patrolLeft: 5650, patrolRight: 6000 }));
      this.enemies.push(new Enemy({ x: 6300, y: 520, type: 'soldier', bulletColor: '#ff0055', patrolLeft: 6150, patrolRight: 6500 }));
      this.enemies.push(new Enemy({ x: 6800, y: 200, type: 'kamikaze', speed: 260, health: 50 }));
      this.enemies.push(new Enemy({ x: 7300, y: 450, type: 'heavy', health: 280, bulletColor: '#ff0055', patrolLeft: 7150, patrolRight: 7500 }));

      // GRAN JEFE FINAL: TITÁN APLASTADOR OMEGA en x = 8,300
      this.enemies.push(new Enemy({
        x: 8300,
        y: 430,
        w: 90,
        h: 125,
        type: 'boss',
        health: 950,
        speed: 150,
        scoreValue: 12000,
        bossName: 'TITÁN APLASTADOR OMEGA',
        isBoss: true
      }));
    }
  }

  update(dt, player, platforms, projectiles, particleSystem, onScoreEarned) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, player, platforms, projectiles, particleSystem);

      if (enemy.isDead) {
        if (onScoreEarned) onScoreEarned(enemy.scoreValue);
        this.enemies.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const enemy of this.enemies) {
      enemy.draw(ctx);
    }
  }
}
