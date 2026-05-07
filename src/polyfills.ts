import { Buffer } from 'buffer';
import * as process from 'process';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
  (window as any).global = window;
  
  if (!(window as any).process.env) {
    (window as any).process.env = {};
  }
}
