import { Component } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-roots',
  standalone: true,
  imports: [
    CommonModule, 
    DragDropModule,
    DialogModule, 
    ButtonModule, 
    InputTextModule
  ],
  templateUrl: './roots.component.html',
  styleUrls: ['./roots.component.css'],
})
export class RootsComponent {
  targetWord = 'HELLO'; // الكلمة المستهدفة
  letters = this.targetWord.split(''); // تقسيم الكلمة إلى حروف
  currentWord: string[] = []; // الحروف التي تم سحبها

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.checkWord();
  }
  

  visible: boolean = false;

  checkWord() {
    if (this.currentWord.join('') === this.targetWord) {
      /*Swal.fire({
        title: 'تهانينا!',
        text: 'لقد قمت بتشكيل الكلمة: ' + this.targetWord,
        icon: 'success',
        confirmButtonText: 'موافق'
      });
      */
    
      this.visible = true;
    
    }
  }
  
}
