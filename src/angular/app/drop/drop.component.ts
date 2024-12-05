import { Component, OnInit } from '@angular/core';
import { DragDropModule } from 'primeng/dragdrop';

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

import { CommonModule } from '@angular/common';    // استيراد CommonModule
import { Howl } from 'howler';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
//import { ApiService } from '../../services/api.service';
import { ChipsModule } from 'primeng/chips';
import { PanelModule } from 'primeng/panel'; // استيراد الوحدة الخاصة بـ p-panel
import { ProgressBarModule } from 'primeng/progressbar';
import 'animate.css';



interface Word {
  name: string; // اسم الكلمة
  weight: 'فعل' | 'فاعل' | 'مفعل'; // نوع التصنيف
}


@Component({
  selector: 'app-drop',
  standalone: true,
  imports: [CommonModule, DragDropModule,DialogModule,
    CardModule,
    TooltipModule,
    FormsModule,
    ButtonModule,
    InputTextModule,ChipsModule,PanelModule,ProgressBarModule], // تأكد من تضمين CommonModule و DragDropModule هنا
  templateUrl: './drop.component.html',
  styleUrls: ['./drop.component.css'], // تصحيح الكلمة من styleUrl إلى styleUrls
})

export class DropComponent implements OnInit {
  correctSound = new Howl({ src: ['../../../angular/assets/correct.wav'] });
  wrongSound = new Howl({ src: ['../../../angular/assets/wrong.mp3'] });
  warningSound = new Howl({ src: ['../../../angular/assets/ticktick.mp3'] });
  points: number = 0; // النقاط
  attempts:number=0;
  cardPoints: number[] = []; // لتخزين النقاط لكل بطاقة
  timerInterval: any;
  timeWhenWon: number = 0; // لتخزين الوقت عند الفوز
  isDialogVisible: boolean = false; // لإظهار الحوار
  gameflag = false;
  homeflag = true;
  display: boolean = false;
  gameType: string = 'الأوزان';
  maxTime: number = 60; // تعيين القيمة مباشرة هنا
  timeLeft: number = this.maxTime;
  gameStarted: boolean = false;
  intervalId: any;
  showDialog: boolean = false;
  starsCount: number = 0;
  stars: number[] = [1, 2, 3];
  showWinDialog: boolean = false;
  selectedDataType: string = '';
  playerName: string = ''; // متغير لتخزين اسم اللاعب
  showPlayerNameDialog: boolean = false; // للتحكم في عرض الحوار
  showFeedback: boolean = false; // للتحكم في ظهور الرسالة
isFailureAnimation: boolean = false; // يحدد إذا كانت الإجابة خاطئة

  
allowDrop(event: Event): void {
  event.preventDefault(); // منع السلوك الافتراضي

  // تحقق من أن الحدث هو من النوع DragEvent
  if (event instanceof DragEvent) {
    console.log('Drag event detected:', event);
  }
}

  openPlayerNameD() {
    this.showPlayerNameDialog = true; // فتح الحوار عند النقر على زر ابدأ
  }
  openPlayerName() {
    if (!this.playerName) { // تحقق إذا لم يتم تعيين اسم اللاعب
      this.showPlayerNameDialog = true; // فتح الحوار
    } else {
      this.startTimer(); // إذا كان الاسم موجودًا، ابدأ المؤقت مباشرة
    }
  }
  

  
  setDataType(type: string) {
    this.selectedDataType = type;
    this.gameType =
      type === 'weights'
        ? 'الأوزان'
        : 'السياق الكلامي';
  
    this.startGame();
  }
  setflag() {
    this.homeflag = false;

  }

  showInstructions() {
    this.display = true;
  }
  availableWords: Word[] = [
    { name: 'قرأ', weight: 'فعل' },
    { name: 'شعر', weight: 'فعل' },
    { name: 'طلب', weight: 'فعل' },
    { name: 'شرب', weight: 'فعل' },
    { name: 'كتب', weight: 'فعل' },

    { name: 'قارئ', weight: 'فاعل' },
    { name: 'طالب', weight: 'فاعل' },
    { name: 'قادر', weight: 'فاعل' },
    { name: 'عالم', weight: 'فاعل' },
    { name: 'شاعر', weight: 'فاعل' },

    { name: 'مجلس', weight: 'مفعل' },
    { name: 'مصنع', weight: 'مفعل' },
    { name: 'معلم', weight: 'مفعل' },
    { name: 'مجمع', weight: 'مفعل' },
    { name: 'مكتب', weight: 'مفعل' },
  ];
  // تعديل نوع lists ليقبل فهرسة بواسطة string
lists: { [key: string]: Word[] } = {
  فعل: [],
  فاعل: [],
  مفعل: []
};

