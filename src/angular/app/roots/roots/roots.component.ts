import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DragDropModule } from 'primeng/dragdrop';


@Component({
  selector: 'app-roots',
  standalone: true,
  imports: [
    CommonModule, 
    DragDropModule,
    DialogModule, 
    ButtonModule, 
    InputTextModule,
    CardModule
  ],
  styles: [
    `:host ::ng-deep {
        [pDraggable] {
            cursor: move;
        }
    }`
],
  templateUrl: './roots.component.html',
  styleUrls: ['./roots.component.css'],
})

export class RootsComponent implements OnInit {

  flag = true;
  display: boolean = false;

  showInstructions() {
    this.display = true; // يظهر الحوار
  }

  hideInstructions() {
    this.display = false; // يخفي الحوار
  }

  setflag (){
    this.flag=!this.flag
  }


  
  points: number = 0;  // النقاط
  time: string = '00:00';  // الوقت الافتراضي
//   targetWord = 'HELLO'; // الكلمة المستهدفة
//   letters = this.targetWord.split(''); // تقسيم الكلمة إلى حروف
//   currentWord: string[] = []; // الحروف التي تم سحبها

//   drop(event: CdkDragDrop<string[]>) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex,
//       );
//     }
//     this.checkWord();
//   }
  

//   visible: boolean = false;

//   checkWord() {
//     if (this.currentWord.join('') === this.targetWord) {
//       /*Swal.fire({
//         title: 'تهانينا!',
//         text: 'لقد قمت بتشكيل الكلمة: ' + this.targetWord,
//         icon: 'success',
//         confirmButtonText: 'موافق'
//       });
//       */
    
//       this.visible = true;
    
//     }
//   }
  
// }

availableLetters: string[] | undefined;

selectedLetters: string[] | undefined;

draggedProduct: string | undefined | null;

originalWord = "مستشفى"
targetWord = 'شفى';


ngOnInit() {
    this.selectedLetters = [];
    this.availableLetters = this.targetWord.split('') 
    // this.availableLetters = this.availableLetters
}

dragStart(word: string) {
    this.draggedProduct = word;
}

drop() {
    if (this.draggedProduct) {
        let draggedProductIndex = this.findIndex(this.draggedProduct);
        this.selectedLetters = [...(this.selectedLetters as string[]), this.draggedProduct];
        this.availableLetters = this.availableLetters?.filter((val, i) => i != draggedProductIndex);
        this.draggedProduct = null;
    }
}

dragEnd() {
    this.draggedProduct = null;
}

findIndex(word: string) {
    let index = -1;
    for (let i = 0; i < (this.availableLetters as string[]).length; i++) {
        if (word === (this.availableLetters as string[])[i]) {
            index = i;
            break;
        }
    }
    return index;
}
}