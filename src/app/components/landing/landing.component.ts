import { Component, OnInit } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-landing',
  imports: [NgIcon],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})


export class LandingComponent implements OnInit {
  texts: string[] = ['Co-escribe', 'Co-lee', 'Co-pages'];
  currentText = '';
  index = 0;
  firstRunFinished = false;
  fading = false;

  ngOnInit(): void {
    this.runInitialAnimation();
  }

  runInitialAnimation() {
  this.currentText = this.texts[this.index]; // Mostrar texto inmediatamente
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
        animateNext();  // llamada recursiva para siguiente texto
      });
    }, 1500);  // espera 1.5s antes de hacer fade
  };

  animateNext();
}

  fadeText(callback: () => void) {
    this.fading = true;
    setTimeout(() => {
      callback();
      this.fading = false;
    }, 500); // Duración de la animación CSS
  }

}

