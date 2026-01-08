import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modalEvent = new Subject<boolean>();
  modalEvent$ = this.modalEvent.asObservable();

  abrirModal(): void {
    this.modalEvent.next(true);
  }

  cerrarModal(): void {
    this.modalEvent.next(false);
  }

}
