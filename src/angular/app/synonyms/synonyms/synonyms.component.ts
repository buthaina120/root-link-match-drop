import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
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
  maxTime: number = 0;
  timeLeft: number = this.maxTime;
  selectedDataType: string = '';
  gameType: string = 'مترادفات';
  selectedApi: 'synonyms' | 'antonyms' | 'translations' = 'synonyms';
  dataType: string = 'synonyms';
  selectedLevel: number = 0;
  currentLevel: number = 1; // 1 = سهل، 2 = متوسط، 3 = صعب
  showLevelUpDialog: boolean = false;
  playerName: string = ''; // متغير لتخزين اسم اللاعب
  showPlayerNameDialog: boolean = false; // للتحكم في عرض الحوار
  playerNameRequired: boolean =false;

  openPlayerNameDialog() {
    this.showPlayerNameDialog = true; // فتح الحوار عند النقر على زر ابدأ
  }
  requiredMsg() {
    // التحقق من إدخال الاسم
    if (!this.playerName.trim()) {
     this.playerNameRequired = true; // إظهار رسالة الخطأ
   } else {
     this.playerNameRequired = false; // إخفاء رسالة الخطأ
     this.showPlayerNameDialog = false; // إغلاق الـ dialog
     this.setflag(); // تنفيذ الإجراء المطلوب
   }
 }
  savePlayerName() {
    this.showPlayerNameDialog = false; // إغلاق الحوار بعد حفظ اسم اللاعب
    console.log('اسم اللاعب:', this.playerName); // استخدم الاسم كما تريد (طباعة أو حفظ)
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
    this.maxTime = [50, 70, 90][this.difficulty - 1] || 60;
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
    }, 1000);
  }

  checkForWin() {
    if (this.matchedCards.length === this.cards.length) {
      clearInterval(this.intervalId);
      this.showDialog = false;
      this.displayWinMessage();
    }
  }
  displayWinMessage() {
    this.tadaSound.play();
    this.showWinDialog = true; // عرض حوار الفوز
  }
  nextLevel() {
    if (this.currentLevel < 3) {
      this.currentLevel += 1; // الترقية للمستوى التالي
      this.selectedLevel = this.currentLevel; // تحديث المستوى المختار
      this.setDataType(this.selectedDataType); // تأكيد نوع التحدي
      this.selectLevel(); // بدء اللعبة بالمستوى الجديد
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
      this.flippedCards.length < 2 &&
      !this.flippedCards.includes(card) &&
      !this.matchedCards.includes(card)
    ) {
      card.flipped = true;
      this.flippedCards.push(card);
      if (this.flippedCards.length === 2) {
        if (
          this.flippedCards[0].matchingWord !== this.flippedCards[1].word1 &&
          this.flippedCards[0].word1 !== this.flippedCards[1].matchingWord
        ) {
          this.attempts += 1; // زيادة عدد المحاولات فقط إذا كانت غير صحيحة
        }
        this.checkMatch();
      }
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
  restartToLevelFlag() {
    this.showWinDialog=false;
    this.gameflag = false; // إخفاء واجهة اللعبة
    this.levelflag = true; // عرض صفحة اختيار المستوى
    this.homeflag = false; // تأكيد أن صفحة البداية مخفية
    clearInterval(this.intervalId); // إيقاف المؤقت
    this.timeLeft = this.maxTime; // إعادة ضبط الوقت
  }

}