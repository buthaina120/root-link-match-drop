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
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { Howl } from 'howler';


export interface Card {
  originalWord: string;
  targetWord: string;
}

export interface CardState {
  availableLetters: string[];
  selectedLetters: string[];
  points: number;
  isCardSolved: boolean; // متغير جديد لتتبع حالة حل البطاقة
}

@Component({
  selector: 'app-roots',
  standalone: true,
  imports: [
    CommonModule, 
    DragDropModule,
    DialogModule, 
    ButtonModule, 
    InputTextModule,
    CardModule,
    TooltipModule,
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

  constructor(private rest: ApiService) {
  }
  root: string | undefined;
  
  async getRoot(query: string): Promise<string> {
    return await firstValueFrom(this.rest.getRoot(query));
  }
 
 
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

  successSound = new Howl({
    src: ['../../../angular/assets/correct.wav'],
  });

  failureSound = new Howl({
    src: ['../../../angular/assets/wrong.mp3'],
  });

  hintSound = new Howl({
    src: ['../../../angular/assets/hint.mp3'],
  });

  clickSound = new Howl({
    src: ['../../../angular/assets/click.mp3'],
  });

  warningSound = new Howl({
    src: ['../../../angular/assets/ticktick.mp3'],
  });
  
  
  points: number = 0;  // النقاط
  cardPoints: number[] = []; // لتخزين النقاط لكل بطاقة
  time: number = 60; // الوقت بالثواني
  timerInterval: any;
  timeWhenWon: number = 0; // لتخزين الوقت عند الفوز
  isDialogVisible: boolean = false; // لإظهار الحوار
  isWinDialogVisible: boolean = false; // حوار الفوز
  isCorrectAnimation: boolean = false; // متغير للتحكم في عرض الأنميشن
  isFailureAnimation: boolean = false; // متغير للتحكم في عرض الأنميشن
  hintUsed: boolean = false; // متغير لتتبع استخدام الهنت
  cardStates: CardState[] = [];
  availableLetters: string[] = [];
  selectedLetters: string[] = [];
  draggedProduct: string | undefined | null;
  correctAnswerLetters: string[] = []; // تعريف مصفوفة الحروف الصحيحة
  starsCount: number = 0; // عدد النجوم
  stars: number[] = [1, 2, 3]; // عدد النجوم الممكنة (مثلاً، 3 نجوم)
  currentIndex: number = 0;

  // استخدام الواجهة هنا
  cards: Card[] = [
    { originalWord: "مستشفى", targetWord: "شفى" },
    { originalWord: "كتاب", targetWord: "كتب" },
    { originalWord: "مدرسة", targetWord: "درس" },
  ];

  ngOnInit() {
    
    this.cardStates = this.cards.map(() => ({
      availableLetters: [],
      selectedLetters: [],
      points: 0,
      isCardSolved: false // تعيين القيمة المبدئية

    }));
    this.resetGame();
    /*
    this.getRoot('مستشفى').then((root) => {
      this.root = root;
    });*/
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval); // إيقاف المؤقت عند تدمير المكون
  }

  startTimer() {
    this.time = 60; // تعيين الوقت إلى 60 ثانية عند بدء اللعبة
    clearInterval(this.timerInterval); // تأكد من إيقاف المؤقت القديم إذا كان موجودًا
    
    // بدء العد التنازلي
    this.timerInterval = setInterval(() => {
        if (!this.isWinDialogVisible) { // تحقق من عدم ظهور ديلوق الفوز
            this.time--; // تقليل الوقت بمقدار ثانية واحدة
                // تشغيل صوت التحذير عند تبقي 10 ثوانٍ
            if (this.time === 10) {
              this.warningSound.play();
            }
            if (this.time <= 0) {
              this.isDialogVisible = true; // عرض الحوار عند انتهاء الوقت
            }
        }
    }, 1000); // تعيين الفاصل الزمني إلى 1000 مللي ثانية (1 ثانية)
}


  get currentCard(): Card {
    return this.cards[this.currentIndex];
  }

resetGame() {
  // إعادة تعيين الحروف المختارة
  this.selectedLetters = []; 

  // إعادة تعيين حالة كل بطاقة
  this.cardStates = this.cards.map(() => ({
    availableLetters: [],
    selectedLetters: [],
    points: 0,
    isCardSolved: false // تعيين القيمة المبدئية

  }));

  // إعادة تعيين الفهرس إلى البطاقة الأولى
  this.currentIndex = 0;

  // تحميل حالة البطاقة الأولى
  this.loadCardState();

  // توليد الحروف المتاحة
  this.generateAvailableLetters();

  // بدء المؤقت
  this.startTimer();

  this.hintUsed = false;

  this.isDialogVisible = false;
}



loadCardState() {
  const state = this.cardStates[this.currentIndex];

  // تعيين الحروف الصحيحة هنا
  this.correctAnswerLetters = this.currentCard.targetWord.split(''); // تحديث الحروف الصحيحة

  // إذا تم حل البطاقة، اجعل الحروف المتاحة فارغة
  if (state.isCardSolved) {
      this.availableLetters = [];
  } else {
      // تحقق إذا كانت الحروف المتاحة موجودة
      if (state.availableLetters.length === 0) {
          let letters = this.currentCard.targetWord.split('');
          const randomLetters = this.generateRandomLetters(3);
          letters = [...letters, ...randomLetters];
          letters.sort(() => Math.random() - 0.5);
          state.availableLetters = [...letters];
      }
      this.availableLetters = [...state.availableLetters]; // استخدام الحروف المتاحة من الحالة
  }

  this.selectedLetters = [...state.selectedLetters];
  if (this.selectedLetters.length > 0) {
      this.availableLetters = this.availableLetters.filter(
          letter => !this.selectedLetters.includes(letter)
      );
  }
}

  
  generateAvailableLetters() {
    const state = this.cardStates[this.currentIndex];
    
    // تحقق إذا كانت الحروف العشوائية محفوظة سابقًا
    if (state.availableLetters.length > 0) {
      this.availableLetters = [...state.availableLetters];
    } else {
      // تقسيم حروف الكلمة الهدف
      let letters = this.currentCard.targetWord.split('');
      
      // توليد حروف عشوائية وإضافتها
      const randomLetters = this.generateRandomLetters(3); // عدد الحروف العشوائية
      letters = [...letters, ...randomLetters];
      letters.sort(() => Math.random() - 0.5); // خلط الحروف
      
      // حفظ الحروف العشوائية في حالة البطاقة
      this.availableLetters = letters;
      state.availableLetters = [...letters]; // حفظ حالة الحروف في حالة البطاقة
    }
  }
  
  // دالة تولد عدد معين من الحروف العشوائية بالعربية
  generateRandomLetters(count: number): string[] {
    const letters = [];
    for (let i = 0; i < count; i++) {
      const randomCharCode = 0x0621 + Math.floor(Math.random() * 28); // نطاق الحروف العربية
      letters.push(String.fromCharCode(randomCharCode));
    }
    return letters;
  }
  


  dragStart(letter: string) {
    this.draggedProduct = letter;
  }



drop(event: DragEvent) {
  event.preventDefault(); // إيقاف السلوك الافتراضي للحدث
  if (this.draggedProduct) {
      const index = this.availableLetters.indexOf(this.draggedProduct);
      if (index !== -1) {
          this.selectedLetters.push(this.draggedProduct);
          this.availableLetters.splice(index, 1);
          this.cardStates[this.currentIndex].availableLetters = [...this.availableLetters];
          this.cardStates[this.currentIndex].selectedLetters = [...this.selectedLetters];
          this.checkWinCondition();
      }
      this.draggedProduct = null;
  }
}

  dragEnd() {
    this.draggedProduct = null;
  }

  findIndex(word: string) {
    return this.availableLetters.indexOf(word);
  }



checkWinCondition() {
  if (
      this.selectedLetters.length === this.currentCard.targetWord.length &&
      this.selectedLetters.join('') === this.currentCard.targetWord
  ) {
      const currentState = this.cardStates[this.currentIndex];
      currentState.points += 5;
      this.points += 5;
      this.timeWhenWon = 60 - this.time;

      this.availableLetters = [];
      this.showFeedback(true);
      currentState.isCardSolved = true; // تحديث حالة حل البطاقة

      setTimeout(() => {
          const allCardsSolved = this.cardStates.every(state => state.points > 0);

          if (allCardsSolved) {
            //this.updateLeaderboard(); // إضافة المدخلات الجديدة
              this.isWinDialogVisible = true;
          } else {
              const nextIndex = this.currentIndex + 1;
              if (nextIndex < this.cards.length) {
                  this.currentIndex++;
                  this.loadCardState();
              }
          }
      }, 2000);
  } else if (this.selectedLetters.length === this.currentCard.targetWord.length) {
      this.showFeedback(false);
      this.clearLetters();
  }
}



  
  showFeedback(isCorrect: boolean) {
    if (isCorrect) {
        this.successSound.play(); 
        this.isCorrectAnimation = true; 
        setTimeout(() => {
            this.isCorrectAnimation = false; 
        }, 2000); // الانتظار لمدة 2000 مللي ثانية (2 ثانية)
    } else {
        this.failureSound.play(); 
        this.isFailureAnimation = true; 
        setTimeout(() => {
            this.isFailureAnimation = false; 
        }, 2000); // الانتظار لمدة 2000 مللي ثانية (2 ثانية)
    }
}

  

  next() {
    this.clickSound.play();
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.loadCardState(); // تحميل حالة البطاقة التالية
    }
  }
  
  back() {
    this.clickSound.play();
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadCardState(); // تحميل حالة البطاقة السابقة
    }
  }

  clearLetters() {
    // نقل الحروف المختارة إلى قائمة السحب
    this.availableLetters = [
      ...this.availableLetters,
      ...this.selectedLetters
    ];
  
    // إعادة ترتيب قائمة السحب
    this.availableLetters.sort(() => Math.random() - 0.5);
  
    // إعادة تعيين الحروف المختارة وتحديث حالة البطاقة
    this.selectedLetters = [];
    this.cardStates[this.currentIndex].selectedLetters = [];
    this.cardStates[this.currentIndex].availableLetters = [...this.availableLetters];
  }
  
  

  startGame() {
    this.resetGame(); // إعادة تعيين اللعبة
    this.startTimer(); // بدء الوقت

}

  // دالة لإعادة اللعبة
  restartGame() {
    this.isDialogVisible = false; // إغلاق الحوار
    this.isWinDialogVisible = false;
    this.currentIndex = 0; // إعادة تعيين الفهرس إلى 0
    this.availableLetters = []; // تفريغ قائمة الحروف المتاحة
    this.resetGame(); // إعادة تعيين اللعبة
    this.points = 0;
  }
  

   // دالة لإعادة تعيين اللعبة عند الفوز
   restartAfterWin() {
    this.isWinDialogVisible = false; // إغلاق حوار الفوز
    this.points = 0; // إعادة تعيين النقاط الإجمالية
    this.cardPoints = []; // إعادة تعيين قائمة النقاط لكل بطاقة
    this.cardStates = this.cards.map(() => ({
      availableLetters: [],
      selectedLetters: [],
      points: 0,
      isCardSolved: false // تعيين القيمة المبدئية

    }));
    this.currentIndex = 0; // إعادة تعيين الفهرس إلى البطاقة الأولى
    this.time = 60; // إعادة تعيين الوقت
    this.resetGame(); // إعادة تعيين اللعبة
  }
  

  hint() {
    this.hintSound.play();
  
    const state = this.cardStates[this.currentIndex];
    const correctLetters = this.currentCard.targetWord.split('');
  
    // الحالة 1: قائمة الحروف المختارة فارغة
    if (this.selectedLetters.length === 0) {
      const firstUnusedLetter = correctLetters[0];
      this.selectedLetters.push(firstUnusedLetter);
      this.availableLetters = this.availableLetters.filter(
        letter => letter !== firstUnusedLetter
      );
      state.selectedLetters = [...this.selectedLetters];
      this.hintUsed = true; // جعل الزر معطلاً بعد استخدام الهنت
      return;
    }
  
    // الحالة 2: قائمة الحروف المختارة تحتوي على حروف، لكن الحرف الأول غير صحيح
    if (this.selectedLetters[0] !== correctLetters[0]) {
      // إعادة جميع الحروف إلى قائمة السحب
      this.availableLetters = [
        ...this.availableLetters,
        ...this.selectedLetters
      ].sort(() => Math.random() - 0.5);
      this.selectedLetters = [];
  
      // إضافة الحرف الأول الصحيح فقط
      const firstUnusedLetter = correctLetters[0];
      this.selectedLetters.push(firstUnusedLetter);
      this.availableLetters = this.availableLetters.filter(
        letter => letter !== firstUnusedLetter
      );
      state.selectedLetters = [...this.selectedLetters];
      this.hintUsed = true; // جعل الزر معطلاً بعد استخدام الهنت
      return;
    }
  
    // الحالة 3: قائمة الحروف المختارة تحتوي على حروف والحرف الأول صحيح
    if (this.selectedLetters[0] === correctLetters[0]) {
      return;
    }
  }
  
  getStarsCount(): number {
    // قم بتعديل هذا الشرط بناءً على النقاط المطلوبة لكل نجمة

     if (this.points >= 15) {
      return 3; // 3 نجوم
    } else if (this.points >= 10) {
      return 2; // 2 نجوم
    } else if (this.points >= 5) {
      return 1; // نجمة واحدة
    } else {
      return 0; // لا نجوم
    }
  }

}