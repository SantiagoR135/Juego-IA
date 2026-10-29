/**
 * PARTICLES.JS - SISTEMA DE PARTÍCULAS PROCEDURALES DE ALTO RENDIMIENTO
 * Administra chispas de impacto, estelas de plasma, humo de propulsores y explosiones.
 */

export class Particle {
  constructor(x, y, vx, vy, color, size, life, decay, type = 'spark') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.initialSize = size;
    this.life = life;
    this.maxLife = life;
    this.decay = decay;
    this.type = type; // 'spark', 'smoke', 'plasma', 'casing', 'debris'
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 10;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.type === 'casing' || this.type === 'debris') {
      this.vy += 900 * dt; // Gravedad
      this.rotation += this.vRot * dt;
    } else if (this.type === 'smoke') {
      this.vy -= 20 * dt; // Flota hacia arriba
      this.vx *= 0.95;
    } else if (this.type === 'spark') {
      this.vx *= 0.92;
      this.vy *= 0.92;
      this.vy += 300 * dt;
    }

    this.life -= this.decay * dt;
    if (this.type !== 'casing') {
      this.size = this.initialSize * (this.life / this.maxLife);
    }
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const alpha = Math.max(0, Math.min(1, this.life / this.maxLife));

    ctx.save();
    ctx.globalAlpha = alpha;

    if (this.type === 'casing') {
      // Casquillo de bala dorado/bronce girando
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-3, -1, 6, 2);
    } else if (this.type === 'smoke') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(1, this.size), 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Chispas brillantes con resplandor neón
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export class FloatingText {
  constructor(x, y, text, color = '#00f0ff', duration = 0.8) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.duration = duration;
    this.elapsed = 0;
  }

  update(dt) {
    this.elapsed += dt;
    this.y -= 35 * dt;
  }

  draw(ctx) {
    const alpha = 1 - (this.elapsed / this.duration);
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px "Orbitron", sans-serif';
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.update(dt);
      if (ft.elapsed >= ft.duration) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
    for (const ft of this.floatingTexts) {
      ft.draw(ctx);
    }
  }

  addFloatingText(x, y, text, color = '#00f0ff') {
    this.floatingTexts.push(new FloatingText(x, y, text, color));
  }

  // Chispas de impacto de bala contra superficies o blindaje
  createHitSparks(x, y, normalAngle, color = '#00f0ff', count = 8) {
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 1.6;
      const angle = normalAngle + Math.PI + spread;
      const speed = 100 + Math.random() * 250;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 2.5;
      const life = 0.2 + Math.random() * 0.25;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 1, 'spark'));
    }
  }

  // Sangre sintética / chispas cibernéticas al herir a un objetivo
  createFleshHit(x, y, color = '#00f0ff', count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 1.5 + Math.random() * 2;
      const life = 0.25 + Math.random() * 0.25;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 1, 'spark'));
    }
  }

  // Casquillos expulsados por el arma
  createCasing(x, y, dirX) {
    const vx = -dirX * (60 + Math.random() * 80) + (Math.random() - 0.5) * 40;
    const vy = -120 - Math.random() * 100;
    this.particles.push(new Particle(x, y, vx, vy, '#ffcc00', 3, 0.8, 1, 'casing'));
  }

  // Humo y llamarada del cañón (Muzzle Flash)
  createMuzzleFlash(x, y, angle, color = '#00f0ff') {
    for (let i = 0; i < 4; i++) {
      const spd = 60 + Math.random() * 120;
      const spread = (Math.random() - 0.5) * 0.5;
      const vx = Math.cos(angle + spread) * spd;
      const vy = Math.sin(angle + spread) * spd;
      this.particles.push(new Particle(x, y, vx, vy, color, 3, 0.12, 1, 'spark'));
    }
  }

  // Explosión cinematográfica
  createExplosion(x, y, radius = 40, color = '#ff6600') {
    // Chispas rápidas
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 320;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 4;
      const life = 0.3 + Math.random() * 0.4;
      const sparkColor = Math.random() > 0.5 ? color : '#ffff33';
      this.particles.push(new Particle(x, y, vx, vy, sparkColor, size, life, 1, 'spark'));
    }
    // Humo denso
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 8 + Math.random() * 14;
      const life = 0.5 + Math.random() * 0.5;
      this.particles.push(new Particle(x, y, vx, vy, 'rgba(50, 50, 60, 0.6)', size, life, 1, 'smoke'));
    }
  }

  // Impulso de salto / propulsores cibernéticos en botas
  createThrusterPuff(x, y) {
    for (let i = 0; i < 5; i++) {
      const vx = (Math.random() - 0.5) * 60;
      const vy = 80 + Math.random() * 120;
      this.particles.push(new Particle(x, y, vx, vy, '#00f0ff', 3, 0.2, 1, 'spark'));
    }
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}
