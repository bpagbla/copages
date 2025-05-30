import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapBlockquoteLeft,
  bootstrapBook,
  bootstrapMailbox,
  bootstrapMailboxFlag,
  bootstrapPersonFill,
  bootstrapPersonFillGear,
  bootstrapPower,
  bootstrapHouseHeart,
  bootstrapArrowDown,
  bootstrapEnvelopePaperHeart,
  bootstrapPencil,
  bootstrapShare,
  bootstrapTools,
  bootstrapList,
  bootstrapSave,
  bootstrapTrash,
  bootstrapSearch,
  bootstrapBookmarkX,
  bootstrapBookmarkPlus,
  bootstrapCompass,
} from '@ng-icons/bootstrap-icons';

import { provideQuillConfig } from 'ngx-quill/config';
import { authInterceptor } from './interceptors/auth.interceptor';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code-block'],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    [{ direction: 'rtl' }], // text direction

    [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ['clean'], // remove formatting button

    ['link', 'image', 'video'], // link and image, video
  ],
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideQuillConfig({
      modules,
    }),
    provideIcons({
      bootstrapBlockquoteLeft,
      bootstrapBook,
      bootstrapMailbox,
      bootstrapMailboxFlag,
      bootstrapPersonFill,
      bootstrapPersonFillGear,
      bootstrapPower,
      bootstrapHouseHeart,
      bootstrapArrowDown,
      bootstrapEnvelopePaperHeart,
      bootstrapPencil,
      bootstrapShare,
      bootstrapTools,
      bootstrapList,
      bootstrapSave,
      bootstrapTrash,
      bootstrapSearch,
      bootstrapBookmarkX,
      bootstrapBookmarkPlus,
      bootstrapCompass,
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
