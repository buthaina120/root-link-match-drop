import { Component, OnInit } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import 'animate.css';
import { RouterModule } from '@angular/router';


export interface Card {
  originalWord: string;
  targetWord: string;
  definition: string;
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
    FormsModule,
    RouterModule,
  ],
  styles: [
    `
      :host ::ng-deep {
        [pDraggable] {
          cursor: move;
        }
      }
    `,
  ],
  templateUrl: './roots.component.html',
  styleUrls: ['./roots.component.css'],

})
export class RootsComponent implements OnInit {
  attempts: number = 0; // المحاولات
  points: number = 0; // النقاط
  cardPoints: number[] = []; // لتخزين النقاط لكل بطاقة
  timerInterval: ReturnType<typeof setInterval> | undefined;
  isDialogVisible: boolean = false; // لإظهار الحوار
  isWinDialogVisible: boolean = false; // حوار الفوز
  isCorrectAnimation: boolean = false; // عرض الأنميشن
  isFailureAnimation: boolean = false; // عرض الأنميشن
  hintUsed: boolean = false; 
  cardStates: CardState[] = [];
  availableLetters: string[] = [];
  selectedLetters: string[] = [];
  draggedProduct: string | undefined | null;
  correctAnswerLetters: string[] = []; 
  starsCount: number = 0; 
  stars: number[] = [1, 2, 3]; 
  currentIndex: number = 0;
  playerName: string = ''; 
  isPlayerNameDialogVisible: boolean = false; 
  i: number = 0;
  selectedDifficulty: string = '';
  selectedDifficultyText: string = '';
  maxTime: number = 60;
  timeLeft: number = this.maxTime;
  cardNumber: number = 0;
  gameStatus:  string = ''; 
  data: string | undefined;
  homeFlag: boolean =true;
  levelFlag: boolean =false;
  gameFlag: boolean =false;
  currentCards: Card[] = [];
  playerNameRequired: boolean = false;
  currentDefinition: string = '';



  requiredMsg() {
     // التحقق من إدخال الاسم
     if (!this.playerName.trim()) {
      this.playerNameRequired = true; 
    } else {
      this.playerNameRequired = false; 
      this.isPlayerNameDialogVisible = false; 
      this.setLevelFlag(); 
    }
  }

  constructor(private rest: ApiService) {}
  // root: [{}] | undefined;
 

  async getLemma() {
   // return await firstValueFrom(this.rest.getLemma());
 }

 async getRoot(query: string) {
   return await firstValueFrom(this.rest.getRoot(query));
}


  display: boolean = false;

  showInstructions() {
    this.display = true; // يظهر الحوار
  }

  hideInstructions() {
    this.display = false; // يخفي الحوار
  }

  setLevelFlag() {
    this.homeFlag =false;
    this.levelFlag =true;
    this.gameFlag =false;
    }

