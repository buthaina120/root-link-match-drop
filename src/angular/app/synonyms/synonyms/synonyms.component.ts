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
  
    
  cards: Card[] = []; // تخزين البطاقات
  flippedCards: Card[] = []; // بطاقات مقلوبة
  matchedCards: Card[] = []; // بطاقات مطابقة
  score: number = 0; // عدد النقاط
  attempts: number = 0; // عدد المحاولات

  constructor() { }

  ngOnInit() {
    this.startGame(); // بدء اللعبة عند تحميل المكون
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

  checkMatch() {
    const [firstCard, secondCard] = this.flippedCards;

    // التحقق من المطابقة بناءً على المترادفات
    if (
      (firstCard.word === secondCard.synonym) ||
      (firstCard.synonym === secondCard.word)
    ) {
      this.matchedCards.push(firstCard, secondCard);
      this.score += 1; // زيادة النقاط عند المطابقة
    } else {
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
      }, 1000);
    }
    this.flippedCards = []; // إعادة تعيين البطاقات المقلوبة
  }


  // دالة لإعادة ضبط اللعبة
  restartGame() {
    this.startGame(); // بدء اللعبة من جديد
    this.score = 0; // إعادة تعيين النقاط
    this.attempts = 0; // إعادة تعيين عدد المحاولات
    this.flippedCards = []; // إعادة تعيين البطاقات المقلوبة
    this.matchedCards = []; // إعادة تعيين البطاقات المطابقة
  }


}