# 🚀 Lộ Trình Triển Khai: Best Time to Post AI (XGBoost)

Sau khi đã hoàn tất việc Seed dữ liệu, đây là quy trình 4 bước để bạn sở hữu tính năng gợi ý "Giờ Đăng Vàng" sử dụng Trí Tuệ Nhân Tạo.

---

## 📅 Bước 1: Trích xuất dữ liệu (Data Extraction)
Chúng ta cần chuyển dữ liệu từ **MongoDB** sang định dạng **CSV** để các thư viện Machine Learning của Python có thể đọc được.

### 📝 Nhiệm vụ:
Tạo file `src/seed/export.data.ts` trong backend để quét toàn bộ Post và Interaction.

### 📊 Cấu trúc File CSV (`training_data.csv`):
| Feature | Giải thích |
| :--- | :--- |
| `day_of_week` | Thứ trong tuần (0-6) |
| `hour_of_day` | Giờ đăng bài (0-23) |
| `is_weekend` | 1 nếu là T7/CN, 0 nếu là ngày thường |
| `content_length` | Độ dài văn bản của bài viết |
| `has_image` | 1 nếu có ảnh, 0 nếu không |
| `has_video` | 1 nếu có video, 0 nếu không |
| `engagement_score` | **(Target)** Điểm tương tác tổng hợp (Like*1 + Comment*2 + Save*4) |

---

## 🧠 Bước 2: Huấn luyện mô hình (ML Training)
Sử dụng ngôn ngữ **Python** và thư viện **XGBoost Regressor** để tìm ra quy luật từ file CSV.

### 🛠 Công cụ cần thiết:
- **Python 3.10+**
- Thư viện: `pandas`, `xgboost`, `scikit-learn`, `joblib`

### 🧪 Quy trình:
1. Load file `training_data.csv`.
2. Chia dữ liệu thành 2 phần: **Train (80%)** và **Test (20%)**.
3. Huấn luyện **XGBoost Regressor** để dự đoán `engagement_score` dựa trên các Features.
4. Xuất mô hình ra file Định dạng `.joblib` hoặc `.json`.

---

## ⚡ Bước 3: Xây dựng Python Microservice
Chúng ta sẽ tạo một Web Service nhỏ bằng **FastAPI** để phục vụ việc dự đoán.

### 🔌 API Endpoint dự kiến:
`POST /predict-best-time`
- **Input**: `userId` (để lấy lịch sử riêng) hoặc các đặc điểm bài viết dự định đăng.
- **Output**: 
  - `recommended_hour`: Giờ tốt nhất (VD: 20h)
  - `expected_score`: Điểm tương tác dự kiến.
  - `gemini_advice`: Lời khuyên tự nhiên (VD: "Người theo dõi của bạn thường thức muộn vào tối Thứ 6, hãy đăng vào lúc 21h nhé!")

---

## 🔗 Bước 4: Tích hợp vào hệ thống hiện tại
Kết nối Node.js Backend với Python Microservice.

### 🔄 Luồng dữ liệu:
1. Người dùng mở Modal "Add Post" và chọn **"AI Suggest Best Time"**.
2. **Node.js** gửi yêu cầu sang **Python Service**.
3. **Python Service** dùng XGBoost dự đoán -> Gửi kết quả cho **Gemini** để viết lời khuyên.
4. Kết quả trả về **Frontend** hiển thị cho người dùng.

---

## ✅ Hành động tiếp theo ngay bây giờ:
Tôi sẽ giúp bạn viết file **`src/seed/export.data.ts`** để bạn có thể lấy ngay file CSV đầu tiên. Bạn có muốn thực hiện việc trích xuất dữ liệu ngay lúc này không?
