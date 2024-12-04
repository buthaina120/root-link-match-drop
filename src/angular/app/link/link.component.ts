import { Component ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HexCell {
  id: string; // معرّف فريد للخلية
  points: string; // إحداثيات النقاط للرسم (SVG)
  color: string | null; // لون الخلية (يمثل اللاعب)
  coordinates: { q: number; r: number; s: number }; // الإحداثيات الثلاثية
  letter: string; // النص داخل الخلية
}

export interface Question {
  letter: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './link.component.html',
  styleUrl: './link.component.css'
})
export class LinkComponent {
// إعدادات الشبكة
HEX_RADIUS: number = 40; // نصف قطر الخلية السداسية
GRID_SIZE: number = 5; // حجم الشبكة (5x5)
grid: HexCell[] = [];
currentQuestion: Question | null = null; // سؤال اللعبة الحالي
wrongAnswer: string = '';

green: string = '#52a39d'; // لون اللاعب الأخضر
navy: string = '#0f2837'; // لون اللاعب الكحلي
currentPlayer: string = this.green; // اللاعب الحالي
winner: string | null = null; // متغير لتخزين الفائز


constructor() {}

ngOnInit(): void {
  this.initializeGrid();
}


 //تهيئة الشبكة السداسية
initializeGrid(): void {
 const width = this.HEX_RADIUS * Math.sqrt(3);
 const height = this.HEX_RADIUS * 2;
 const offsetY = height * 0.75; // المسافة الرأسية بين الصفوف
 const offsetX = width;        // المسافة الأفقية بين الأعمدة

 const arabicLetters = [
   'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ',
   'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع',
   'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
 ];

 // خلط الحروف وضمان كفايتها
 const shuffledLetters = [...arabicLetters];
 for (let i = shuffledLetters.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
 }
 while (shuffledLetters.length < this.GRID_SIZE * this.GRID_SIZE) {
   shuffledLetters.push(...arabicLetters.sort(() => Math.random() - 0.5));
 }

 for (let r = 0; r < this.GRID_SIZE; r++) { // الصفوف
   for (let q = 0; q < this.GRID_SIZE; q++) { // الأعمدة
     const s = -q - r; // حساب s بناءً على القاعدة

     // حساب موضع الخلية (x, y) في العرض
     const x = q * offsetX + (r % 2 === 1 ? offsetX / 2 : 0); // تعويض الصفوف المائلة
     const y = r * offsetY;
     const letter = shuffledLetters.pop()!;
    
     // إنشاء الخلية
     const cell: HexCell = {
       id: `cell-${q}-${r}-${s}`,
       points: this.calculateHexPoints(x, y),
       color: null,
       coordinates: { q, r, s },
       letter: letter, 
     };

     this.grid.push(cell);
   }
 }
}





