import { Component, OnInit } from '@angular/core';
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
interface Card {
  id: number;
  word1: string;
  matchingWord: string;
  flipped: boolean;
  state?: string;
}
@Component({
  selector:'app-synonyms',
  standalone:true,
  templateUrl:'./synonyms.component.html',
  styleUrls:['./synonyms.component.css'],
  imports:[CommonModule,ButtonModule,DialogModule,CardModule,TooltipModule,FormsModule,InputTextModule,],})
export class SynonymsComponent implements OnInit {
  correctSound = new Howl({ src: ['../../../angular/assets/correct.wav'] });
  wrongSound = new Howl({ src: ['../../../angular/assets/wrong.mp3'] });
  warningSound = new Howl({ src: ['../../../angular/assets/ticktick.mp3'] });
  tadaSound = new Howl({src: ['../../../angular/assets/tada.mp3'],});

  homeflag=true;
  levelflag=false;
  gameflag=false;
  display:boolean=false;
  cards:Card[]=[];
  flippedCards:Card[]=[];
  matchedCards:Card[]=[];
  points:number=0;
  attempts:number=0;
  starsCount:number=0;
  stars:number[]=[1, 2, 3];
  showDialog:boolean = false;
  showWinDialog:boolean = false;
  gameStarted:boolean = false;
  intervalId:any;
  difficulty:number = 1;
  maxTime:number = 0;
  timeLeft:number = this.maxTime;
  selectedDataType:string = '';
  gameType:string = 'مترادفات';
  selectedApi:'synonyms' | 'antonyms' | 'translations' = 'synonyms';
  dataType:string='synonyms';
  selectedLevel:number = 0;
  currentLevel:number = 1; 
  showLevelUpDialog:boolean = false;
  playerName:string='';
  showPlayerNameDialog:boolean = false;
  data: string|undefined;
  i: number =0;

  openPlayerNameDialog() {
    this.showPlayerNameDialog = true;
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
        : type === 'opposites'
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
/*
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
*/
/********** */

private async loadCardsBasedOnSelectionFromAPI() {
  const cardPairs: { word1: string; matchingWord: string; type: string }[] = [];
  const response = await fetch('../../angular/assets/lemmas.json'); // تحميل الملف
  const word = this.data = await response.json(); // تحويل المحتوى إلى JSON
  console.log(word[1].lemma); // عرض البيانات في الكونسول
  
  try {
    this.i = 0; // تعيين قيمة ابتدائية
    while(this.i<24){  
      const word = this.data = await response.json(); // تحويل المحتوى إلى JSON

      const randomWord =word[this.i].lemma ;

      //const lemmaTemp = await this.getLemma();
      //const word = lemmaTemp[this]?.lemma?.formRepresentations[0]?.form;
      if (!randomWord) continue;
      const synonymsResponse = await this.getSynonyms(randomWord);
      const antonymsResponse = await this.getAntonyms(randomWord);
      const translationsResponse = await this.getTransulation(randomWord);

      const options = [
        { type: 'synonyms', words: synonymsResponse[0]?.synonyms || [] },
        { type: 'opposites', words: antonymsResponse[0]?.antonyms || [] },
        { type: 'senses', words: translationsResponse[0]?.translations || [] },
      ];

      const bestOption = options.sort((a, b) => b.words.length - a.words.length)[0];

      if (bestOption.words.length === 0) continue;
      const matchingWord = bestOption.words[0]; // اختيار أول نتيجة
      cardPairs.push({ word1: randomWord, matchingWord, type: bestOption.type });
      this.i++;
    }
  } catch (error) {
    console.error("Error fetching cards from API:", error);
  }
  console.log(cardPairs);
  return cardPairs;
}


async startGame() {
  const cardPairs =
    this.selectedDataType === 'synonyms'
      ? await this.loadCardsBasedOnSelectionFromAPI()
      : this.loadCardsBasedOnSelection();
 
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
    this.warningSound.stop();
    this.correctSound.play();
    this.showWinDialog = true;
    this.tadaSound.play();
    if (this.currentLevel < 3) {
      this.showLevelUpDialog = true;
    } else {
      this.showLevelUpDialog = false; 
    }
  }
  nextLevel() {
    if (this.currentLevel < 3) {
      this.currentLevel += 1; 
      this.selectedLevel = this.currentLevel; 
      this.setDataType(this.selectedDataType);
      this.selectLevel();
    } else {
    
      this.restartFromFirstLevel();
    }
    this.showWinDialog = false;
    this.showLevelUpDialog = false;
  }
  restartFromFirstLevel() {
    this.currentLevel = 1; 
    this.selectedLevel = this.currentLevel;
    this.setDataType(this.selectedDataType);
    this.selectLevel();
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
        this.attempts += 1;
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
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
        firstCard['state'] = 'matched';
        secondCard['state'] = 'matched';
      }, 3000);
 
      this.checkForWin();
    } else {
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
    this.showLevelUpDialog = false;
    this.display = false;
    this.restartGame();
  }
 
  constructor(private rest: ApiService) {}
 async getLemma() {
   return await firstValueFrom(this.rest.getLemma());
}
 async getSynonyms(query: string) {
   return await firstValueFrom(this.rest.getSynonyms(query));
}
async getAntonyms(query: string) {
  return await firstValueFrom(this.rest.getAntonyms(query));
}
async getTransulation(query: string) {
  return await firstValueFrom(this.rest.getTransulation(query));
}
async ngOnInit() {
  try {
    const lemmaTemp = await this.getLemma();
    const word = lemmaTemp[1]?.lemma?.formRepresentations[0]?.form || 'defaultWord';
    console.log('Lemma Word:', word);

    const synonyms = await this.getSynonyms(word);
    console.log('Synonyms:', synonyms[0]?.synonyms[1]);

    const antonyms = await this.getAntonyms(word);
    console.log('Antonyms:', antonyms[0]?.antonyms[1]);

    const translations = await this.getTransulation(word);
    console.log('Translations:', translations[0]?.translations[1]);
  } catch (error) {
    console.error('Error fetching data:', error);
  }

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