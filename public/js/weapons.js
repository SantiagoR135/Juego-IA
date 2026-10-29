/**
 * WEAPONS.JS - ARMAS TÁCTICAS MILITARES Y FÍSICA DE PROYECTILES
 * Maneja proyectiles, balística, dispersión, recargas y enlace con el HUD.
 */

import { sound } from './audio.js?v=2';

export class Projectile {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.radius = config.radius || 3;
    this.damage = config.damage || 20;
    this.color = config.color || '#00f0ff';
    this.source = config.source || 'player'; // 'player' o 'enemy'
    this.penetration = config.penetration || 1;
    this.life = config.life || 3.0; // segundos
    this.isRocket = config.isRocket || false;
    this.blastRadius = config.blastRadius || 0;
    this.trailTimer = 0;
  }

  update(dt, particleSystem) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;

    if (this.isRocket && particleSystem) {
      this.trailTimer += dt;
      if (this.trailTimer > 0.02) {
        this.trailTimer = 0;
        particleSystem.particles.push({
          x: this.x - (this.vx * 0.015),
          y: this.y - (this.vy * 0.015),
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          color: '#ff6600',
          size: 4,
          initialSize: 4,
          life: 0.25,
          maxLife: 0.25,
          decay: 1,
          type: 'spark',
          update(dt2) {
            this.x += this.vx * dt2;
            this.y += this.vy * dt2;
            this.life -= this.decay * dt2;
            this.size = this.initialSize * (this.life / this.maxLife);
          },
          draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;

    if (this.isRocket) {
      // Cohete cibernético alargado
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(-8, -2, 16, 4);
      ctx.fillStyle = '#ffff33';
      ctx.fillRect(-10, -1, 3, 2);
    } else {
      // Proyectil trazador brillante
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.fillRect(-this.radius * 2, -this.radius, this.radius * 4, this.radius * 2);
    }

    ctx.restore();
  }
}

export const WEAPON_TYPES = [
  {
    id: 1,
    name: 'PISTOLA TÁCTICA',
    damage: 28,
    fireRate: 0.22, // segundos entre disparos
    magSize: Infinity,
    reserveAmmo: Infinity,
    currentAmmo: Infinity,
    reloadTime: 0,
    bulletSpeed: 950,
    spread: 0.02,
    bulletsPerShot: 1,
    color: '#00f0ff',
    icon: '🔫',
    sound: 'standard',
    isUnlocked: true // Arma táctica inicial
  },
  {
    id: 2,
    name: 'FUSIL DE PLASMA',
    damage: 20,
    fireRate: 0.10,
    magSize: 32,
    reserveAmmo: 128,
    currentAmmo: 32,
    reloadTime: 1.5,
    bulletSpeed: 1100,
    spread: 0.05,
    bulletsPerShot: 1,
    color: '#00ffaa',
    icon: '⚡',
    sound: 'plasma',
    isUnlocked: false // Bloqueada hasta encontrar caja
  },
  {
    id: 3,
    name: 'ESCOPETA DE ASALTO',
    damage: 16,
    fireRate: 0.70,
    magSize: 8,
    reserveAmmo: 40,
    currentAmmo: 8,
    reloadTime: 2.0,
    bulletSpeed: 850,
    spread: 0.16,
    bulletsPerShot: 6,
    color: '#ffaa00',
    icon: '💥',
    sound: 'shotgun',
    isUnlocked: false // Bloqueada hasta encontrar caja
  },
  {
    id: 4,
    name: 'CAÑÓN DE IONES',
    damage: 110,
    fireRate: 1.1,
    magSize: 5,
    reserveAmmo: 20,
    currentAmmo: 5,
    reloadTime: 2.2,
    bulletSpeed: 1600,
    spread: 0.005,
    bulletsPerShot: 1,
    penetration: 3,
    color: '#33ccff',
    icon: '🌀',
    sound: 'laser',
    isUnlocked: false // Bloqueada hasta encontrar caja
  },
  {
    id: 5,
    name: 'LANZACOHETES MK-IV',
    damage: 150,
    fireRate: 1.3,
    magSize: 4,
    reserveAmmo: 12,
    currentAmmo: 4,
    reloadTime: 2.5,
    bulletSpeed: 700,
    spread: 0.01,
    bulletsPerShot: 1,
    isRocket: true,
    blastRadius: 90,
    color: '#ff3300',
    icon: '🚀',
    sound: 'explosion',
    isUnlocked: false // Bloqueada hasta encontrar caja
  }
];

export class WeaponManager {
  constructor() {
    this.weapons = WEAPON_TYPES.map(w => ({ ...w }));
    this.currentIndex = 0; // Inicia con Pistola
    this.fireTimer = 0;
    this.isReloading = false;
    this.reloadTimer = 0;
    this.projectiles = [];

    this.initDOMSlots();
    this.updateHUD();
  }

  getCurrentWeapon() {
    return this.weapons[this.currentIndex];
  }

  selectWeapon(index) {
    if (index < 0 || index >= this.weapons.length) return;
    const w = this.weapons[index];
    if (!w.isUnlocked) return;

    if (this.currentIndex !== index) {
      this.currentIndex = index;
      this.isReloading = false;
      this.reloadTimer = 0;
      this.updateHUD();
    }
  }

  nextWeapon() {
    let nextIdx = (this.currentIndex + 1) % this.weapons.length;
    while (!this.weapons[nextIdx].isUnlocked) {
      nextIdx = (nextIdx + 1) % this.weapons.length;
    }
    this.selectWeapon(nextIdx);
  }

  prevWeapon() {
    let prevIdx = (this.currentIndex - 1 + this.weapons.length) % this.weapons.length;
    while (!this.weapons[prevIdx].isUnlocked) {
      prevIdx = (prevIdx - 1 + this.weapons.length) % this.weapons.length;
    }
    this.selectWeapon(prevIdx);
  }

  startReload() {
    const w = this.getCurrentWeapon();
    if (w.magSize === Infinity) return;
    if (w.currentAmmo === w.magSize) return;
    if (w.reserveAmmo <= 0) return;
    if (this.isReloading) return;

    this.isReloading = true;
    this.reloadTimer = w.reloadTime;
    sound.playReload();
  }

  update(dt, particleSystem) {
    if (this.fireTimer > 0) {
      this.fireTimer -= dt;
    }

    // Proceso de recarga
    if (this.isReloading) {
      this.reloadTimer -= dt;
      const w = this.getCurrentWeapon();
      const pct = Math.max(0, Math.min(1, 1 - (this.reloadTimer / w.reloadTime)));
      const reloadBar = document.getElementById('reload-bar');
      if (reloadBar) reloadBar.style.width = `${pct * 100}%`;

      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        const needed = w.magSize - w.currentAmmo;
        const actual = Math.min(needed, w.reserveAmmo);
        w.currentAmmo += actual;
        w.reserveAmmo -= actual;
        if (reloadBar) reloadBar.style.width = '0%';
        this.updateHUD();
      }
    }

    // Actualización de proyectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt, particleSystem);

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  drawProjectiles(ctx) {
    for (const proj of this.projectiles) {
      proj.draw(ctx);
    }
  }

  triggerFire(originX, originY, targetX, targetY, particleSystem) {
    if (this.fireTimer > 0) return false;
    if (this.isReloading) return false;

    const w = this.getCurrentWeapon();

    if (w.magSize !== Infinity && w.currentAmmo <= 0) {
      this.startReload();
      return false;
    }

    // Descontar munición
    if (w.magSize !== Infinity) {
      w.currentAmmo--;
    }

    this.fireTimer = w.fireRate;

    // Calcular ángulo base
    const baseAngle = Math.atan2(targetY - originY, targetX - originX);

    // Reproducir sonido adecuado
    if (w.sound === 'standard') sound.playShootStandard();
    else if (w.sound === 'plasma') sound.playShootPlasma();
    else if (w.sound === 'shotgun') sound.playShootShotgun();
    else if (w.sound === 'laser') sound.playShootLaser();
    else if (w.sound === 'explosion') sound.playExplosion();

    // Crear proyectiles según el arma
    for (let i = 0; i < w.bulletsPerShot; i++) {
      const spread = (Math.random() - 0.5) * w.spread;
      const angle = baseAngle + spread;
      const vx = Math.cos(angle) * w.bulletSpeed;
      const vy = Math.sin(angle) * w.bulletSpeed;

      this.projectiles.push(new Projectile({
        x: originX,
        y: originY,
        vx,
        vy,
        damage: w.damage,
        color: w.color,
        source: 'player',
        penetration: w.penetration || 1,
        isRocket: w.isRocket || false,
        blastRadius: w.blastRadius || 0,
        radius: w.isRocket ? 5 : (w.bulletsPerShot > 1 ? 2.5 : 3.5)
      }));
    }

    // Efectos de partículas en cañón
    if (particleSystem) {
      particleSystem.createMuzzleFlash(originX, originY, baseAngle, w.color);
      particleSystem.createCasing(originX, originY, Math.cos(baseAngle) > 0 ? 1 : -1);
    }

    this.updateHUD();

    // Auto-recarga si el cargador se vacía
    if (w.magSize !== Infinity && w.currentAmmo === 0 && w.reserveAmmo > 0) {
      this.startReload();
    }

    return true;
  }

  addAmmo(weaponId, amount) {
    const w = this.weapons.find(x => x.id === weaponId);
    if (w && w.reserveAmmo !== Infinity) {
      w.reserveAmmo += amount;
      this.updateHUD();
      return true;
    }
    return false;
  }

  unlockWeapon(weaponId) {
    const w = this.weapons.find(x => x.id === weaponId);
    if (w) {
      const wasLocked = !w.isUnlocked;
      w.isUnlocked = true;
      if (wasLocked) {
        w.currentAmmo = w.magSize;
        w.reserveAmmo = w.magSize === Infinity ? Infinity : w.magSize * 3;
      }
      const idx = this.weapons.indexOf(w);
      this.selectWeapon(idx);
      this.initDOMSlots();
      this.updateHUD();
      return w;
    }
    return null;
  }

  initDOMSlots() {
    const grid = document.getElementById('weapon-slots');
    if (!grid) return;
    grid.innerHTML = '';

    this.weapons.forEach((w, index) => {
      const slot = document.createElement('div');
      slot.className = `weapon-slot ${index === this.currentIndex ? 'active' : ''} ${!w.isUnlocked ? 'locked' : ''}`;
      slot.id = `weapon-slot-${w.id}`;
      slot.title = w.isUnlocked ? w.name : 'Bloqueada - Busca la caja de armamento';
      slot.innerHTML = `
        <span class="slot-num">${w.id}</span>
        <span class="slot-icon">${w.isUnlocked ? w.icon : '🔒'}</span>
      `;
      slot.addEventListener('click', () => {
        if (w.isUnlocked) {
          this.selectWeapon(index);
        }
      });
      grid.appendChild(slot);
    });
  }

  updateHUD() {
    const w = this.getCurrentWeapon();
    const nameEl = document.getElementById('weapon-name');
    const ammoEl = document.getElementById('ammo-status');

    if (nameEl) nameEl.textContent = w.name;
    if (ammoEl) {
      if (w.magSize === Infinity) {
        ammoEl.textContent = '∞ / ∞';
      } else {
        ammoEl.textContent = `${w.currentAmmo} / ${w.reserveAmmo}`;
      }
    }

    // Actualizar ranuras activas y bloqueadas
    this.weapons.forEach((item, index) => {
      const el = document.getElementById(`weapon-slot-${item.id}`);
      if (el) {
        if (item.isUnlocked) {
          el.classList.remove('locked');
          const iconEl = el.querySelector('.slot-icon');
          if (iconEl && iconEl.textContent === '🔒') iconEl.textContent = item.icon;
          if (index === this.currentIndex) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        } else {
          el.classList.add('locked');
          el.classList.remove('active');
          const iconEl = el.querySelector('.slot-icon');
          if (iconEl) iconEl.textContent = '🔒';
        }
      }
    });
  }

  reset() {
    this.weapons = WEAPON_TYPES.map(w => ({ ...w }));
    this.currentIndex = 0;
    this.fireTimer = 0;
    this.isReloading = false;
    this.projectiles = [];
    const reloadBar = document.getElementById('reload-bar');
    if (reloadBar) reloadBar.style.width = '0%';
    this.initDOMSlots();
    this.updateHUD();
  }
}