 //حساب نقاط المضلع السداسي
calculateHexPoints(x: number, y: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (Math.PI / 3) * i;
    const px = x + this.HEX_RADIUS * Math.cos(angle);
    const py = y + this.HEX_RADIUS * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(' ');
}

//ضمان أن النص يظهر في مركز الخلية
getTextPosition(points: string): { x: number; y: number } {
 const coordinates = points.split(' ').map(point => {
   const [x, y] = point.split(',').map(Number);
   return { x, y };
 });

 // حساب المركز
 const centerX = coordinates.reduce((sum, coord) => sum + coord.x, 0) / coordinates.length;
 const centerY = coordinates.reduce((sum, coord) => sum + coord.y, 0) / coordinates.length;

 return { x: centerX, y: centerY };
}


// معالجة نقر الخلية
/* handleCellClick(cell: HexCell, index: number): void {
 if (cell.color || this.winner) return;

 // تغيير لون الخلية
 this.grid[index].color = this.currentPlayer;

 // جلب الجيران
 const neighbors = this.getNeighbors(cell);


   // تحقق من وجود فائز
   if (this.checkConnection(this.currentPlayer)) {
     this.winner = this.currentPlayer; // حفظ لون الفائز
     console.log(`الفائز هو: ${this.winner === this.green ? 'الأخضر' : 'الكحلي'}`);
     return;
   }

   
 // تبديل اللاعب
 this.currentPlayer = this.currentPlayer === this.green ? this.navy : this.green;

   // تغيير لون الجيران إلى الرمادي
   neighbors.forEach(({ neighbor }) => {
     const neighborIndex = this.grid.findIndex(c => c.id === neighbor.id);
     if (neighborIndex !== -1) {
       this.grid[neighborIndex].color = '#d3d3d3'; // اللون الرمادي
     }
   });

}*/

handleCellClick(cell: HexCell, index: number): void {
 if (cell.color || this.winner || !this.questionsMap[cell.letter]) return;

 // إظهار السؤال الحالي
 this.currentQuestion = {
   letter: cell.letter,
   question: this.questionsMap[cell.letter].question,
   options: this.questionsMap[cell.letter].options,
   correctAnswer: this.questionsMap[cell.letter].correctAnswer,
 };

 // تخزين الفهرس الحالي لمعالجة الإجابة لاحقًا
 this.wrongAnswer = '';
}

checkAnswer(answer: string): void {
 if (!this.currentQuestion) return;

 const isCorrect = answer === this.currentQuestion.correctAnswer;

 if (isCorrect) {
   // إذا كانت الإجابة صحيحة، يتم تلوين الخلية
   const index = this.grid.findIndex(cell => cell.letter === this.currentQuestion?.letter);
   if (index !== -1) {
     this.grid[index].color = this.currentPlayer;
   }

   // تحقق من وجود فائز
   if (this.checkConnection(this.currentPlayer)) {
     this.winner = this.currentPlayer; // حفظ لون الفائز
     console.log(`الفائز هو: ${this.winner === this.green ? 'الأخضر' : 'الكحلي'}`);
   }

   // إعادة ضبط السؤال الحالي مباشرة
   this.currentQuestion = null;

   // إذا لم يكن هناك فائز، تبديل اللاعب
   if (!this.winner) {
     this.currentPlayer = this.currentPlayer === this.green ? this.navy : this.green;
   }
 } else {
   // إذا كانت الإجابة خاطئة
   this.wrongAnswer = `الإجابة خاطئة!`;

   // تأخير تبديل اللاعب وإزالة السؤال لمدة ثانيتين
   setTimeout(() => {
     this.wrongAnswer = ''; // إزالة الرسالة
     this.currentPlayer = this.currentPlayer === this.green ? this.navy : this.green; // تبديل اللاعب
     this.currentQuestion = null; // إعادة ضبط السؤال الحالي
   }, 2000);
 }
}



getNeighbors(cell: HexCell): { direction: string; neighbor: HexCell }[] {
 const { q, r, s } = cell.coordinates;

 // الاتجاهات بالإزاحات الصحيحة
 const directions = [
   { name: 'يمين', dq: 1, dr: 0, ds: -1 },
   { name: 'أعلى يمين', dq: 1, dr: -1, ds: 0 },
   { name: 'أعلى يسار', dq: 0, dr: -1, ds: 1 },
   { name: 'يسار', dq: -1, dr: 0, ds: 1 },
   { name: 'أسفل يسار', dq: -1, dr: 1, ds: 0 },
   { name: 'أسفل يمين', dq: 0, dr: 1, ds: -1 },
 ];

 // تعديل الاتجاهات إذا كان الصف فرديًا
 if (r % 2 !== 0) {
   // تعديل الجيران السفليين
   directions[4] = { name: 'أسفل يسار', dq: 0, dr: 1, ds: -1 };
   directions[5] = { name: 'أسفل يمين', dq: 1, dr: 1, ds: -2 };
 }

// تعديل الاتجاهات إذا كان الصف زوجيًا
if (r % 2 === 0) {
 // تعديل الجيران العلويين لتكون الخلايا المجاورة من جهة اليسار
 directions[1] = { name: 'أعلى يمين', dq: 0, dr: -1, ds: 1 };  // الخلية المجاورة من جهة اليسار
 directions[2] = { name: 'أعلى يسار', dq: -1, dr: -1, ds: 2 }; // تحديد الخلية المجاورة من اليسار
}




 // البحث عن الجيران بناءً على الإزاحات
 const neighbors = directions
   .map(dir => {
     const neighborQ = q + dir.dq;
     const neighborR = r + dir.dr;
     const neighborS = s + dir.ds;

     // البحث عن الخلية بالجوار
     const neighbor = this.grid.find(c =>
       c.coordinates.q === neighborQ &&
       c.coordinates.r === neighborR &&
       c.coordinates.s === neighborS
     );

     return neighbor ? { direction: dir.name, neighbor } : null;
   })
   .filter(n => n !== null) as { direction: string; neighbor: HexCell }[];


 return neighbors;
}



checkConnection(playerColor: string): boolean {
 // فحص الاتصال من الأعلى إلى الأسفل
 const topCells = this.grid.filter(cell => 
   cell.coordinates.r === 0 && cell.color === playerColor
 );

 const bottomRow = this.GRID_SIZE - 1;

 for (const cell of topCells) {
   if (this.bfs(cell, playerColor, 'vertical', bottomRow)) {
     return true;
   }
 }

 // فحص الاتصال من اليمين إلى اليسار
 const leftCells = this.grid.filter(cell => 
   cell.coordinates.q === 0 && cell.color === playerColor
 );

 const rightColumn = this.GRID_SIZE - 1;

 for (const cell of leftCells) {
   if (this.bfs(cell, playerColor, 'horizontal', rightColumn)) {
     return true;
   }
 }

 return false;
}



bfs(startCell: HexCell, playerColor: string, direction: 'vertical' | 'horizontal', target: number): boolean {
 const queue: HexCell[] = [startCell]; // طابور BFS
 const visited = new Set<string>();
 visited.add(startCell.id); // إضافة الخلية المبدئية إلى قائمة الزيارات

 while (queue.length > 0) {
   const currentCell = queue.shift(); // إزالة أول خلية من الطابور
   if (!currentCell) continue;


   // الشرط النهائي حسب الاتجاه
   if (direction === 'vertical' && currentCell.coordinates.r === target) {
     return true;
   }
   if (direction === 'horizontal' && currentCell.coordinates.q === target) {
     return true;
   }

   // العثور على الجيران غير المزورين بنفس اللون
   const neighbors = this.getNeighbors(currentCell).filter(({ neighbor }) =>
     neighbor.color === playerColor && !visited.has(neighbor.id)
   );


   for (const { neighbor } of neighbors) {
     queue.push(neighbor); // إضافة الجيران إلى الطابور
     visited.add(neighbor.id); // تحديث قائمة الزيارات
   }
 }

 return false; // إذا انتهى الطابور ولم نصل إلى الهدف
}



questionsMap: { [key: string]: { question: string; options: string[]; correctAnswer: string } } = {
 'أ': {
   question: 'أداة دقيقة، من المعدن، أحد طرفيها محدَّد والآخر مثقوب، يُخاط بها.',
   options: ['إبرة', 'أداة', 'أمواس', 'أرض'],
   correctAnswer: 'إبرة',
 },
 'ب': {
   question: 'مركز أو نقطة تجمُّع',
   options: ['بيت', 'بؤرة', 'بناء', 'بلورة'],
   correctAnswer: 'بؤرة',
 },
 'ت': {
   question: 'النطق بكلام غير مفهوم.',
   options: ['تهامس', 'تلعثم', 'تأتأة', 'تمتمة'],
   correctAnswer: 'تمتمة',
 },
 'ث': {
   question: 'طبقة التراب التي تغطي سطح الأرض.',
   options: ['ثري', 'ثرى', 'ثريا', 'ثمر'],
   correctAnswer: 'ثرى',
 },
 'ج': {
   question: 'ضخم أو بدين.',
   options: ['جبار', 'جثة', 'جسيم', 'جسم'],
   correctAnswer: 'جسيم',
 },
 'ح': {
   question: 'سرور، وبهجة.',
   options: ['حماسة', 'حرية', 'حبر', 'حبور'],
   correctAnswer: 'حبور',
 },
 'خ': {
   question: 'تحويل ملكية بعض منشآت الدولة من الحكومة إلى القطاع الخاص، من أجل تحسين الأداء فيها.',
   options: ['خلافة', 'خصخصة', 'خدمة', 'خطة'],
   correctAnswer: 'خصخصة',
 },
 'د': {
   question: ' ثمار الخوخ.',
   options: ['درف', 'دُبّاء', 'دورق', 'دراق'],
   correctAnswer: 'خصخصة',
 },
 'ذ': {
   question: 'قياس الشيء طولًا.',
   options: ['ذرع', 'ذراع', 'ذروة', 'ذمة'],
   correctAnswer: 'ذرع',
 },
 'ر': {
   question: 'نِفَاق، مُرَاءاة وسُمعَة.',
   options: ['رئاء', 'رؤية', 'رياء', 'رأي'],
   correctAnswer: 'رئاء'
 },
 'ز': {
   question: 'جماعة أو فوج.',
   options: ['زمرة', 'زبانية', 'زود', 'زخرف'],
   correctAnswer: 'زمرة'
 },
 'س': {
   question: 'تَحَدَّثَ مع جَليسِِ لَيْلََا',
   options: ['سمر', 'سمير', 'سور', 'سهم'],
   correctAnswer: 'سمر'
},
'ش': {
   question: 'نبات عشبي، ينتج حبوبا يصنع منها الخبز.',
   options: ['شعر', 'شمندر', 'شجرة', 'شعير'],
   correctAnswer: 'شعير'
},
'ص': {
   question: 'شدة الحرارة الناتجة من الحر.',
   options: ['صعر', 'صهر', 'صهد', 'صبر'],
   correctAnswer: 'صهد'
},
'ض': {
   question: 'شدة النفس عند العدو.',
   options: ['ضبح', 'ضحك', 'ضغط', 'ضوء'],
   correctAnswer: 'ضبح'
},
'ط': {
   question: 'ضامِرُ البَطْنِ خِلْقَةً أَو جوعًا',
   options: ['طوي', 'طيف', 'طوى', 'طول'],
   correctAnswer: 'طوي'
},
'ظ': {
   question: 'معاون، ومناصر، وهي للواحد والجمع.',
   options: ['ظهر', 'ظهير', 'ظرف', 'ظاهر'],
   correctAnswer: 'ظهير'
},
'ع': {
   question: 'منطقة أو حجرة كبيرة تحتوي على أسرة متعددة يجتمع فيها مجموعة من الجنود أو المرضى أو نحوهما.',
   options: ['عنبر', 'عقر', 'علم', 'عقار'],
   correctAnswer: 'عنبر'
},
'غ': {
   question: 'مجاوزة حد الاعتدال المطلوب من المسلم أن يلتزم به.',
   options: ['غل', 'غضب', 'غلو', 'غلظ'],
   correctAnswer: 'غلو'
},
'ف': {
   question: 'الصبح ينشق من ظلمة الليل.',
   options: ['فلق', 'فم', 'فكرة', 'فجر'],
   correctAnswer: 'فلق'
},
'ق': {
   question: 'جزء من المال المقسمة جملته على آجال محددة',
   options: ['قسط', 'قصد', 'قيد', 'قوة'],
   correctAnswer: 'قسط'
},
'ك': {
   question: 'معتمِد على غيره.',
   options: ['كل', 'كلالة', 'كيل', 'كل'],
   correctAnswer: 'كل'
},
'ل': {
   question: 'إقامة في مكان ثابت وعدم مفارقته.',
   options: ['لبود', 'لاجئ', 'لجاج', 'لحظة'],
   correctAnswer: 'لبود'
},
'م': {
   question: 'الطَّعامُ يُجمع للسَّفر ونحوه.',
   options: ['ميرة', 'معونة', 'مئونة', 'مدد'],
   correctAnswer: 'ميرة'
},
'ن': {
   question: 'أَصْلُ الإِنْسَانِ وَحَسَبُهُ وطَبْعُهُ وطَبِيعَتُهُ',
   options: ['نجر', 'نيل', 'نسب', 'نجم'],
   correctAnswer: 'نجر'
},
'ه': {
   question: 'كل ما لا يتفق مع القواعد الأساسية لدين من الأديان.',
   options: ['هرطقة', 'هجاء', 'هبوط', 'همس'],
   correctAnswer: 'هرطقة'
},
'و': {
   question: 'لمعان البرق.',
   options: ['ومض', 'وميض', 'وهج', 'وجه'],
   correctAnswer: 'ومض'
},
'ي': {
   question: 'حشرة تضيء في الظلام من فصيلة اليَرَاعِيَّات.',
   options: ['يراع', 'يوم', 'يختل', 'يعسوب'],
   correctAnswer: 'يراع'
},
};




}