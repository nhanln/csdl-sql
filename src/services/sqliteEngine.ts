/**
 * SQLite WASM Engine Service
 * Sử dụng WebAssembly SQLite (sql.js) để chạy trực tiếp trên Client-side.
 * Cung cấp khả năng nạp CSDL, thực thi truy vấn, trích xuất lược đồ (Schema Introspection)
 * và phân tích kế hoạch thực thi (EXPLAIN QUERY PLAN).
 */
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

export interface QueryResult {
  columns: string[];
  values: any[][];
  executionTimeMs: number;
  rowCount: number;
  affectedRows?: number;
  isSelect: boolean;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface TableSchema {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
  sampleData: any[][];
}

// Dữ liệu mẫu cơ sở dữ liệu Quản lý Trường học (School Management)
export const SEED_SQL = `
-- 1. BẢNG LỚP HỌC (LopHoc)
CREATE TABLE IF NOT EXISTS LopHoc (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ten_lop TEXT NOT NULL,
  gvcn TEXT NOT NULL,
  phong_hoc TEXT NOT NULL
);

INSERT INTO LopHoc (id, ten_lop, gvcn, phong_hoc) VALUES
(1, '10A1', 'Thầy Nguyễn Văn Toàn', 'P.201'),
(2, '10A2', 'Cô Trần Thị Hương', 'P.202'),
(3, '11A1', 'Thầy Lê Hoàng Long', 'P.301'),
(4, '11B1', 'Cô Phạm Mai Phương', 'P.302'),
(5, '12A1', 'Thầy Vũ Đình Trọng', 'P.401'),
(6, '12A2', 'Cô Đỗ Thu Hà', 'P.402'),
(7, '10B2', 'Thầy Hoàng Minh Đức', 'P.203'),
(8, '11A2', 'Cô Bùi Kim Oanh', 'P.303'),
(9, '12B1', 'Thầy Ngô Quốc Tuấn', 'P.403'),
(10, '10A3', 'Cô Đặng Thúy Kiều', 'P.204');

-- 2. BẢNG HỌC SINH (HocSinh)
CREATE TABLE IF NOT EXISTS HocSinh (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ho_ten TEXT NOT NULL,
  gioi_tinh TEXT NOT NULL,
  ngay_sinh DATE NOT NULL,
  que_quan TEXT NOT NULL,
  lop_id INTEGER REFERENCES LopHoc(id)
);

INSERT INTO HocSinh (id, ho_ten, gioi_tinh, ngay_sinh, que_quan, lop_id) VALUES
(1, 'Nguyễn An Khang', 'Nam', '2008-03-15', 'Hà Nội', 1),
(2, 'Trần Bảo Ngọc', 'Nữ', '2008-07-22', 'Hà Nội', 1),
(3, 'Lê Quốc Cường', 'Nam', '2008-11-05', 'Hải Phòng', 1),
(4, 'Phạm Diệu Linh', 'Nữ', '2008-01-30', 'Nam Định', 2),
(5, 'Hoàng Minh Đức', 'Nam', '2008-09-18', 'Hà Nội', 2),
(6, 'Vũ Hải Yến', 'Nữ', '2007-04-12', 'Đà Nẵng', 3),
(7, 'Đỗ Gia Huy', 'Nam', '2007-08-25', 'Hà Nội', 3),
(8, 'Bùi Thảo Trang', 'Nữ', '2007-12-03', 'Bắc Ninh', 4),
(9, 'Ngô Đình Trọng', 'Nam', '2007-06-19', 'Hải Phòng', 4),
(10, 'Đinh Quỳnh Nga', 'Nữ', '2006-02-14', 'Hà Nội', 5),
(11, 'Dương Tuấn Kiệt', 'Nam', '2006-10-09', 'Nghệ An', 5),
(12, 'Lý Mỹ Uyên', 'Nữ', '2006-05-27', 'TP. Hồ Chí Minh', 6),
(13, 'Phan Nhật Minh', 'Nam', '2006-12-31', 'Hà Nội', 6),
(14, 'Mai Hồng Nhung', 'Nữ', '2008-08-10', 'Thái Bình', 7),
(15, 'Trương Quang Dũng', 'Nam', '2007-03-04', 'Quảng Ninh', 8);

-- 3. BẢNG ĐIỂM SỐ (DiemSo)
CREATE TABLE IF NOT EXISTS DiemSo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hoc_sinh_id INTEGER REFERENCES HocSinh(id),
  mon_hoc TEXT NOT NULL,
  diem REAL NOT NULL,
  hoc_ky INTEGER NOT NULL
);

INSERT INTO DiemSo (id, hoc_sinh_id, mon_hoc, diem, hoc_ky) VALUES
(1, 1, 'Toán', 9.5, 1),
(2, 1, 'Văn', 8.0, 1),
(3, 1, 'Anh', 9.0, 1),
(4, 2, 'Toán', 8.5, 1),
(5, 2, 'Văn', 9.0, 1),
(6, 2, 'Anh', 9.5, 1),
(7, 3, 'Toán', 6.5, 1),
(8, 3, 'Văn', 7.0, 1),
(9, 3, 'Anh', 7.5, 1),
(10, 4, 'Toán', 9.0, 1),
(11, 4, 'Văn', 8.5, 1),
(12, 4, 'Anh', 8.0, 1),
(13, 5, 'Toán', 7.0, 1),
(14, 5, 'Văn', 6.5, 1),
(15, 5, 'Anh', 8.0, 1),
(16, 6, 'Toán', 9.0, 1),
(17, 6, 'Văn', 8.5, 1),
(18, 6, 'Lý', 9.5, 1),
(19, 7, 'Toán', 8.0, 1),
(20, 7, 'Lý', 8.5, 1),
(21, 10, 'Toán', 9.8, 1),
(22, 10, 'Lý', 9.5, 1),
(23, 10, 'Hóa', 9.0, 1),
(24, 11, 'Toán', 7.5, 1),
(25, 11, 'Lý', 8.0, 1),
(26, 12, 'Toán', 8.5, 1),
(27, 12, 'Văn', 9.2, 1);
`;

class SqliteEngine {
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Khởi tạo WebAssembly SQLite engine
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.SQL = await initSqlJs({
          locateFile: (file) => {
            // Thử load file wasm từ public, nếu không thì dùng cdnjs
            if (typeof window !== 'undefined') {
              return `/sql-wasm.wasm`;
            }
            return file;
          },
        });

