import { Component, OnInit } from '@angular/core';
import {trigger,state,style,transition,animate,} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Howl } from 'howler';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { RouterModule } from '@angular/router'; 
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
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    CardModule,
    TooltipModule,
    FormsModule,
    InputTextModule,
    RouterModule
  ],
})
export class SynonymsComponent implements OnInit {
  correctSound = new Howl({ src: ['../../../angular/assets/correct.wav'] });
  wrongSound = new Howl({ src: ['../../../angular/assets/wrong.mp3'] });
  warningSound = new Howl({ src: ['../../../angular/assets/ticktick.mp3'] });
  tadaSound = new Howl({src: ['../../../angular/assets/tada.mp3'],});

  homeflag = true;
  levelflag = false;
  gameflag = false;
  display: boolean = false;
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
  selectedLevel: number = 0;
  currentLevel: number = 1;
  showLevelUpDialog: boolean = false;
  playerName: string = '';  
  showPlayerNameDialog: boolean = false;   
  playerNameRequired: boolean =false;
  lockBoard: boolean = false;
  totalTimeSpent: number = 0;  
  attemptedAfterResume: boolean = false;



  openPlayerNameDialog() {
    this.showPlayerNameDialog = true;
  }
  requiredMsg() {  
    if (!this.playerName.trim()) {
     this.playerNameRequired = true;   
   } else {
     this.playerNameRequired = false; 
     this.showPlayerNameDialog = false;
     this.setflag();  
   }
 }
  savePlayerName() {
    this.showPlayerNameDialog = false;       
    console.log('اسم اللاعب:', this.playerName); 
  }
setDataType(type: string) {
    this.selectedDataType = type;
    this.gameType =
      type === 'synonyms'
        ? 'مترادفات'
        : type === 'antonyms'
        ? 'متضادات'
        : 'ترجمات';
    this.startGame();
  }
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
    this.maxTime = [30,40,50][this.difficulty - 1];
    this.timeLeft = this.maxTime;
  }
  startGame() {
    const cardPairs = this.loadCardsBasedOnSelection();
    const selectedPairs = this.getPairsBasedOnDifficulty(cardPairs);
    const uniqueCards = selectedPairs
      .map((pair, index) => [
        {
          id: index * 2 + 1,
          word1: pair.word1,
          matchingWord: pair.matchingWord,
          flipped: false,
        },
        {
          id: index * 2 + 2,
          word1: pair.matchingWord,
          matchingWord: pair.word1,
          flipped: false,
        },
      ])
      .flat();
  
    this.cards = uniqueCards;
    this.shuffleCards();
    this.points = 0;
    this.attempts = 0;
    this.matchedCards = [];
    this.flippedCards = [];
  
    this.totalTimeSpent = 0;        
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
          { word1: 'غامض', matchingWord: 'مبهم' },
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
          { word1: 'هادئ', matchingWord: 'صاخب' },
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
          { word1: 'نجمة', matchingWord: 'Star' },
        ];
      default:
        return [];
    }
  }
  private getPairsBasedOnDifficulty(
    cardPairs: { word1: string; matchingWord: string }[]
  ) {
    return cardPairs.slice(0, this.difficulty * 2 + 2);
  }
  startTimer() {
    clearInterval(this.intervalId);
  
    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1;
        this.totalTimeSpent += 1; 
  
        if (this.timeLeft === 10) {
          this.warningSound.play();
        }
      } else {
        clearInterval(this.intervalId);
        if (this.matchedCards.length !== this.cards.length) {
          this.showDialog = true;
          this.cards.forEach(card => {
            card.flipped = false; 
          });
          
        }
      }
      this.checkForWin();
    }, 1000);
  }
  checkForWin() {
    if (this.matchedCards.length === this.cards.length) {
      clearInterval(this.intervalId);
      this.showDialog = false;
      this.displayWinMessage();
      this.attemptedAfterResume = false; // إعادة التتبع عند الفوز
    } else if (this.timeLeft === 0 && this.attemptedAfterResume) {
      this.showDialog = true; // إظهار الحوار إذا انتهى الوقت في المحاولة الثانية
      clearInterval(this.intervalId);
    }
  }  
  displayWinMessage() {
    this.warningSound.stop(); 
    this.tadaSound.play();
    this.showWinDialog = true;  
    clearInterval(this.intervalId);   
    console.log('الوقت المستغرق للمستوى الحالي:', this.totalTimeSpent);   }
  
  nextLevel() {
    if (this.currentLevel < 3) {
      this.currentLevel += 1;
      this.selectedLevel = this.currentLevel;
      this.setDataType(this.selectedDataType);
      this.totalTimeSpent = 0;       
      this.selectLevel();
    }
  }
  shuffleCards() {
    this.cards.sort(() => Math.random() - 0.5);
  }
  flipCard(card: Card) {
    if (!this.intervalId) {
      this.startTimer();
    }
  
    if (
      this.lockBoard ||
      this.flippedCards.length >= 2 ||  
      this.flippedCards.includes(card) ||  
      this.matchedCards.includes(card)
    ) {
      return;
    }
  
     
    card.flipped = true;
    this.flippedCards.push(card);
  
    if (this.flippedCards.length === 2) {
      this.lockBoard = true; 
      this.checkMatch();
    }
  }
  checkMatch() {
    const [firstCard, secondCard] = this.flippedCards;
  
    if (
      firstCard.word1 === secondCard.matchingWord ||
      firstCard.matchingWord === secondCard.word1
    ) {
      this.matchedCards.push(firstCard, secondCard);
      this.points += 1;
      this.correctSound.play();
  
      setTimeout(() => {
        firstCard['state'] = 'matched';
        secondCard['state'] = 'matched';
        this.resetBoard();
      }, 1000);
    } else {
      this.attempts += 1;  
      this.wrongSound.play();
  
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
        this.resetBoard();
      }, 1000);
    }
  }
  resetBoard() {
    this.flippedCards = [];
    this.lockBoard = false; 
  }
  closeDialog() {
    this.showDialog = false;
    this.showWinDialog = false;
    this.showLevelUpDialog = false;
    this.display = false;
    this.restartGame();
  }

  constructor(private rest: ApiService) {}
  root: string | undefined;

 async getSynonyms(query: string): Promise<string> {
   return await firstValueFrom(this.rest.getSynonyms(query));
}
  ngOnInit() {
    // ApiService هنا
  /*  this.getSynonyms('ضرب').then(data => {
      console.log(data);
    });*/

    const Synonyms = this.getSynonyms('ضرب')
    console.log(Synonyms)
  }
  restartGame() {
    clearInterval(this.intervalId);
    this.timeLeft = this.maxTime;
    this.points = 0;
    this.attempts = 0;
    this.flippedCards = [];
    this.matchedCards = [];
    this.selectedLevel = this.currentLevel;
    this.totalTimeSpent = 0;   
    this.setTimerBasedOnLevel();
    this.startGame();
    this.showDialog = false;
    this.showWinDialog = false;
    this.showLevelUpDialog = false;
    this.attemptedAfterResume = false; // إعادة تعيين
  }
  
  resumeGame() {
    if (this.attemptedAfterResume) {
      this.showDialog = true; // إظهار الحوار عند المحاولة الثانية وعدم الفوز
      return;
    }
    this.attemptedAfterResume = true; // تتبع المحاولة الأولى بعد الإكمال
    const extraTime = 30;     
    this.timeLeft += extraTime;  
    this.showDialog = false; 
    this.warningSound.stop();  
    this.startTimer();  
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
  restartToLevelFlag() {
    this.showWinDialog=false;
    this.gameflag = false;
    this.levelflag = true;  
    this.homeflag = false; 
    clearInterval(this.intervalId);  
    this.timeLeft = this.maxTime;  
  }
  ngOnDestroy() {
    this.warningSound.stop();
    clearInterval(this.intervalId);   
  }
}