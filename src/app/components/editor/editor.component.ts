import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { StorageService } from '../../services/storageService/storage.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, QuillModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit, OnDestroy {
  // Input y Output para binding externo
  @Input() content: string = '';
  @Output() contentChange = new EventEmitter<string>();
  internalContent: string = '';
  constructor(private storageService: StorageService) {}

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

  // Getter/setter para emitir cambios hacia fuera y reflejar cambios internos
  get editorContent(): string {
    return this.content;
  }
  set editorContent(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }

  ngOnInit(): void {
    this.internalContent = this.content;
    const saved = this.storageService.getItem('copages-draft');
    if (saved && saved !== 'null') {
      this.editorContent = saved;
    } else {
      this.editorContent = '';
    }

    /*     this.autoSaveInterval = setInterval(() => {
      localStorage.setItem('copages-draft', this.editorContent || '');
      // console.log('Guardado automático');
    }, 5000); */
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
    const decoded = this.decodeHtml(this.editorContent);
    const text = decoded
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text ? text.split(' ').length : 0;
  }

  onContentChanged(event: any) {
    this.internalContent = event.html;
    this.contentChange.emit(this.internalContent);
  }

  get charCount(): number {
    if (!this.editorContent) return 0;
    const decoded = this.decodeHtml(this.editorContent);
    const text = decoded.replace(/<[^>]*>/g, '');
    return text.replace(/\s/g, '').length;
  }
}
