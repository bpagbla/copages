export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title: string;
}