        this.db = new this.SQL.Database();
        this.db.run(SEED_SQL);
        console.log('[SQLite WASM] Database initialized and seeded successfully.');
      } catch (err) {
        console.warn('[SQLite WASM] Local WASM fetch failed, falling back to CDN...', err);
        // Fallback CDN
        this.SQL = await initSqlJs({
          locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`,
        });
        this.db = new this.SQL.Database();
        this.db.run(SEED_SQL);
        console.log('[SQLite WASM] Database initialized via CDN fallback.');
      }
    })();

    return this.initPromise;
  }

  /**
   * Đặt lại cơ sở dữ liệu về trạng thái ban đầu
   */
  async resetDatabase(): Promise<void> {
    await this.init();
    if (!this.SQL) return;
    if (this.db) {
      this.db.close();
    }
    this.db = new this.SQL.Database();
    this.db.run(SEED_SQL);
  }

  /**
   * Thực thi câu lệnh SQL do người dùng nhập
   */
  async executeQuery(sqlText: string): Promise<QueryResult> {
    await this.init();
    if (!this.db) throw new Error('Cơ sở dữ liệu SQLite chưa được khởi tạo.');

    const trimmed = sqlText.trim();
    if (!trimmed) {
      return {
        columns: [],
        values: [],
        executionTimeMs: 0,
        rowCount: 0,
        isSelect: true,
      };
    }

    const startTime = performance.now();
    const isSelect = /^(SELECT|WITH|PRAGMA|EXPLAIN)/i.test(trimmed);

    try {
      if (isSelect) {
        const res = this.db.exec(trimmed);
        const endTime = performance.now();
        const duration = Math.round((endTime - startTime) * 100) / 100;

        if (res.length === 0) {
          return {
            columns: [],
            values: [],
            executionTimeMs: duration,
            rowCount: 0,
            isSelect: true,
          };
        }

        const firstResult = res[0];
        return {
          columns: firstResult.columns,
          values: firstResult.values,
          executionTimeMs: duration,
          rowCount: firstResult.values.length,
          isSelect: true,
        };
      } else {
        // Câu lệnh DDL / DML (INSERT, UPDATE, DELETE, CREATE, DROP...)
        this.db.run(trimmed);
        const endTime = performance.now();
        const duration = Math.round((endTime - startTime) * 100) / 100;
        
        // Đếm số dòng bị ảnh hưởng
        const rowsModifiedResult = this.db.exec("SELECT changes() AS affected;");
        const affected = rowsModifiedResult.length > 0 ? (rowsModifiedResult[0].values[0][0] as number) : 0;

        return {
          columns: ['Kết quả thực thi'],
          values: [[`Thực thi thành công (${affected} dòng bị ảnh hưởng)`]],
          executionTimeMs: duration,
          rowCount: 1,
          affectedRows: affected,
          isSelect: false,
        };
      }
    } catch (err: any) {
      const endTime = performance.now();
      const duration = Math.round((endTime - startTime) * 100) / 100;
      throw new Error(err?.message || String(err));
    }
  }

  /**
   * Chạy EXPLAIN QUERY PLAN để xem kế hoạch thực thi câu lệnh
   */
  async explainQueryPlan(sqlText: string): Promise<QueryResult> {
    const cleanSql = sqlText.trim().replace(/;+$/, '');
    const explainSql = `EXPLAIN QUERY PLAN ${cleanSql};`;
    return this.executeQuery(explainSql);
  }

  /**
   * Lấy danh sách toàn bộ bảng và lược đồ chi tiết (Schema Introspection)
   */
  async getSchema(): Promise<TableSchema[]> {
    await this.init();
    if (!this.db) return [];

    const tablesRes = this.db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
    );

    if (tablesRes.length === 0) return [];

    const tableNames = tablesRes[0].values.map((row) => row[0] as string);
    const schemas: TableSchema[] = [];

    for (const tableName of tableNames) {
      // 1. Lấy thông tin cột
      const columnsRes = this.db.exec(`PRAGMA table_info("${tableName}");`);
      const columns: ColumnInfo[] = columnsRes.length > 0
        ? columnsRes[0].values.map((c) => ({
            cid: c[0] as number,
            name: c[1] as string,
            type: c[2] as string,
            notnull: c[3] as number,
            dflt_value: c[4],
            pk: c[5] as number,
          }))
        : [];

      // 2. Lấy số lượng dòng
      const countRes = this.db.exec(`SELECT COUNT(*) FROM "${tableName}";`);
      const rowCount = countRes.length > 0 ? (countRes[0].values[0][0] as number) : 0;

      // 3. Lấy 5 dòng dữ liệu mẫu
      const sampleRes = this.db.exec(`SELECT * FROM "${tableName}" LIMIT 5;`);
      const sampleData = sampleRes.length > 0 ? sampleRes[0].values : [];

      schemas.push({
        name: tableName,
        columns,
        rowCount,
        sampleData,
      });
    }

    return schemas;
  }

  /**
   * Sinh chuỗi văn bản mô tả Schema dùng cho prompt AI
   */
  async getSchemaContextString(): Promise<string> {
    const schemas = await this.getSchema();
    return schemas
      .map((table) => {
        const cols = table.columns
          .map((c) => `${c.name} (${c.type}${c.pk ? ', PRIMARY KEY' : ''}${c.notnull ? ', NOT NULL' : ''})`)
          .join(', ');
        return `Table: ${table.name} [${cols}] (Tổng số dòng: ${table.rowCount})`;
      })
      .join('\n');
  }

  /**
   * So sánh kết quả của câu truy vấn học viên với câu giải mẫu
   */
  async checkSolution(
    userSql: string,
    solutionSql: string
  ): Promise<{ isCorrect: boolean; feedback: string; expectedResult?: QueryResult; userResult?: QueryResult }> {
    try {
      const userRes = await this.executeQuery(userSql);
      const expectedRes = await this.executeQuery(solutionSql);

      // 1. Kiểm tra số cột
      if (userRes.columns.length !== expectedRes.columns.length) {
        return {
          isCorrect: false,
          feedback: `Số lượng cột trả về không khớp. Câu lệnh của bạn trả về ${userRes.columns.length} cột (${userRes.columns.join(', ')}), trong khi đáp án yêu cầu ${expectedRes.columns.length} cột (${expectedRes.columns.join(', ')}).`,
          expectedResult: expectedRes,
          userResult: userRes,
        };
      }

      // 2. Kiểm tra số dòng
      if (userRes.rowCount !== expectedRes.rowCount) {
        return {
          isCorrect: false,
          feedback: `Số lượng dòng trả về không khớp. Bạn nhận được ${userRes.rowCount} dòng, nhưng đáp án có ${expectedRes.rowCount} dòng. Hãy kiểm tra lại điều kiện WHERE hoặc JOIN.`,
          expectedResult: expectedRes,
          userResult: userRes,
        };
      }

      // 3. Chuẩn hoá và so sánh dữ liệu
      // Hàm helper để so sánh 2 giá trị an toàn
      const serialize = (val: any) => {
        if (val === null || val === undefined) return '__NULL__';
        if (typeof val === 'number') return Math.round(val * 100) / 100;
        return String(val).trim().toLowerCase();
      };

      // So sánh dữ liệu từng dòng
      for (let r = 0; r < expectedRes.values.length; r++) {
        const expRow = expectedRes.values[r];
        const userRow = userRes.values[r];

        for (let c = 0; c < expRow.length; c++) {
          if (serialize(expRow[c]) !== serialize(userRow[c])) {
            return {
              isCorrect: false,
              feedback: `Dữ liệu tại dòng ${r + 1}, cột "${userRes.columns[c]}" không khớp với đáp án mẫu. Bạn nhận được: "${userRow[c]}", đáp án mong đợi: "${expRow[c]}". Kiểm tra lại cách sắp xếp ORDER BY hoặc phép tính.`,
              expectedResult: expectedRes,
              userResult: userRes,
            };
          }
        }
      }

      return {
        isCorrect: true,
        feedback: 'Xuất sắc! Kết quả truy vấn của bạn hoàn toàn chính xác với yêu cầu đề bài.',
        expectedResult: expectedRes,
        userResult: userRes,
      };
    } catch (err: any) {
      return {
        isCorrect: false,
        feedback: `Lỗi thực thi: ${err?.message || String(err)}`,
      };
    }
  }

  /**
   * Xuất file cơ sở dữ liệu SQLite nhị phân
   */
  exportDatabaseBinary(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }
}

// Singleton SQLite Engine
export const sqliteService = new SqliteEngine();
