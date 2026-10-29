/**
 * MAIN.JS - PUNTO DE ENTRADA CLIENTE
 * Instancia el motor de juego y prepara los manejadores globales del DOM.
 */

import { GameEngine } from './game.js?v=5';

window.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine('gameCanvas');
  engine.start();

  // Exponer a nivel de ventana para debugging e inspección
  window.gameEngine = engine;
  console.log('[Cyber Commando 2D] Motor inicializado con éxito. Listo para despliegue táctico.');
});
