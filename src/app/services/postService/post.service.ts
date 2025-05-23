import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../../interfaces/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor() {}

  private http = inject(HttpClient);
  private apiUrl = '/api/posts';

  getFeed(): Observable<Post[]> {
    const accessToken = localStorage.getItem('accessToken');

    return this.http.get<Post[]>('http://localhost:3000/posts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
