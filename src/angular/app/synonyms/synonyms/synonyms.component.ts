import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Howl } from 'howler';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

interface Card {
  id: number;
  word1: string; 
  matchingWord: string; 
  flipped: boolean;
  state?: string; 
}

@Component({
  selector: 'app-synonyms',
  standalone: true,
  templateUrl: './synonyms.component.html',
  styleUrls: ['./synonyms.component.css'],
  imports: [CommonModule, ButtonModule,DialogModule,CardModule,TooltipModule],
  animations: [
    trigger('flipState', [
      state('active', style({ transform: 'rotateY(200deg)' })),
      state('inactive', style({ transform: 'rotateY(100)' })),
      state('matched', style({ opacity: 0, transform: 'scale(0.8)' })), // اجعل البطاقات تتلاشى وتختفي
      transition('active => inactive', animate('500ms ease-out')),
      transition('inactive => active', animate('500ms ease-in')),
      transition('* => matched', animate('100ms ease-in')) // تعديل عند الانتقال إلى حالة المطابقة
    ]),
    trigger('cardMatchState', [
      state('win', style({ transform: 'scale(1.2)', backgroundColor: 'gold' })),
      transition('* => win', animate('600ms ease-in-out')),
    ]),
    trigger('cardErrorState', [
      state('error', style({ transform: 'translateX(0)', backgroundColor: '#e57373' })),
      transition('* => error', [
        animate('100ms', style({ transform: 'translateX(-5px)' })),
        animate('100ms', style({ transform: 'translateX(5px)' })),
        animate('100ms', style({ transform: 'translateX(-5px)' })),
        animate('100ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ]
})
export class SynonymsComponent implements OnInit {
  correctSound = new Howl({ src: ['../../../angular/assets/correct.wav'] });
  wrongSound = new Howl({ src: ['../../../angular/assets/wrong.mp3'] });
  warningSound = new Howl({ src: ['../../../angular/assets/ticktick 1.mp3'] });


  homeflag = true;
  levelflag = false;
  gameflag = false;
  display:boolean = false;
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matchedCards: Card[] = [];
  points: number = 0;
  attempts: number = 0;
  starsCount: number = 0;
  stars: number[] = [1, 2, 3];
  showDialog: boolean = false;
  showWinDialog: boolean = false;
  gameStarted: boolean = false;
  intervalId: any;
  difficulty: number = 1;
  maxTime: number = 60; 
  timeLeft: number = this.maxTime;
  selectedDataType: string = ''; 
  gameType: string = 'مترادفات'; 
  selectedApi: 'synonyms' | 'antonyms' | 'translations' = 'synonyms';
  dataType: string = 'synonyms';
  selectedLevel: number =0;
  currentLevel: number = 1; // 1 = سهل، 2 = متوسط، 3 = صعب
showLevelUpDialog: boolean = false;



setDataType(type: string) {
  this.selectedDataType = type;
  this.gameType = type === 'synonyms' ? 'مترادفات' : type === 'antonyms' ? 'متضادات' : 'ترجمات';
  this.startGame();
}
  constructor() {}
  setflag() {
    this.homeflag = false;
    this.levelflag = true;
  }

  showInstructions() {
    this.display = true;
  }

  selectLevel() {
    this.difficulty = this.selectedLevel;
    this.setTimerBasedOnLevel();
    this.startGame();
  }

  setTimerBasedOnLevel() {
    this.maxTime = [40, 60, 80,][this.difficulty - 1] || 60;
    this.timeLeft = this.maxTime; 
  }

  startGame() {
    const cardPairs = this.loadCardsBasedOnSelection();
    const selectedPairs = this.getPairsBasedOnDifficulty(cardPairs);
    const uniqueCards = selectedPairs.map((pair, index) => [
      { id: index * 2 + 1, word1: pair.word1, matchingWord: pair.matchingWord, flipped: false },
      { id: index * 2 + 2, word1: pair.matchingWord, matchingWord: pair.word1, flipped: false }
    ]).flat();

    this.cards = uniqueCards;
    this.shuffleCards();
    this.points = 0;
    this.attempts = 0;
    this.matchedCards = [];
    this.flippedCards = [];
    this.startTimer();
    this.levelflag = false;
    this.gameflag = true;
  }


  private loadCardsBasedOnSelection() {
    switch (this.selectedDataType) {
      case 'synonyms':
        this.gameType = 'مترادفات'; 
        return [
          { word1: 'جميل', matchingWord: 'حسن' },
          { word1: 'عاقل', matchingWord: 'حكيم' },
          { word1: 'سريع', matchingWord: 'عاجل' },
          { word1: 'كريم', matchingWord: 'جواد' },
          { word1: 'ذكي', matchingWord: 'فطن' },
          { word1: 'فقير', matchingWord: 'معدم' },
          { word1: 'هادئ', matchingWord: 'رائق' },
          { word1: 'شجاع', matchingWord: 'مقدام' },
          { word1: 'مبدع', matchingWord: 'خلاق' },
          { word1: 'غامض', matchingWord: 'مبهم' }
        ];
        
      case 'antonyms':
        this.gameType = 'متضادات';
        return [
          { word1: 'جميل', matchingWord: 'قبيح' },
          { word1: 'سعيد', matchingWord: 'تعيس' },
          { word1: 'ذكي', matchingWord: 'غبي' },
          { word1: 'قوي', matchingWord: 'ضعيف' },
          { word1: 'جبان', matchingWord: 'شجاع' },
          { word1: 'ساكن', matchingWord: 'متحرك' },
          { word1: 'طويل', matchingWord: 'قصير' },
          { word1: 'غني', matchingWord: 'معدم' },
          { word1: 'مشرق', matchingWord: 'مظلم' },
          { word1: 'هادئ', matchingWord: 'صاخب' }
  
          
        ];
      case 'translations':
        this.gameType = 'ترجمات'; 
        return [
          { word1: 'شمس', matchingWord: 'Sun' },
          { word1: 'جبل', matchingWord: 'Mountain' },
          { word1: 'ماء', matchingWord: 'Water' },
          { word1: 'شجرة', matchingWord: 'Tree' },
          { word1: 'قمر', matchingWord: 'Moon' },
          { word1: 'سماء', matchingWord: 'Sky' },
          { word1: 'نهر', matchingWord: 'River' },
          { word1: 'زهرة', matchingWord: 'Flower' },
          { word1: 'منزل', matchingWord: 'House' },
          { word1: 'نجمة', matchingWord: 'Star' }
        ];
      default:
        return [];
    }
  }
  private getPairsBasedOnDifficulty(cardPairs: { word1: string; matchingWord: string }[]) {
    return cardPairs.slice(0, this.difficulty * 2 + 4);
  }

  startTimer() {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1;
        if (this.timeLeft === 10) {
          this.warningSound.play();
        }
      } else {
        clearInterval(this.intervalId);
        if (this.matchedCards.length !== this.cards.length) {
          this.showDialog = true;
        }
      }
      this.checkForWin();
    }, 2000);
  }
  
  checkForWin() {
    if (this.matchedCards.length === this.cards.length) {
      clearInterval(this.intervalId);
      this.showDialog = false;
      this.displayWinMessage();
    }
  }

  displayWinMessage() {
  this.warningSound.stop();
  this.correctSound.play();
  this.showWinDialog = true; 
  if (this.currentLevel < 3) { 
    this.showLevelUpDialog = true; // إظهار حوار الترقية إذا لم يكن في المستوى الأخير
  } else {
    this.showLevelUpDialog = false; // إخفاء حوار الترقية إذا كان في المستوى الأخير
  }
}

  nextLevel() {
    if (this.currentLevel < 3) {
      this.currentLevel += 1; // الترقية للمستوى التالي
      this.selectedLevel = this.currentLevel; // تحديث المستوى المختار
      this.setDataType(this.selectedDataType); // تأكيد نوع التحدي
      this.selectLevel(); // بدء اللعبة بالمستوى الجديد
    } else {
      // إذا كان المستوى الحالي هو الثالث، إظهار زر الإعادة فقط
      this.restartFromFirstLevel(); // إعادة اللعبة من المستوى الأول
    }
    this.showWinDialog = false; // إغلاق حوار الفوز
    this.showLevelUpDialog = false; // إغلاق حوار الترقية
  }
  restartFromFirstLevel() {
    this.currentLevel = 1; // إعادة المستوى إلى الأول
    this.selectedLevel = this.currentLevel; // تحديث المستوى المختار
    this.setDataType(this.selectedDataType); // تأكيد نوع التحدي
    this.selectLevel(); // بدء اللعبة بالمستوى الأول
  }
  
  

  shuffleCards() {
    this.cards.sort(() => Math.random() - 0.5);
  }

  flipCard(card: Card) {
    if (!this.intervalId) {
      this.startTimer();
    }
    if (this.flippedCards.length < 2 && !this.flippedCards.includes(card) && !this.matchedCards.includes(card)) {
      card.flipped = true;
      this.flippedCards.push(card);
      if (this.flippedCards.length === 2) {
        this.attempts += 1;
        this.checkMatch();
      }
    }
  }

  checkMatch() {
    const [firstCard, secondCard] = this.flippedCards;
    if ((firstCard.word1 === secondCard.matchingWord) || (firstCard.matchingWord === secondCard.word1)) {
      this.matchedCards.push(firstCard, secondCard);
      this.points += 1;
  
      this.correctSound.play();
  
      // تأخير إخفاء البطاقات
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
  
        // تطبيق حالة 'matched' على البطاقات لإخفائها
        firstCard['state'] = 'matched';
        secondCard['state'] = 'matched';
      }, 3000); // تأخير لمدة 1000 مللي ثانية (1 ثانية)
  
      this.checkForWin();
    } else {
      this.wrongSound.play();
  
      // تأخير إغلاق البطاقات في حالة الخطأ
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
      }, 1000); // تأخير لمدة 1000 مللي ثانية (1 ثانية)
    }
    this.flippedCards = [];
  }

  closeDialog() {
    this.showDialog = false;
    this.showWinDialog = false;
    this.showLevelUpDialog = false;
    this.display = false;
    this.restartGame();
  }

  ngOnInit() {
   
  }

  restartGame() {
    clearInterval(this.intervalId);
    this.timeLeft = this.maxTime;
    this.points = 0;
    this.attempts = 0;
    this.flippedCards = [];
    this.matchedCards = [];
    this.selectedLevel = this.currentLevel;
    this.setTimerBasedOnLevel();
    this.startGame();
    this.showDialog = false;
    this.showWinDialog = false;
    this.showLevelUpDialog = false;
  }  
  getStarsCount(): number {
    const totalCards = this.cards.length;
    const matchedCardsCount = this.matchedCards.length;
    if (matchedCardsCount === totalCards) return 3;
    else if (matchedCardsCount >= Math.ceil(totalCards / 2)) return 2;
    else if (matchedCardsCount > 0) return 1;
    else return 0;
  }

  goBack() {
    this.gameflag = false;
    this.levelflag = true;
    this.homeflag = false;
    clearInterval(this.intervalId);
    this.timeLeft = this.maxTime;
  }
  
}