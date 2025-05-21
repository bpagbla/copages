import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  imports: [],
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
    const interval = setInterval(() => {
      this.fadeText(() => {
        this.currentText = this.texts[this.index];
        this.index++;
        if (this.index >= this.texts.length) {
          clearInterval(interval);
          this.firstRunFinished = true;
        }
      });
    }, 2000);
  }

  fadeText(callback: () => void) {
    this.fading = true;
    setTimeout(() => {
      callback();
      this.fading = false;
    }, 500); // Duración de la animación CSS
  }

  onHover() {
    if (this.firstRunFinished) {
      this.index = (this.index + 1) % this.texts.length;
      this.fadeText(() => {
        this.currentText = this.texts[this.index];
      });
    }
  }
}