  matchedCards: Word[] = [];
  wordList: any[] = [...this.availableWords]; // جميع الكلمات

// إضافة متغيرات لتخزين الكلمات المسحوبة
draggedItem: Word | null = null;
draggedFrom= '';

ngOnInit(): void {
  const savedName = localStorage.getItem('playerName');
  if (savedName) {
    this.playerName = savedName;
    this.openPlayerName(); // فتح الحوار إذا كان الاسم محفوظًا مسبقًا
  }
}
  

 // تحديث dragStart ليحفظ العنصر (الزر والكلمة)
dragStart(item: Word, from: 'left' | 'right'): void {
  this.draggedItem = item;
  this.draggedFrom = from;
}
  // تحديث دالة dragEnd لإعادة تعيين العنصر المسحوب
dragEnd(): void {
  this.draggedItem = null;
  this.draggedFrom = '';
}
 // تحديث checkMatch لتثبيت الزر نفسه
 checkMatch(targetWeight: 'فعل' | 'فاعل' | 'مفعل'): void {
  this.attempts++;
  if (this.draggedItem && this.draggedItem.weight === targetWeight) {
    // إجابة صحيحة
    this.lists[targetWeight].push(this.draggedItem);
    this.matchedCards.push(this.draggedItem);
    this.availableWords = this.availableWords.filter(
      (word) => word !== this.draggedItem
    );
    this.points++;
    this.correctSound.play();

    // عرض علامة الصح
    this.isFailureAnimation = false;
    this.showFeedback = true;
    setTimeout(() => (this.showFeedback = false), 1000); // إخفاء الرسالة بعد ثانية

    if (this.matchedCards.length === this.wordList.length) {
      this.displayWinMessage();
    }
  } else {
    // إجابة خاطئة
    this.wrongSound.play();

    // عرض علامة الخطأ
    this.isFailureAnimation = true;
    this.showFeedback = true;
    setTimeout(() => (this.showFeedback = false), 1000); // إخفاء الرسالة بعد ثانية
  }

  // إعادة تعيين العنصر المسحوب
  this.draggedItem = null;
  this.draggedFrom = '';
}


startTimer() {
  this.timeLeft = this.maxTime; // تعيين الوقت المتبقي عند بدء المؤقت
  clearInterval(this.timerInterval); // مسح أي مؤقت سابق

  // بدء المؤقت الجديد
  this.timerInterval = setInterval(() => {
    if (!this.showWinDialog) {
      this.timeLeft--; // تقليل الوقت المتبقي
      if (this.timeLeft === 10) {
        this.warningSound.play(); // تشغيل صوت التحذير عند 10 ثوانٍ
      }
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval); // إيقاف المؤقت
        this.showDialog = true; // إظهار حوار "انتهى الوقت"
      }
      }
  }, 1000); // المؤقت يعمل كل ثانية
}
// إضافة التحقق من النسبة المئوية للـ Progress Bar
getProgressPercentage(): number {
  return (this.timeLeft / this.maxTime) * 100;
}

  checkForWin() {
    if (this.matchedCards.length === this.wordList.length) {
      clearInterval(this.intervalId); // توقف المؤقت عند الفوز
      this.showWinDialog = true; // إظهار حوار الفوز    
      this.displayWinMessage();
    } else if (this.timeLeft === 0 && this.matchedCards.length < this.wordList.length) {
      this.showDialog = true; // عرض نافذة الفشل عند انتهاء الوقت بدون إكمال
    }
  }

  displayWinMessage() {
    this.warningSound.stop(); // إيقاف صوت التحذير
    this.correctSound.play(); // تشغيل صوت النجاح
    this.starsCount = this.getStarsCount(); // حساب عدد النجوم
    this.showWinDialog = true; // عرض نافذة الفوز
  }
  
  
  startGame() {
    this.points = 0;
    this.attempts = 0;
    this.matchedCards = [];
    this.lists = { فعل: [], فاعل: [], مفعل: [] }; // إعادة تعيين القوائم
    this.startTimer(); // بدء المؤقت
  }
  
  restartGame() {
    clearInterval(this.intervalId);
    this.availableWords = [...this.wordList]; 
    this.lists = { فعل: [], فاعل: [], مفعل: [] }; // إعادة تعيين القوائم

    this.points = 0;
    this.attempts = 0;
    this.matchedCards = [];
    this.startGame();
    this.showDialog = false;
    this.showWinDialog = false;
  }
  
  getStarsCount(): number {
    if (this.points >= 15) return 3; // 15 كلمة صحيحة تعطي 3 نجوم
    if (this.points >= 10) return 2; // 10 كلمات صحيحة تعطي نجمتين
    if (this.points >= 5) return 1;  // 5 كلمات صحيحة تعطي نجمة واحدة
    return 0;                        // أقل من 5 كلمات لا تعطي أي نجمة
  }
  
goBack() {
  this.gameflag = false;
  clearInterval(this.intervalId);
  this.timeLeft = this.maxTime;
}
}
