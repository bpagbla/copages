import { Component, OnInit } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

/**
 * Componente de bienvenida (landing page) de la aplicación.
 * 
 * Muestra una animación de presentación con los textos "Co-escribe", "Co-lee" y "Co-pages",
 * simulando una transición tipo fade entre ellos.
 */
@Component({
  selector: 'app-landing',
  imports: [NgIcon],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  /**
   * Lista de textos a mostrar en la animación inicial.
   */
  texts: string[] = ['Co-escribe', 'Co-lee', 'Co-pages'];

  /**
   * Texto actualmente visible.
   */
  currentText = '';

  /**
   * Índice del texto actual en el array `texts`.
   */
  index = 0;

  /**
   * Indica si ya se ha completado la primera pasada de la animación.
   */
  firstRunFinished = false;

  /**
   * Bandera para controlar el efecto de desvanecimiento (`fade`) en la animación.
   */
  fading = false;

  /**
   * Inicializa la animación al cargar el componente.
   */
  ngOnInit(): void {
    this.runInitialAnimation();
  }

  /**
   * Ejecuta la secuencia inicial de animaciones de texto con transición.
   * Muestra uno a uno los textos definidos en `texts` con una animación tipo fade.
   */
  runInitialAnimation(): void {
    this.currentText = this.texts[this.index];
    this.index++;

    const animateNext = () => {
      if (this.index >= this.texts.length) {
        this.firstRunFinished = true;
        return;
      }

      setTimeout(() => {
        this.fadeText(() => {
          this.currentText = this.texts[this.index];
          this.index++;
          animateNext(); // continúa con el siguiente texto
        });
      }, 1500);
    };

    animateNext();
  }

  /**
   * Controla el efecto de desvanecimiento antes de mostrar el siguiente texto.
   * 
   * @param callback Función a ejecutar después de completar el fade.
   */
  fadeText(callback: () => void): void {
    this.fading = true;
    setTimeout(() => {
      callback();
      this.fading = false;
    }, 500);
  }
}
