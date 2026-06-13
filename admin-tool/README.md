# Admin Tool — Khám Phá Việt Nam

Local-only tool để tạo SQL migration files. Không kết nối database trực tiếp.

## Chạy

```bash
npm run admin
# Mở http://localhost:3001
```

## Quy trình

1. Điền form → nhấn "Tạo file SQL"
2. File `.sql` được tạo trong `/migrations/generated/`
3. Review file SQL
4. Apply vào database: `sqlite3 database.db < migrations/generated/[filename].sql`

## Quy tắc bắt buộc

- Mỗi sự kiện lịch sử: tối thiểu **2 nguồn độc lập**
- Không tự biên soạn nội dung
- Nguồn ưu tiên: nhandan.vn, vietnamplus.vn, baotanglichsu.vn, bvhttdl.gov.vn
