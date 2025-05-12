import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, QuillModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {
  public editorContent: string = '';
  public quillModules: any = {
    toolbar: {
      container: [
        [{ header: '1' }, { header: '2' }, { font: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['bold', 'italic', 'underline'],
        [{ align: [] }],
        ['link']
      ]
    }
  };

  private autoSaveInterval: any;

  ngOnInit(): void {
    const saved = localStorage.getItem('copages-draft');
    if (saved) {
      this.editorContent = saved;
    }

    // Guardado automático cada 5 segundos
    this.autoSaveInterval = setInterval(() => {
      localStorage.setItem('copages-draft', this.editorContent);
      console.log('✍️ Guardado automático');
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSaveInterval);
  }

  get wordCount(): number {
    if (!this.editorContent) return 0;
    return this.editorContent.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length;
  }
  
  get charCount(): number {
    if (!this.editorContent) return 0;
    return this.editorContent.replace(/<[^>]+>/g, '').replace(/\s/g, '').length;
  }
}
