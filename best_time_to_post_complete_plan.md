# Kế hoạch triển khai hoàn chỉnh: Best Time to Post (Machine Learning + Gemini AI)

## 1. Mục tiêu tính năng

Xây dựng tính năng **Best Time to Post** cho ứng dụng mạng xã hội nhằm:

- Phân tích lịch sử tương tác của người dùng.
- Dự đoán khung giờ đăng bài hiệu quả nhất.
- Cá nhân hóa theo từng tài khoản.
- Dùng Gemini AI để giải thích kết quả tự nhiên, dễ hiểu.

---

## 2. Kiến trúc tổng thể

`Frontend (React)` → `Backend (Node.js/Express)` → `Python ML Service (FastAPI)` → `Gemini AI`

### Vai trò từng thành phần
- **Frontend**: Cung cấp UI tương tác, hiển thị trạng thái Loading và kết quả tư vấn từ AI.
- **Backend (Node.js)**: 
    - Thu thập đặc trưng của User và Post hiện tại.
    - Làm trung gian điều phối dữ liệu (Orchestrator) giữa ML Service và Gemini.
    - Quản lý Cache kết quả để tối ưu chi phí API.
- **ML Service (Python)**: Xử lý tính toán ma trận, thực hiện dự báo (Inference) bằng model XGBoost.
- **Gemini AI**: Chuyển đổi dữ liệu số khô khan thành thông điệp tư vấn có giá trị và cá nhân hóa.

---

## 3. Quy trình vận hành (Workflow)

Khi người dùng nhấn nút **"Best Time to Post"**:

1.  **Data Preparation**: Node.js lấy lịch sử tương tác 30 ngày gần nhất của User.
2.  **Inference Request**: Gửi thông tin (số follower, loại media, lịch sử) sang Python Service.
3.  **Cyclical Simulation**: Python giả lập 24 khung giờ tiếp theo, sử dụng **Sin/Cos Encoding** cho biến giờ để máy hiểu được tính chu kỳ (ví dụ: 23h và 0h là sát nhau).
4.  **Ranking**: Lọc ra Top 3 khung giờ có điểm Engagement cao nhất.
5.  **AI Interpretation**: Gemini nhận danh sách giờ và đưa ra lời giải thích dựa trên các "điểm chạm" (ví dụ: "Người theo dõi của bạn thường online nhiều lúc nghỉ trưa").
6.  **UI Delivery**: Kết quả hiển thị tức thì trên Modal dưới dạng gợi ý thông minh.

---

## 4. Nguồn dữ liệu & Công thức tính

### Nguồn từ MongoDB
- **Post**: `createdAt`, `post` (text length), `imgId`/`videoId`/`gifUrl` (media type).
- **Reaction**: Đếm tổng số reactions (Like, Love, Wow, v.v.).
- **Collection**: Đếm số lượt **Save** (Trọng số lớn nhất vì thể hiện ý định lưu trữ lâu dài).
- **User**: `followersCount`.

### Công thức Engagement Score (Cho mục tiêu huấn luyện)
```text
Engagement Score = (Reactions × 1.0) + (Comments × 2.0) + (Saves × 4.0)
```
*Ghi chú: Điểm được chia cho số lượng followers để đảm bảo tính công bằng (Normalization).*

---

## 5. Đặc trưng huấn luyện (ML Features)

| Feature | Kỹ thuật xử lý | Ý nghĩa |
| :--- | :--- | :--- |
| `hour_sin/cos` | Trigonometric Transform | Giữ tính liên tục của thời gian (23h -> 0h) |
| `day_of_week` | One-Hot Encoding | Phân biệt hành vi Ngày thường vs Cuối tuần |
| `media_type` | Categorical Label | Image, Video, GIF hay chỉ Text |
| `caption_len` | Normalization | Độ dài nội dung ảnh hưởng đến tương tác |
| `user_avg_score` | Historical Average | Sức hút cá nhân của tài khoản trong quá khứ |
| **`TARGET`** | **Regression** | **Dự đoán Engagement Score (số thực)** |

---

## 6. Mô hình dự báo: XGBoost Regressor

**Tại sao chọn XGBoost?**
- Hiệu suất vượt trội trên dữ liệu dạng bảng (Tabular data) so với Deep Learning.
- Hỗ trợ tốt cho dữ liệu bị thiếu hoặc không cân bằng.
- Tốc độ dự báo (Inference) cực nhanh, đáp ứng yêu cầu thời gian thực của mạng xã hội.

---

## 7. Python ML Microservice (FastAPI)

Thư mục: `/ml-service`

### API Endpoint: `POST /predict`
**Payload gửi sang:**
```json
{
  "userId": "user_123",
  "mediaType": "video",
  "captionLength": 120,
  "followerCount": 500,
  "userHistoryScore": 15.5
}
```
**Phản hồi trả về:**
```json
{
  "predictions": [
    { "hour": 20, "confidence": 0.95 },
    { "hour": 21, "confidence": 0.88 },
    { "hour": 12, "confidence": 0.75 }
  ]
}
```

---

## 8. Tích hợp Gemini AI

Gemini không chỉ nhắc lại số giờ, mà nó đóng vai trò **"Trợ lý ngôn ngữ"**.
- **Input**: Danh sách giờ từ ML + Metadata của User.
- **Prompt**: *"Hãy giải thích tại sao 20:00 là giờ tốt cho Bob đăng bài video này, dựa trên việc khán giả của Bob hay tương tác muộn."*
- **Output**: *"Tối nay lúc 20:00 là thời điểm vàng! Dựa trên các video trước, khán giả của bạn rất thích xem nội dung vào lúc rảnh rỗi cuối ngày."*

---

## 9. Giao diện & Trải nghiệm người dùng (UX)

- **Vị trí**: Một icon đồng hồ nhỏ nằm trong menu AI Assistant của Post Modal.
- **Trạng thái Chờ**: Hiển thị Skeleton hoặc Spinner với dòng chữ *"Đang phân tích thói quen khán giả của bạn..."*
- **Kết quả**: Hiện Tooltip hoặc thông báo nổi (Pop-over) chứa mốc giờ và lời khuyên của Gemini.
- **Action**: Cho phép người dùng nhấn vào giờ gợi ý để lên lịch (nếu có tính năng Schedule).

---

## 10. Kế hoạch triển khai (Roadmap)

1.  **Sprint 1**: Viết Script Node.js export dữ liệu thực tế từ MongoDB sang CSV.
2.  **Sprint 2**: Huấn luyện model XGBoost trên Google Colab/Kaggle và lưu file `.json`.
3.  **Sprint 3**: Xây dựng Flask/FastAPI service để phục vụ dự báo.
4.  **Sprint 4**: Kết nối Node.js với ML Service và Gemini, hoàn thiện UI/UX.

---

## 11. Kết luận

Chức năng **Best Time to Post** không chỉ là một công cụ AI đơn thuần, mà nó là sự kết hợp giữa **Khoa học dữ liệu (Data Science)** và **Trí tuệ nhân tạo (Generative AI)**, tạo ra giá trị thực tế cho người dùng trong việc tối ưu hóa nội dung trên mạng xã hội.
