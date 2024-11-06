import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Howl } from 'howler';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

interface Card {
  id: number;
  word1: string; 
  matchingWord: string; 
  flipped: boolean;
}

@Component({
  selector: 'app-synonyms',
  standalone: true,
  templateUrl: './synonyms.component.html',
  styleUrls: ['./synonyms.component.css'],
  imports: [CommonModule, DialogModule,CardModule,TooltipModule],
  animations: [
    trigger('flipState', [
      state('active', style({ transform: 'rotateY(179deg)' })),
      state('inactive', style({ transform: 'rotateY(0)' })),
      state('matched', style({ opacity: 0, transform: 'none' })),
      transition('active => inactive', animate('500ms ease-out')),
      transition('inactive => active', animate('500ms ease-in')),
      transition('* => matched', animate('600ms ease-in'))
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
  correctSound = new Howl({
    src: ['../../../angular/assets/correct.wav'],
  });

  wrongSound = new Howl({
    src: ['../../../angular/assets/wrong.mp3'],
  });

  homeflag = true;
  levelflag = false;
  gameflag = false;
  display = false;
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matchedCards: Card[] = [];
  points: number = 0;
  attempts: number = 0;
  starsCount: number = 0;
  stars: number[] = [1, 2, 3];
  showDialog: boolean = false;
  showWinDialog: boolean = false;
  intervalId: any;
  difficulty: number = 1;
  maxTime: number = 60; 
  timeLeft: number = this.maxTime;
  selectedDataType: string = 'synonyms'; 
  gameType: string = 'مترادفات'; 
  selectedApi: 'synonyms' | 'antonyms' | 'translations' = 'synonyms';
  dataType: string = 'synonyms';

  setDataType(type: string) {
    this.dataType = type;
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

  selectLevel(level: number) {
    this.difficulty = level;
    this.levelflag = false;
    this.gameflag = true;
    this.setTimerBasedOnLevel();
    this.startGame();
  }

  setTimerBasedOnLevel() {
    this.maxTime = [60, 80, 100, 120][this.difficulty - 1] || 60;
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
  }

  private loadCardsBasedOnSelection() {
    switch (this.selectedDataType) {
      case 'synonyms':
        this.gameType = 'مترادفات'; 
        return [
          { word1: 'حزين', matchingWord: 'مكتئب' },
          { word1: 'سعيد', matchingWord: 'فرح' },
          { word1: 'ذكي', matchingWord: 'مفكر' },
          { word1: 'قوي', matchingWord: 'شجاع' },
          { word1: 'خائف', matchingWord: 'مرعوب' },
          { word1: 'هادئ', matchingWord: 'مسترخي' },
          { word1: 'متعاون', matchingWord: 'مساعد' },
          { word1: 'مبدع', matchingWord: 'خيالي' },
          { word1: 'عبر', matchingWord: 'اجتاز' },
          { word1: 'العجلة', matchingWord: 'السرعة' }
        ];
      case 'antonyms':
        this.gameType = 'متضادات';
        return [
          { word1: 'حزين', matchingWord: 'سعيد' },
          { word1: 'سعيد', matchingWord: 'حزين' },
          { word1: 'ذكي', matchingWord: 'غبي' },
          { word1: 'قوي', matchingWord: 'ضعيف' },
          { word1: 'خائف', matchingWord: 'شجاع' },
          { word1: 'هادئ', matchingWord: 'مضطرب' },
          { word1: 'طويل', matchingWord: 'قصير' },
          { word1: 'سريع', matchingWord: 'بطيء' },
          { word1: 'ثقيل', matchingWord: 'خفيف' },
          { word1: 'صغير', matchingWord: 'كبير' }
  
          
        ];
      case 'translations':
        this.gameType = 'ترجمات'; 
        return [
          { word1: 'كتاب', matchingWord: 'Book' },
          { word1: 'تفاح', matchingWord: 'Apple' },
          { word1: 'ماء', matchingWord: 'Water' },
          { word1: 'شجرة', matchingWord: 'Tree' },
          { word1: 'قلم', matchingWord: 'Pen' },
          { word1: 'حقيبة', matchingWord: 'Bag' },
          { word1: 'سيارة', matchingWord: 'Car' },
          { word1: 'مدرسة', matchingWord: 'School' },
          { word1: 'منزل', matchingWord: 'House' },
          { word1: 'ساعة', matchingWord: 'Clock' }
        ];
      default:
        return [];
    }
  }
  private getPairsBasedOnDifficulty(cardPairs: { word1: string; matchingWord: string }[]) {
    return cardPairs.slice(0, this.difficulty * 2 + 2);
  }

  startTimer() {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1;
      } else {
        clearInterval(this.intervalId);
        if (this.matchedCards.length !== this.cards.length) {
          this.showDialog = true;
        }
      }
      this.checkForWin();
    }, 1000);
  }
  
  checkForWin() {
    if (this.matchedCards.length === this.cards.length) {
      clearInterval(this.intervalId);
      this.displayWinMessage();
    }
  }

  displayWinMessage() {
    this.correctSound.play();
    this.showWinDialog = true; 
  }

  shuffleCards() {
    this.cards.sort(() => Math.random() - 0.5);
  }

  flipCard(card: Card) {
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

      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
      }, 1300);

      this.checkForWin();
    } else
    {
      this.wrongSound.play();
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
      }, 1000);
    }
    this.flippedCards = [];
  }

  closeDialog() {
    this.showDialog = false;
    this.showWinDialog = false;
    this.restartGame();
  }

  ngOnInit() {
    this.startGame();
  }

  restartGame() {
    clearInterval(this.intervalId);
    this.setTimerBasedOnLevel();
    this.startGame();
    this.showDialog = false;
    this.points = 0;
    this.attempts = 0;
    this.flippedCards = [];
    this.matchedCards = [];
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
  }
  
}

