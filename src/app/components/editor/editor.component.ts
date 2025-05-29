import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, QuillModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
  @Input() content: string = '';
  @Output() contentChange = new EventEmitter<string>();
  internalContent: string = '';

  constructor() {}

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

  get editorContent(): string {
    return this.content;
  }

  set editorContent(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }

  ngOnInit(): void {
    this.editorContent = this.content;
    this.internalContent = this.content;
  }

  onContentChanged(newContent: string) {
    this.internalContent = newContent;
    this.contentChange.emit(newContent);
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

  get charCount(): number {
    if (!this.editorContent) return 0;
    const decoded = this.decodeHtml(this.editorContent);
    const text = decoded.replace(/<[^>]*>/g, '');
    return text.replace(/\s/g, '').length;
  }
}