  setGameFlag() {
      this.homeFlag =false;
      this.levelFlag =false;
      this.gameFlag =true;
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

  tadaSound = new Howl({
    src: ['../../../angular/assets/tada.mp3'],
  });

  savePlayerName() {
    this.isPlayerNameDialogVisible = true;    
  }

  cards: Card[] = [];

  async ngOnInit() {
    this.timeLeft = this.maxTime;

    if (!this.selectedDifficulty) {
      console.error('Difficulty level not selected!');
      return;
    }

    // بدء اللعبة
    this.startGame();
  
  }
  
  
   selectedLevel(level: string): number {
    switch (level) {
      case 'easy':
        this.maxTime =30;
        this.cardNumber = 3;
        this.selectedDifficultyText = "سهل";
        return this.cardNumber;
      case 'medium':
        this.maxTime =50;
        this.cardNumber = 5;
        this.selectedDifficultyText = "متوسط";
        return this.cardNumber;
      case 'hard':
        this.hintUsed = true;
        this.maxTime =60;
        this.cardNumber = 7;
        this.selectedDifficultyText = "صعب";
        return this.cardNumber;
      default:
        return 3;
    }
  }
 


  async prepareCards() {
    const loadWords = async () => {
      const response = await fetch('../../angular/assets/roots_with_definitions.json');
      return await response.json();
    };
  
    let word = await loadWords();
    console.log(word[0]);
    this.cardNumber = this.selectedLevel(this.selectedDifficulty);
  
    if (this.isDialogVisible && this.currentCards.length > 0) {
      // عند الخسارة، استرجع الكلمات المحفوظة
      this.cards = [...this.currentCards];
    } else {
      // عند الفوز، تحميل كلمات جديدة
      this.cards.length = 0;
      this.currentCards = []; // إعادة تعيين الكلمات المحفوظة
  
      while (this.cards.length < this.cardNumber) {
        let wordjson = [];
        let tempRoot = [];
        let definition = '';
        let wordBOL = [];
        let rootBOL = [];
        let definitionBOL = [];
  
        if (this.cardNumber <= 3) {
          wordBOL = word[0].sample1;
          rootBOL = word[0].sample1;
          definitionBOL = word[0].sample1;
        } else if (this.cardNumber <= 5) {
          wordBOL = word[0].sample2;
          rootBOL = word[0].sample2;
          definitionBOL = word[0].sample2;
        } else if (this.cardNumber <= 7) {
          wordBOL = word[0].sample3;
          rootBOL = word[0].sample3;
          definitionBOL = word[0].sample3;
        }
  
        wordjson = wordBOL[this.i]?.lemma;
        tempRoot = rootBOL[this.i]?.root;
        definition = definitionBOL[this.i]?.definition;
  
        const root = (tempRoot ?? '').replace(/\s+/g, '');
  
        if (!root) {
          this.i++;
          continue;
        }
  
        this.i++;
  
        if (this.i >= wordBOL.length) {
          this.i = 0; // إعادة ضبط المؤشر إذا تجاوز عدد الكلمات
        }
  
        this.cards.push({
          originalWord: wordjson,
          targetWord: root,
          definition: definition, 
        });
      }
  
      // حفظ الكلمات الحالية
      this.currentCards = [...this.cards];
    }
  }
  
  

  ngOnDestroy() {
    this.warningSound.stop();
    clearInterval(this.timerInterval); 
  }

  startTimer() {
    this.timeLeft = this.maxTime;
    clearInterval(this.timerInterval); // التأكد من إيقاف المؤقت القديم
    this.timerInterval = setInterval(() => {
      if (!this.isWinDialogVisible || this.timeLeft > 0) {
        this.timeLeft -= 1;
        // تشغيل صوت التحذير عند تبقي 10 ثوانٍ
        if (this.timeLeft === 10) {
          this.warningSound.play();
        }
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval); // إيقاف المؤقت عند وصول الوقت إلى 0
          this.isDialogVisible = true; 
        }
      }
    }, 1000); 
  }

  get currentCard(): Card {
    return this.cards[this.currentIndex];
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
        (letter) => !this.selectedLetters.includes(letter)
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

  // دالة الحروف العشوائية
  generateRandomLetters(count: number): string[] {
    const arabicLetters = [
      'ء',
      'ا',
      'أ',
      'إ',
      'آ',
      'ؤ',
      'ئ', 
      'ب',
      'ت',
      'ث',
      'ج',
      'ح',
      'خ',
      'د',
      'ذ',
      'ر',
      'ز',
      'س',
      'ش',
      'ص',
      'ض',
      'ط',
      'ظ',
      'ع',
      'غ',
      'ف',
      'ق',
      'ك',
      'ل',
      'م',
      'ن',
      'ه',
      'و',
      'ي',
      'ة',
      'ى', 
    ];

    const letters = [];
    for (let i = 0; i < count; i++) {
      const randomLetter =
        arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
      letters.push(randomLetter);
    }
    return letters;
  }

  dragStart(letter: string) {
    this.draggedProduct = letter;
  }

  drop(event: DragEvent) {
    event.preventDefault();

    const targetElement = event.target as HTMLElement;
    const targetIndex = Array.from(
      targetElement.parentElement?.children || []
    ).indexOf(targetElement);

    // التأكد من أن الحرف المسحوب هو ضمن الحروف المتاحة
    if (
      this.draggedProduct &&
      this.availableLetters.includes(this.draggedProduct)
    ) {
      // التأكد من أن المربع المستهدف فارغ قبل إضافة الحرف
      if (!this.selectedLetters[targetIndex]) {
        // إضافة الحرف للمربع
        this.selectedLetters[targetIndex] = this.draggedProduct;

        // إزالة الحرف من قائمة الحروف المتاحة
        const index = this.availableLetters.indexOf(this.draggedProduct);
        if (index !== -1) {
          this.availableLetters.splice(index, 1);
        }

        // تحديث الحالة
        this.cardStates[this.currentIndex].availableLetters = [
          ...this.availableLetters,
        ];
        this.cardStates[this.currentIndex].selectedLetters = [
          ...this.selectedLetters,
        ];
      }
    }

    // إعادة تعيين الحرف المسحوب
    this.draggedProduct = null;

    // التحقق من الكلمة فقط إذا تم ملء جميع المربعات

    if (
      this.selectedLetters.filter((letter) => letter !== null).length ===
      this.selectedLetters.length
    ) {
      this.checkWinCondition();
    }
  }

  dragEnd() {
    this.draggedProduct = null;
  }

  findIndex(word: string) {
    return this.availableLetters.indexOf(word);
  }

  moveToSelected(letter: string): void {
    if (this.isFailureAnimation) {
    return; // منع إضافة الحروف إذا كانت قائمة السحب مليئة
    }

    const index = this.availableLetters.indexOf(letter);
    if (index !== -1) {
      // إزالة الحرف من قائمة الأحرف المتاحة
      this.availableLetters.splice(index, 1);

      // التأكد من وجود خانة فارغة في قائمة الحروف المختارة
      let placed = false;
      for (let i = 0; i < this.selectedLetters.length; i++) {
        if (
          this.selectedLetters[i] === null ||
          this.selectedLetters[i] === undefined ||
          this.selectedLetters[i] === ''
        ) {
          // إضافة الحرف في أول خانة فارغة
          this.selectedLetters[i] = letter;
          placed = true;
          break;
        }
      }

      // إذا لم توجد خانة فارغة، أضف الحرف في النهاية
      if (!placed) {
        this.selectedLetters.push(letter);
      }

      // تحديث الحالة
      this.cardStates[this.currentIndex].availableLetters = [
        ...this.availableLetters,
      ];
      this.cardStates[this.currentIndex].selectedLetters = [
        ...this.selectedLetters,
      ];

      // تحقق إذا كانت جميع المربعات ممتلئة
      if (
        this.selectedLetters.filter(
          (letter) => letter !== null && letter !== undefined && letter !== ''
        ).length === this.selectedLetters.length
      ) {
        this.checkWinCondition();
      }
    }
  }

  checkWinCondition() {
    if (
      this.selectedLetters.length === this.currentCard.targetWord.length &&
      this.selectedLetters.join('') === this.currentCard.targetWord
    ) {
      // إذا كانت الإجابة صحيحة
      const currentState = this.cardStates[this.currentIndex];
      currentState.points += 5;
      this.points += 5;

      this.availableLetters = []; // مسح الحروف المتاحة
      this.showFeedback(true); // إظهار ملاحظات النجاح
      currentState.isCardSolved = true; // تحديث حالة البطاقة

      // تحقق إذا كانت هذه هي البطاقة الأخيرة
      setTimeout(
        () => {
          const allCardsSolved = this.cardStates.every(
            (state) => state.points > 0
          );

          if (allCardsSolved) {
            // إذا تم حل جميع البطاقات، إيقاف الموقت
            clearInterval(this.timerInterval); // إيقاف الموقت عند حل جميع البطاقات

            // الانتظار لمدة 2 ثانية قبل عرض مربع الحوار
            setTimeout(() => {
              this.tadaSound.play();
              this.isWinDialogVisible = true; // إظهار مربع الفوز
              this.warningSound.pause();
            }, 2000); // الانتظار لمدة 2 ثانية
          } else {
            const nextIndex = this.currentIndex + 1;
            if (nextIndex < this.cards.length) {
              this.currentIndex++;
              this.loadCardState(); // تحميل البطاقة التالية
            }
          }
        },
        this.currentIndex === this.cards.length - 1 ? 0 : 2000
      ); // إذا كانت البطاقة الأخيرة، لا يتم التأخير
    } else if (this.selectedLetters.length === this.currentCard.targetWord.length)
       {
        this.attempts ++;
      // إذا كانت المربعات مليئة ولكن الإجابة غير صحيحة
      this.showFeedback(false); // إظهار ملاحظات الخطأ
      setTimeout(() => {
        this.clearLetters(); // مسح الحروف في حال الإجابة الخاطئة
      }, 2000); // الانتظار لمدة 2 ثانية
    }
  }

  showFeedback(isCorrect: boolean) {
    if (isCorrect) {
      this.successSound.play();
      this.isCorrectAnimation = true;
      setTimeout(() => {
        this.isCorrectAnimation = false;
      }, 2000);// الانتظار لمدة 2 ثانية
    } else {
      this.failureSound.play();
      this.isFailureAnimation = true;
      setTimeout(() => {
        this.isFailureAnimation = false;
      }, 2000); // الانتظار لمدة 2 ثانية
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


  async startGame() {
    await this.prepareCards();
    this.hintUsed = false;
    this.resetGame();
    this.startTimer(); // بدء الوقت
    this.loadCardState(); // تحميل حالة البطاقة الأولى عند بدء اللعبة
  }

  resetGame(shouldRestart: boolean = false) {
    
    this.cardStates = this.cards.map(() => ({
      availableLetters: [],
      selectedLetters: [],
      points: 0,
      isCardSolved: false,
    }));
    this.points =0;
    this.attempts = 0;
    this.selectedLetters = [];
    this.currentIndex = 0;
    this.points = shouldRestart ? 0 : this.points;
    this.selectedLevel(this.selectedDifficulty);
    this.isDialogVisible = false;
    this.isWinDialogVisible = false;
  }

  
    clearLetters() {

    // نقل الحروف المختارة المملوءة فقط إلى قائمة السحب
   const filledLetters = this.selectedLetters.filter(letter => letter && letter.trim() !== '');

    // نقل الحروف المختارة إلى قائمة السحب
    this.availableLetters = [...this.availableLetters, ...filledLetters];

    // إعادة ترتيب قائمة السحب
    this.availableLetters.sort(() => Math.random() - 0.5);

    // إعادة تعيين الحروف المختارة وتحديث حالة البطاقة
    this.selectedLetters = [];
    this.cardStates[this.currentIndex].selectedLetters = [];
    this.cardStates[this.currentIndex].availableLetters = [...this.availableLetters,];
  }


  hint() {
    this.hintSound.play();
  
    const state = this.cardStates[this.currentIndex];
    const correctLetters = this.currentCard.targetWord.split('');
  
    // تحقق من الحروف الموجودة في قائمة الإفلات
    for (let i = 0; i < this.selectedLetters.length; i++) {
      if (this.selectedLetters[i] !== correctLetters[i]) {
        // إذا كان الحرف خاطئ، إرجاعه إلى قائمة السحب
        if (this.selectedLetters[i]) {
          this.availableLetters.push(this.selectedLetters[i]);
        }
        this.selectedLetters[i] = ''; // إزالة الحرف الخاطئ
      }
    }
  
    // إضافة الحرف الأول الصحيح إذا لم يكن موجودًا في مكانه
    if (this.selectedLetters[0] !== correctLetters[0]) {
      // إزالة الحرف من قائمة السحب إذا كان موجودًا
      const firstLetterIndex = this.availableLetters.indexOf(correctLetters[0]);
      if (firstLetterIndex !== -1) {
        this.availableLetters.splice(firstLetterIndex, 1);
      }
  
      // وضع الحرف الأول في مكانه الصحيح
      this.selectedLetters[0] = correctLetters[0];
      this.hintUsed = true; // جعل زر الهنت معطلاً بعد استخدامه
    }
      //  قائمة الحروف المختارة تحتوي على حروف والحرف الأول صحيح
    if (this.selectedLetters[0] === correctLetters[0]) {
      return;
    }
  
  
    // تحديث الحالة
    state.selectedLetters = [...this.selectedLetters];
    state.availableLetters = [...this.availableLetters];
  
  }
  
  

  getStarsCount(): number {
    // حساب عدد البطاقات المحلولة
    const solvedCards = this.cardStates.filter(card => card.isCardSolved).length;
  
    // حساب نسبة البطاقات المحلولة
    const totalCards = this.cardStates.length;
    const solvedPercentage = (solvedCards / totalCards) * 100;
  
    // تحديد عدد النجوم بناءً على نسبة البطاقات المحلولة
    if (solvedPercentage === 100) {
      return 3; // 3 نجوم إذا كانت كل البطاقات محلولة
    } else if (solvedPercentage > 50) {
      return 2; // نجمتين إذا كانت النسبة فوق 50%
    } else if (solvedPercentage > 0) {
      return 1; // نجمة واحدة إذا كانت النسبة 50% أو أقل
    } else {
      return 0; // لا نجوم إذا لم يتم حل أي بطاقة
    }
  }

  goBack() {
    this.setLevelFlag();
    this.warningSound.pause();
    clearInterval(this.timerInterval);
    this.selectedDifficulty = '';
    }

  nextLevel() {
    if (this.selectedDifficulty === 'easy') {
      this.selectedDifficulty = 'medium';
      this.selectedLevel(this.selectedDifficulty);
    } else if (this.selectedDifficulty === 'medium') {
      this.selectedDifficulty = 'hard';
      this.selectedLevel(this.selectedDifficulty);
    } else if (this.selectedDifficulty === 'hard') {
      // إذا كان قد أكمل جميع المستويات
    }
  }

}
