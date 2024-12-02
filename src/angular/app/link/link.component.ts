import { Component ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';


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
  grid: { id: string; points: string; color: string | null }[] = [];

  green: string = '#52a39d'; // لون اللاعب الأخضر
  navy: string = '#0f2837'; // لون اللاعب الكحلي
  currentPlayer: string = this.green; // اللاعب الحالي
  winner: string | null = null; // متغير لتخزين الفائز

  parent: number[] = []; // مصفوفة الأب في خوارزمية Union-Find
  rank: number[] = []; // مصفوفة الرتب في خوارزمية Union-Find

  directions = [
    { dx: 1, dy: 0 },  // يمين
    { dx: -1, dy: 0 }, // يسار
    { dx: 0, dy: -1 }, // أعلى يسار
    { dx: 1, dy: -1 }, // أعلى يمين
    { dx: 0, dy: 1 },  // أسفل يسار
    { dx: -1, dy: 1 }, // أسفل يمين
  ];

  constructor() {}

  ngOnInit(): void {
    this.initializeGrid();
    this.initializeUnionFind();
  }

  /**
   * تهيئة الشبكة السداسية
   */
  initializeGrid(): void {
    const width = this.HEX_RADIUS * Math.sqrt(3);
    const height = this.HEX_RADIUS * 2;
    const offsetY = height * 0.75;
    const offsetX = width;

    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        const x = col * offsetX + (row % 2 === 1 ? offsetX / 2 : 0);
        const y = row * offsetY;

        this.grid.push({
          id: `cell-${row}-${col}`,
          points: this.calculateHexPoints(x, y),
          color: null,
        });
      }
    }
  }

  /**
   * تهيئة خوارزمية Union-Find
   */
  initializeUnionFind(): void {
    const totalCells = this.GRID_SIZE * this.GRID_SIZE;
    this.parent = Array.from({ length: totalCells }, (_, i) => i);
    this.rank = Array.from({ length: totalCells }, () => 0);
  }

  /**
   * حساب نقاط المضلع السداسي
   */
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

  /**
   * معالجة نقر الخلية
   */
  handleCellClick(cell: { points: string; color: string | null }, index: number): void {
    if (cell.color || this.winner) return; // منع التعديل إذا كانت الخلية ملوّنة أو إذا كان هناك فائز

    this.grid[index].color = this.currentPlayer;

    // تحقق من الاتصال مع الجيران
    const row = Math.floor(index / this.GRID_SIZE);
    const col = index % this.GRID_SIZE;
    this.connectNeighbors(row, col, this.currentPlayer);

    // التحقق من الفائز
    if (this.checkForWin(this.currentPlayer)) {
      this.winner = this.currentPlayer;
      return;
    }

    // تبديل اللاعب
    this.currentPlayer = this.currentPlayer === this.green ? this.navy : this.green;
  }

/**
 * التحقق من الجيران وتوصيلهم عبر المسار
 */
connectNeighbors(row: number, col: number, color: string): void {
  const index = row * this.GRID_SIZE + col;
  
  // تحقق من الاتصال بالجيران المباشرين
  for (const { dx, dy } of this.directions) {
    const newRow = row + dy;
    const newCol = col + dx;

    // تحقق من صلاحية الإحداثيات
    if (newRow >= 0 && newRow < this.GRID_SIZE && newCol >= 0 && newCol < this.GRID_SIZE) {
      const neighborIndex = newRow * this.GRID_SIZE + newCol;

      // تحقق إذا كان الجار يحمل نفس اللون
      if (this.grid[neighborIndex].color === color) {
        // قم بتوصيل الخلايا
        this.union(index, neighborIndex);
      }
    }
  }

  // بعد التحقق من الجيران المباشرين، تأكد من اتصال الخلايا عبر المسارات
  this.checkForConnectedComponents(index, color);
}

/**
 * فحص الاتصالات عبر المسارات
 */
checkForConnectedComponents(index: number, color: string): void {
  const row = Math.floor(index / this.GRID_SIZE);
  const col = index % this.GRID_SIZE;

  // فحص كل خلية من الخلايا لمعرفة ما إذا كانت متصلة بنفس اللون عبر المسار
  for (let r = 0; r < this.GRID_SIZE; r++) {
    for (let c = 0; c < this.GRID_SIZE; c++) {
      const currentIndex = r * this.GRID_SIZE + c;
      if (this.grid[currentIndex].color === color) {
        // تأكد إذا كانت هذه الخلية متصلة عبر المسار
        if (this.find(currentIndex) === this.find(index)) {
          // قم بتوصيل هذه الخلايا
          this.union(currentIndex, index);
        }
      }
    }
  }
}



  /**
   * خوارزمية Union-Find: إيجاد الأب
   */
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // ضغط المسار
    }
    return this.parent[x];
  }

  /**
   * خوارزمية Union-Find: الدمج
   */
  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX !== rootY) {
      if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX;
      } else if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY;
      } else {
        this.parent[rootY] = rootX;
        this.rank[rootX]++;
      }
    }
  }

 /**
 * التحقق من فوز اللاعب
 */
checkForWin(color: string): boolean {
  const topSet = new Set<number>();
  const bottomSet = new Set<number>();
  const leftSet = new Set<number>();
  const rightSet = new Set<number>();

  for (let row = 0; row < this.GRID_SIZE; row++) {
    for (let col = 0; col < this.GRID_SIZE; col++) {
      const index = row * this.GRID_SIZE + col;

      if (this.grid[index].color === color) {
        // تحقق من الخلايا في الصفوف الأولى والأخيرة
        if (row === 0) topSet.add(this.find(index));
        if (row === this.GRID_SIZE - 1) bottomSet.add(this.find(index));

        // تحقق من الخلايا في الأعمدة الأولى والأخيرة
        if (col === 0) leftSet.add(this.find(index));
        if (col === this.GRID_SIZE - 1) rightSet.add(this.find(index));
      }
    }
  }

  // فوز الأخضر (اتصال من الأعلى إلى الأسفل)
  for (const topRoot of topSet) {
    if (bottomSet.has(topRoot)) {
      return true;
    }
  }

  // فوز الكحلي (اتصال من اليسار إلى اليمين)
  for (const leftRoot of leftSet) {
    if (rightSet.has(leftRoot)) {
      return true;
    }
  }

  return false;
}

}
