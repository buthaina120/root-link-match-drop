import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common'; // استيراد CommonModule
 
 
interface Card {
  id: number;       // معرف فريد للبطاقة
  word: string;     // الكلمة
  synonym: string;  // المترادف
  flipped: boolean; // حالة القلب
}
 
 
@Component({
  selector: 'app-synonyms',
  standalone: true,
  templateUrl: './synonyms.component.html',
  styleUrls: ['./synonyms.component.css'],
  imports: [CommonModule], // إضافة CommonModule هنا
 
  animations: [
    trigger('flipState', [
      state('active', style({
        transform: 'rotateY(179deg)'
      })),
      state('inactive', style({
        transform: 'rotateY(0)'
      })),
      transition('active => inactive', animate('500ms ease-out')),
      transition('inactive => active', animate('500ms ease-in'))
    ])
  ]
})
export class SynonymsComponent implements OnInit {
 
  flag = true;
  cards: Card[] = []; // تخزين البطاقات
  flippedCards: Card[] = []; // بطاقات مقلوبة
  matchedCards: Card[] = []; // بطاقات مطابقة
  score: number = 0; // عدد النقاط
  attempts: number = 0; // عدد المحاولات
 
  constructor() { }
 
 
  setflag (){
    this.flag=!this.flag
  }
  
  startGame() {
    this.cards = [
      { id: 1, word: 'حزين', synonym: 'مكتئب', flipped: false },
      { id: 2, word: 'مكتئب', synonym: 'حزين', flipped: false },
      { id: 3, word: 'سعيد', synonym: 'فرح', flipped: false },
      { id: 4, word: 'فرح', synonym: 'سعيد', flipped: false },
      { id: 5, word: 'خائف', synonym: 'مرعوب', flipped: false },
      { id: 6, word: 'مرعوب', synonym: 'خائف', flipped: false },
      { id: 7, word: 'ذكي', synonym: 'مفكر', flipped: false },
      { id: 8, word: 'مفكر', synonym: 'ذكي', flipped: false }
    ];
    this.shuffleCards(); // خلط البطاقات
  }
 
  shuffleCards() {
    this.cards.sort(() => Math.random() - 0.5);
  }
 
  flipCard(card: Card) {
    if (this.flippedCards.length < 2 && !this.flippedCards.includes(card) && !this.matchedCards.includes(card)) {
      card.flipped = true; // قلب البطاقة
      this.flippedCards.push(card);
      if (this.flippedCards.length === 2) {
        this.attempts += 1; // زيادة عدد المحاولات عند قلب بطاقتين
        this.checkMatch();
      }
    }
  }
  showDialog: boolean = false; // للتحكم في عرض الـ Dialog
  dialogMessage: string = ''; // رسالة الـ Dialog
  checkMatch() {
    const [firstCard, secondCard] = this.flippedCards;
  
    if (
      (firstCard.word === secondCard.synonym) ||
      (firstCard.synonym === secondCard.word)
    ) {
      this.matchedCards.push(firstCard, secondCard);
      this.score += 1;
  
      // تحقق هنا إذا تمت مطابقة جميع البطاقات
      if (this.matchedCards.length === this.cards.length) {
        // عرض رسالة "أحسنت" عند إنهاء جميع المطابقات
        this.dialogMessage = 'أحسنت! لقد أتممت جميع المطابقات بنجاح!';
        this.showDialog = true;
      }
    } else {
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
      }, 1000);
    }
    this.flippedCards = [];
  }  
  timeLeft: number = 60; // النسبة المئوية للوقت المتبقي
intervalId: any; // لتخزين معرف المؤقت

startTimer() {
  this.timeLeft = 60;
  this.intervalId = setInterval(() => {
    if (this.timeLeft > 0) {
      this.timeLeft -= 1;
    } else {
      clearInterval(this.intervalId);
      // عرض رسالة "حاول مرة أخرى" عند انتهاء الوقت
      this.dialogMessage = 'حاول مرة أخرى! انتهى الوقت.';
      this.showDialog = true;
    }
  }, 1000);
  
   // تحديث كل ثانية
   if (this.matchedCards.length === this.cards.length) {
    clearInterval(this.intervalId); // إيقاف المؤقت
    this.dialogMessage = 'أحسنت! لقد أتممت جميع المطابقات بنجاح!';
    this.showDialog = true;
  }
  
}
closeDialog() {
  this.showDialog = false;  // إخفاء الـ Dialog
  this.restartGame();       // إعادة تشغيل اللعبة
}


// تأكد من بدء المؤقت عند بدء اللعبة
ngOnInit() {
  this.startGame(); // بدء اللعبة
  this.startTimer(); // بدء المؤقت
}

// أضف هذا السطر لإعادة المؤقت عند إعادة تشغيل اللعبة
restartGame() {
  clearInterval(this.intervalId); // تأكد من إيقاف المؤقت
  this.score = 0;                 // إعادة تعيين النقاط
  this.attempts = 0;              // إعادة تعيين المحاولات
  this.flippedCards = [];         // إعادة تعيين البطاقات المقلوبة
  this.matchedCards = [];         // إعادة تعيين البطاقات المطابقة
  this.startGame();               // إعادة بدء اللعبة
  this.startTimer();              // إعادة تشغيل المؤقت
}

}