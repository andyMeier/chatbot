import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogCommunicationService {
  private dialogResponseSubject = new Subject<string>();

  dialogResponse$ = this.dialogResponseSubject.asObservable();

  sendResponse(response: string) {
    this.dialogResponseSubject.next(response);
  }
}