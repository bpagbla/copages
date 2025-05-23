import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, QuillModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit, OnDestroy {
  public editorContent: string = '';
  public quillModules: any = {
    toolbar: {
      container: [
        [{ header: '1' }, { header: '2' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['bold', 'italic', 'underline'],
        [{ align: [] }],
        ['link'],
      ],
    },
  };

  private autoSaveInterval: any;

ngOnInit(): void {
  const saved = localStorage.getItem('copages-draft');
  if (saved && saved !== 'null') {
    this.editorContent = saved;
  } else {
    this.editorContent = ''; // Asegúrate de que está vacío si no hay nada válido
  }

  this.autoSaveInterval = setInterval(() => {
    localStorage.setItem('copages-draft', this.editorContent || '');
    console.log('Guardado automático');
  }, 5000);
}

  ngOnDestroy(): void {
    clearInterval(this.autoSaveInterval);
  }

  decodeHtml(html: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  }

  get wordCount(): number {
    if (!this.editorContent) return 0;

    // Decodifica entidades HTML (como el codigo para los espacios)
    const decoded = this.decodeHtml(this.editorContent);
    // Elimina etiquetas HTML
    const text = decoded
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text ? text.split(' ').length : 0;
  }

  get charCount(): number {
    if (!this.editorContent) return 0;

    const decoded = this.decodeHtml(this.editorContent);
    const text = decoded.replace(/<[^>]*>/g, '');
    return text.replace(/\s/g, '').length;
  }
}
