/**
 * PLAYER.JS - COMANDO CIBERNÉTICO JUGABLE
 * Control de física, colisiones de plataformas, animación procedural y salud.
 */

import { sound } from './audio.js?v=3';
import { spriteRenderer } from './sprites.js?v=3';

export class Player {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.w = 34;
    this.h = 62;
    this.normalH = 62;
    this.crouchH = 40;

    // Físicas
    this.vx = 0;
    this.vy = 0;
    this.speed = 340;
    this.crouchSpeed = 160;
    this.accel = 2400;
    this.friction = 2000;
    this.gravity = 1500;
    this.jumpForce = -640;
    this.jumpCut = 0.5;

    // Estados
    this.isGrounded = false;
    this.isCrouching = false;
    this.facing = 1; // 1 = derecha, -1 = izquierda
    this.aimAngle = 0;
    this.canDoubleJump = true;
    this.dropThroughTimer = 0; // para bajar de plataformas atravesables con 'S'

    // Atributos de combate
    this.health = 100;
    this.maxHealth = 100;
    this.lives = 3;
    this.invulnerableTimer = 0;
    this.isDead = false;

    // Animación procedural
    this.walkAnimTimer = 0;
    this.thrusterCooldown = 0;

    this.updateHUD();
  }

  reset(fullReset = false) {
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.isDead = false;
    this.health = this.maxHealth;
    this.invulnerableTimer = 1.0;

    if (fullReset) {
      this.lives = 3;
    }

    this.updateHUD();
  }

  handleInputs(keys, mouse, dt, particleSystem) {
    if (this.isDead) return;

    // Apuntado del cursor 360°
    const centerX = this.x + this.w / 2;
    const centerY = this.y + this.h / 2;
    this.aimAngle = Math.atan2(mouse.worldY - centerY, mouse.worldX - centerX);
    this.facing = mouse.worldX >= centerX ? 1 : -1;

    // Agacharse (S o Flecha Abajo)
    const crouchKey = keys['KeyS'] || keys['ArrowDown'];
    if (crouchKey) {
      if (!this.isCrouching) {
        this.isCrouching = true;
        this.y += (this.normalH - this.crouchH);
        this.h = this.crouchH;
      }
    } else if (this.isCrouching) {
      this.isCrouching = false;
      this.y -= (this.normalH - this.crouchH);
      this.h = this.normalH;
    }

    // Bajar de plataformas 'oneway' presionando S + Salto o dos veces S
    if (crouchKey && (keys['KeyW'] || keys['Space'] || keys['ArrowUp'])) {
      this.dropThroughTimer = 0.3;
    }
    if (this.dropThroughTimer > 0) {
      this.dropThroughTimer -= dt;
    }

    // Movimiento Horizontal (A/D o Flechas)
    let moveDir = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) moveDir -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveDir += 1;

    const currentMaxSpeed = this.isCrouching ? this.crouchSpeed : this.speed;

    if (moveDir !== 0) {
      this.vx += moveDir * this.accel * dt;
      if (Math.abs(this.vx) > currentMaxSpeed) {
        this.vx = Math.sign(this.vx) * currentMaxSpeed;
      }
      this.walkAnimTimer += dt * 12;
    } else {
      // Fricción en el suelo o resistencia en aire
      const drag = this.isGrounded ? this.friction : this.friction * 0.35;
      if (Math.abs(this.vx) <= drag * dt) {
        this.vx = 0;
      } else {
        this.vx -= Math.sign(this.vx) * drag * dt;
      }
      this.walkAnimTimer = 0;
    }

    // Salto e Impulso (W, Espacio o Flecha Arriba)
    const jumpPressed = keys['KeyW'] || keys['Space'] || keys['ArrowUp'];
    if (jumpPressed) {
      if (this.isGrounded && !this.jumpConsumed) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.jumpConsumed = true;
        this.canDoubleJump = true;
        if (particleSystem) {
          particleSystem.createThrusterPuff(this.x + this.w / 2, this.y + this.h);
        }
      } else if (!this.isGrounded && this.canDoubleJump && !this.jumpConsumed) {
        // Doble salto con propulsores cibernéticos
        this.vy = this.jumpForce * 0.9;
        this.canDoubleJump = false;
        this.jumpConsumed = true;
        if (particleSystem) {
          particleSystem.createThrusterPuff(this.x + this.w / 2, this.y + this.h);
          particleSystem.createThrusterPuff(this.x + this.w / 2, this.y + this.h);
        }
      }
    } else {
      this.jumpConsumed = false;
      // Salto variable: si suelta la tecla temprano, corta el ascenso
      if (this.vy < 0) {
        this.vy *= this.jumpCut;
      }
    }
  }

  update(dt, platforms, particleSystem) {
    if (this.isDead) return;

    // Temporizador de invulnerabilidad tras recibir daño
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Gravedad
    this.vy += this.gravity * dt;
    if (this.vy > 1200) this.vy = 1200;

    // Movimiento y colisión horizontal
    this.x += this.vx * dt;
    this.checkHorizontalCollisions(platforms);

    // Movimiento y colisión vertical
    const prevY = this.y;
    this.y += this.vy * dt;
    this.isGrounded = false;
    this.checkVerticalCollisions(platforms, prevY);
  }

  checkHorizontalCollisions(platforms) {
    for (const plat of platforms) {
      if (plat.type !== 'solid') continue;

      if (
        this.x < plat.x + plat.w &&
        this.x + this.w > plat.x &&
        this.y < plat.y + plat.h &&
        this.y + this.h > plat.y
      ) {
        if (this.vx > 0) {
          this.x = plat.x - this.w;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = plat.x + plat.w;
          this.vx = 0;
        }
      }
    }
  }

  checkVerticalCollisions(platforms, prevY) {
    for (const plat of platforms) {
      if (
        this.x + this.w > plat.x &&
        this.x < plat.x + plat.w
      ) {
        if (plat.type === 'solid') {
          if (
            this.y < plat.y + plat.h &&
            this.y + this.h > plat.y
          ) {
            if (this.vy > 0) {
              this.y = plat.y - this.h;
              this.vy = 0;
              this.isGrounded = true;
              this.canDoubleJump = true;
            } else if (this.vy < 0) {
              this.y = plat.y + plat.h;
              this.vy = 0;
            }
          }
        } else if (plat.type === 'oneway' && this.dropThroughTimer <= 0) {
          // Plataforma atravesable desde abajo
          const prevBottom = prevY + this.h;
          const currentBottom = this.y + this.h;

          if (this.vy >= 0 && prevBottom <= plat.y + 4 && currentBottom >= plat.y) {
            this.y = plat.y - this.h;
            this.vy = 0;
            this.isGrounded = true;
            this.canDoubleJump = true;
          }
        }
      }
    }
  }

  takeDamage(amount, particleSystem) {
    if (this.isDead || this.invulnerableTimer > 0) return false;

    this.health -= amount;
    this.invulnerableTimer = 0.8;
    sound.playHit();

    if (particleSystem) {
      particleSystem.createFleshHit(this.x + this.w / 2, this.y + this.h / 2, '#ff1a40', 10);
      particleSystem.addFloatingText(this.x + this.w / 2, this.y - 10, `-${amount}`, '#ff1a40');
    }

    if (this.health <= 0) {
      this.health = 0;
      this.handleDeath(particleSystem);
    }

    this.updateHUD();
    return true;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.updateHUD();
  }

  handleDeath(particleSystem) {
    this.lives--;
    if (particleSystem) {
      particleSystem.createExplosion(this.x + this.w / 2, this.y + this.h / 2, 50, '#ff1a40');
    }

    if (this.lives <= 0) {
      this.isDead = true;
    } else {
      // Reaparición táctica
      this.health = this.maxHealth;
      this.x = Math.max(100, this.x - 300);
      this.y = 200;
      this.vx = 0;
      this.vy = 0;
      this.invulnerableTimer = 2.0;
      sound.playExtraLife();
    }
    this.updateHUD();
  }

  updateHUD() {
    // Barra de salud
    const healthBar = document.getElementById('health-bar');
    const healthText = document.getElementById('health-text');
    if (healthBar) {
      const pct = (this.health / this.maxHealth) * 100;
      healthBar.style.width = `${pct}%`;
      if (pct <= 25) {
        healthBar.style.backgroundColor = '#ff1a40';
      } else if (pct <= 50) {
        healthBar.style.backgroundColor = '#ffaa00';
      } else {
        healthBar.style.backgroundColor = '#00f0ff';
      }
    }
    if (healthText) {
      healthText.textContent = `${Math.ceil(this.health)} / ${this.maxHealth}`;
    }

    // Vidas activas en el HUD
    const livesDisplay = document.getElementById('lives-display');
    if (livesDisplay) {
      livesDisplay.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const node = document.createElement('span');
        node.className = `life-node ${i < this.lives ? 'active' : ''}`;
        node.textContent = '▲';
        livesDisplay.appendChild(node);
      }
    }
  }

  // Renderizado Pixel Art 16-bit del comando cibernético
  draw(ctx) {
    if (this.isDead) return;

    // Parpadeo durante invulnerabilidad
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    spriteRenderer.drawPlayer(ctx, this);
  }
}
