import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { Post } from '../../interfaces/post';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  imports: [NgIf, CommonModule],
})
export class PostComponent {
  @Input() post!: Post;
  @Input() showDescripcion = true;
  @Input() showAuthor = true;
  @Input() showDate = true;
  @Input() showTituloCap = true;
  @Input() showOrdenCap = true;
}
