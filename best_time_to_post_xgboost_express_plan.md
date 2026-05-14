# Best Time To Post bằng XGBoost cho Instagram Clone

> Phiên bản này đã được chỉnh theo project hiện tại:
>
> - Backend dùng **ExpressJS**.
> - `mediaCount` luôn bằng `1` nên **không dùng làm feature**.
> - Hiện tại **chưa có `hashtagCount` và `mentionCount`**, nên **không bắt buộc dùng**.
> - Có xử lý riêng cho **user mới chưa có bài post nào**.

---

## 1. Mục tiêu chức năng

Chức năng **Best Time To Post** gợi ý cho user các khung giờ có khả năng đạt engagement cao nhất khi đăng bài.

Ví dụ response:

```json
{
  "userId": "665f1a...",
  "mode": "personal_ai",
  "recommendations": [
    {
      "dayOfWeek": 5,
      "dayName": "Friday",
      "hour": 20,
      "predictedEngagementScore": 0.082,
      "confidence": "high",
      "reason": "Dựa trên lịch sử bài đăng của bạn và dữ liệu toàn hệ thống."
    }
  ]
}
```

Ý tưởng chính:

```text
Model dự đoán engagementScore nếu user đăng bài vào một ngày + giờ cụ thể.
```

Sau đó hệ thống tạo 168 khung giờ trong tuần:

```text
7 ngày * 24 giờ = 168 khung giờ
```

Model predict toàn bộ 168 khung giờ, sort theo score giảm dần, rồi trả về top 3 hoặc top 5.

---

## 2. Vì sao dùng XGBoost?

XGBoost phù hợp vì bài toán này là dữ liệu dạng bảng.

Bạn có các feature như:

```text
hour, dayOfWeek, captionLength, mediaType, followerCountAtPostTime, lịch sử engagement của user...
```

XGBoost mạnh hơn rule-based ở chỗ nó học được quan hệ phức tạp hơn, ví dụ:

```text
User A đăng video lúc 20h thứ Sáu tốt.
User B đăng image lúc 9h sáng thứ Hai tốt hơn.
Post caption dài có thể hiệu quả khác nhau tùy mediaType.
```

Model nên dùng:

```python
XGBRegressor
```

Target cần dự đoán:

```text
engagementScore
```

---

## 3. Kiến trúc tổng thể

Project của bạn dùng ExpressJS, nên kiến trúc nên là:

```text
React Frontend
     ↓
ExpressJS Backend
     ↓
Python FastAPI AI Service
     ↓
XGBoost model file: best_time_xgboost.pkl
```

Lý do nên tách Python service:

```text
Train AI bằng Python dễ hơn Node.js.
ExpressJS vẫn là backend chính.
FastAPI chỉ nhận input và trả prediction.
```

---

## 4. Dữ liệu cần lưu trong database

Bạn nên có ít nhất 2 collection chính:

```text
posts
post_analytics
```

---

## 5. Collection `posts`

Ví dụ schema:

```ts
{
  _id: ObjectId,
  userId: ObjectId,

  caption: string,
  mediaType: "image" | "video", // hoặc "carousel" nếu sau này có

  createdAt: Date,
  updatedAt: Date,

  visibility: "public" | "private",

  likeCount: number,
  commentCount: number,
  saveCount: number,
  viewCount: number
}
```

---

## 6. Collection `post_analytics`

Nên tách analytics riêng để sau này có thể lưu nhiều mốc thời gian.

```ts
{
  _id: ObjectId,
  postId: ObjectId,
  userId: ObjectId,

  likes: number,
  comments: number,
  saves: number,
  views: number,

  followerCountAtPostTime: number,

  engagementScore: number,

  collectedAfterHours: number, // 24 hoặc 48
  collectedAt: Date
}
```

Ví dụ:

```json
{
  "postId": "p1",
  "userId": "u1",
  "likes": 120,
  "comments": 14,
  "saves": 9,
  "views": 1800,
  "followerCountAtPostTime": 2500,
  "engagementScore": 0.0736,
  "collectedAfterHours": 24,
  "collectedAt": "2026-04-27T10:00:00.000Z"
}
```

---

## 7. Công thức `engagementScore`

Không nên dùng số like thô vì user nhiều follower sẽ có like cao hơn user ít follower.

Nên normalize theo follower count.

Công thức đề xuất:

```ts
engagementScore = (likes * 1 + comments * 3 + saves * 4) / Math.max(followerCountAtPostTime, 1);
```

Giải thích trọng số:

```text
like    = 1 điểm
comment = 3 điểm
save    = 4 điểm
```

---

## 8. Khi nào tính engagementScore?

Không nên tính ngay khi user vừa đăng bài.

Nên tính sau:

```text
24 giờ
```

Hoặc tốt hơn:

```text
48 giờ
```

Flow:

```text
User đăng bài
     ↓
Lưu post
     ↓
Sau 24h chạy job analytics
     ↓
Lấy likes/comments/saves/shares hiện tại
     ↓
Tính engagementScore
     ↓
Lưu vào post_analytics
     ↓
Dữ liệu này dùng để train model
```

---

## 9. Feature dùng cho XGBoost

---

### 9.1 Feature bắt buộc nên có

#### `dayOfWeek`

Ngày trong tuần của thời điểm đăng bài.

```text
0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
```

Lấy từ `createdAt`.

```ts
const dayOfWeek = new Date(post.createdAt).getDay();
```

#### `hour`

Giờ đăng bài.

```text
0 - 23
```

```ts
const hour = new Date(post.createdAt).getHours();
```

#### `isWeekend`

```ts
const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
```

#### `captionLength`

```ts
const captionLength = post.caption?.length || 0;
```

#### `captionWordCount`

```ts
const captionWordCount = post.caption ? post.caption.trim().split(/\s+/).filter(Boolean).length : 0;
```

#### `hasCaption`

```ts
const hasCaption = post.caption && post.caption.trim().length > 0 ? 1 : 0;
```

#### `mediaType`

Loại media của post:

```text
image
video
```

Encode dạng one-hot:

```text
mediaType_image
mediaType_video
```

Ví dụ post là video:

```json
{
  "mediaType_image": 0,
  "mediaType_video": 1
}
```

#### `followerCountAtPostTime`

Số follower của user tại thời điểm đăng bài.

```ts
followerCountAtPostTime: user.followersCount;
```

Trường này nên lưu cố định khi post được tạo.

#### `accountAgeDays`

Tuổi tài khoản tính theo ngày.

```ts
const accountAgeDays = Math.floor((post.createdAt.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
```

---

### 9.2 Feature lịch sử cá nhân của user

#### `userPostCountBefore`

Số bài user đã đăng trước bài hiện tại.

```text
Bài đầu tiên → 0
Bài thứ hai → 1
Bài thứ mười → 9
```

#### `userAvgEngagementBefore`

Engagement trung bình của user trước bài hiện tại.

Không được tính cả bài hiện tại, vì sẽ gây data leakage.

#### `userAvgEngagementLast7Posts`

Engagement trung bình của 7 bài gần nhất trước bài hiện tại.

Nếu user chưa đủ 7 bài thì lấy trung bình số bài đang có.

Nếu user chưa có bài nào thì dùng global average.

#### `userAvgEngagementLast30Days`

Engagement trung bình của user trong 30 ngày trước thời điểm post.

#### `userBestHourBefore`

Giờ từng mang lại engagement tốt nhất cho user trước đây.

Nếu user mới, set bằng global best hour.

#### `userBestDayOfWeekBefore`

Ngày trong tuần từng có engagement tốt nhất cho user.

Nếu user mới, set bằng global best day.

---

### 9.3 Feature thống kê global toàn hệ thống

Các feature này giúp xử lý user mới hoặc user có ít dữ liệu.

#### `globalAvgEngagementByHour`

Engagement trung bình toàn hệ thống theo giờ.

#### `globalAvgEngagementByDayOfWeek`

Engagement trung bình toàn hệ thống theo ngày trong tuần.

#### `globalAvgEngagementByDayHour`

Engagement trung bình toàn hệ thống theo cặp ngày + giờ.

Feature này cực kỳ quan trọng cho bài toán best time.

---

### 9.4 Feature chưa có hiện tại nhưng có thể thêm sau

Hiện tại bạn chưa có:

```text
hashtagCount
mentionCount
```

Không sao. Không cần dùng ngay.

Sau này nếu bạn thêm hashtag/mention, có thể bổ sung:

```text
hashtagCount
mentionCount
hasHashtag
hasMention
```

Bản hiện tại vẫn train được với các feature sau:

```text
dayOfWeek
hour
isWeekend
captionLength
captionWordCount
hasCaption
mediaType_image
mediaType_video
followerCountAtPostTime
accountAgeDays
userPostCountBefore
userAvgEngagementBefore
userAvgEngagementLast7Posts
userAvgEngagementLast30Days
userBestHourBefore
userBestDayOfWeekBefore
globalAvgEngagementByHour
globalAvgEngagementByDayOfWeek
globalAvgEngagementByDayHour
```

---

## 10. Dataset training cuối cùng

Ví dụ CSV:

```csv
postId,userId,dayOfWeek,hour,isWeekend,captionLength,captionWordCount,hasCaption,mediaType_image,mediaType_video,followerCountAtPostTime,accountAgeDays,userPostCountBefore,userAvgEngagementBefore,userAvgEngagementLast7Posts,userAvgEngagementLast30Days,userBestHourBefore,userBestDayOfWeekBefore,globalAvgEngagementByHour,globalAvgEngagementByDayOfWeek,globalAvgEngagementByDayHour,engagementScore
p1,u1,5,20,0,120,22,1,1,0,1000,300,12,0.052,0.061,0.058,20,5,0.066,0.071,0.083,0.087
p2,u2,0,21,1,80,14,1,0,1,500,40,2,0.035,0.035,0.035,21,0,0.064,0.069,0.079,0.074
```

Target:

```text
engagementScore
```

Tất cả cột còn lại là feature.

---

## 11. Không dùng `userId` trực tiếp trong model ở giai đoạn đầu

Không nên đưa `userId` trực tiếp vào XGBoost nếu dataset còn nhỏ.

Lý do:

```text
userId có quá nhiều unique value.
Model dễ học vẹt từng user.
User mới không có userId trong training data thì model khó xử lý.
```

Thay vì dùng `userId`, hãy dùng các feature thống kê của user:

```text
userPostCountBefore
userAvgEngagementBefore
userAvgEngagementLast7Posts
userBestHourBefore
userBestDayOfWeekBefore
```

---

## 12. Xử lý user mới chưa có bài post nào

User mới có:

```text
userPostCountBefore = 0
userAvgEngagementBefore = chưa có
userAvgEngagementLast7Posts = chưa có
userAvgEngagementLast30Days = chưa có
userBestHourBefore = chưa có
userBestDayOfWeekBefore = chưa có
```

Không thể dùng dữ liệu cá nhân.

Vì vậy cần fallback.

### Case A: User mới hoàn toàn

Điều kiện:

```ts
userPostCount === 0;
```

Cách xử lý:

```text
Không dùng personal history.
Dùng global statistics toàn hệ thống.
```

Response nên có:

```json
{
  "mode": "global_fallback",
  "confidence": "low",
  "message": "Bạn chưa có bài post nào, nên gợi ý hiện tại dựa trên dữ liệu trung bình toàn hệ thống. Khi bạn đăng thêm bài, hệ thống sẽ cá nhân hóa tốt hơn."
}
```

Feature cho prediction:

```text
userPostCountBefore = 0
userAvgEngagementBefore = globalAvgEngagement
userAvgEngagementLast7Posts = globalAvgEngagement
userAvgEngagementLast30Days = globalAvgEngagement
userBestHourBefore = globalBestHour
userBestDayOfWeekBefore = globalBestDayOfWeek
```

Sau đó vẫn có thể cho XGBoost predict 168 khung giờ, nhưng kết quả chủ yếu dựa trên global feature.

### Case B: User có ít bài post

Điều kiện ví dụ:

```ts
userPostCount > 0 && userPostCount < 10;
```

Công thức hybrid:

```ts
finalScore = aiScore * 0.4 + globalScore * 0.6;
```

Response:

```json
{
  "mode": "hybrid_global_ai",
  "confidence": "medium",
  "message": "Bạn chưa có nhiều bài post, nên hệ thống kết hợp dữ liệu của bạn với dữ liệu toàn hệ thống."
}
```

### Case C: User có đủ dữ liệu

Điều kiện ví dụ:

```ts
userPostCount >= 10;
```

Công thức:

```ts
finalScore = aiScore * 0.7 + personalScore * 0.3;
```

Response:

```json
{
  "mode": "personal_ai",
  "confidence": "high",
  "message": "Gợi ý dựa trên lịch sử bài đăng của bạn và dữ liệu toàn hệ thống."
}
```

---

## 13. Global statistics cần chuẩn bị

Bạn nên tạo một collection/cache tên là:

```text
best_time_global_stats
```

Ví dụ document:

```ts
{
  type: "day_hour",
  dayOfWeek: 5,
  hour: 20,
  avgEngagementScore: 0.083,
  postCount: 1200,
  updatedAt: Date
}
```

Có thể lưu các loại thống kê:

```text
by_hour
by_day_of_week
by_day_hour
global_average
global_best_hour
global_best_day
```

Job cập nhật global stats nên chạy định kỳ:

```text
Mỗi ngày 1 lần
```

---

## 14. ExpressJS API cần có

### API lấy best time

```http
GET /api/best-time-to-post?mediaType=image
Authorization: Bearer <token>
```

Response:

```json
{
  "userId": "665f1a...",
  "mode": "global_fallback",
  "confidence": "low",
  "recommendations": [
    {
      "dayOfWeek": 5,
      "dayName": "Friday",
      "hour": 20,
      "predictedEngagementScore": 0.083,
      "reason": "Dựa trên dữ liệu toàn hệ thống vì bạn chưa có bài post nào."
    }
  ]
}
```

### API export training data

Chỉ dùng nội bộ/admin.

```http
GET /api/admin/best-time-training-data
```

Hoặc tạo script riêng:

```bash
node scripts/export-best-time-training-data.js
```

Output:

```text
training_data.csv
```

---

## 15. ExpressJS service flow

Khi frontend gọi:

```http
GET /api/best-time-to-post?mediaType=image
```

ExpressJS làm:

```text
1. Lấy userId từ JWT.
2. Đếm số post của user.
3. Lấy user profile: followersCount, createdAt.
4. Lấy personal stats của user nếu có.
5. Lấy global stats.
6. Tạo 168 candidate time slots.
7. Gửi candidates sang AI service.
8. Nhận predicted score.
9. Tính finalScore theo case user mới / ít data / đủ data.
10. Sort giảm dần.
11. Trả top 3 hoặc top 5.
```

---

## 16. Ví dụ ExpressJS route

```ts
import express from 'express';
import axios from 'axios';
import { requireAuth } from '../middlewares/requireAuth';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { getGlobalBestTimeStats } from '../services/globalStats.service';
import { buildBestTimeCandidates } from '../services/bestTimeFeature.service';

const router = express.Router();

router.get('/best-time-to-post', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mediaType = String(req.query.mediaType || 'image');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ userId });
    const globalStats = await getGlobalBestTimeStats();

    const candidates = await buildBestTimeCandidates({
      user,
      userId,
      mediaType,
      postCount,
      globalStats
    });

    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/predict-best-time`, { candidates });

    const predictions = aiResponse.data.predictions;

    let mode = 'personal_ai';
    let confidence = 'high';

    if (postCount === 0) {
      mode = 'global_fallback';
      confidence = 'low';
    } else if (postCount < 10) {
      mode = 'hybrid_global_ai';
      confidence = 'medium';
    }

    const recommendations = predictions.sort((a, b) => b.finalScore - a.finalScore).slice(0, 5);

    return res.json({
      userId,
      mode,
      confidence,
      recommendations
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

`.env` backend:

```env
AI_SERVICE_URL=http://ai-service:8000
```

---

## 17. Tạo 168 candidate slots

```ts
export function createWeekTimeSlots() {
  const slots = [];

  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    for (let hour = 0; hour <= 23; hour++) {
      slots.push({
        dayOfWeek,
        hour,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0
      });
    }
  }

  return slots;
}
```

---

## 18. Build feature cho prediction

```ts
export async function buildBestTimeCandidates({ user, userId, mediaType, postCount, globalStats }) {
  const slots = createWeekTimeSlots();

  const personalStats = await getUserBestTimeStats(userId);

  const followerCountAtPostTime = user.followersCount || 0;
  const accountAgeDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const globalAvg = globalStats.globalAverageEngagement;

  return slots.map((slot) => {
    const globalDayHour = globalStats.byDayHour[`${slot.dayOfWeek}_${slot.hour}`] || globalAvg;
    const globalHour = globalStats.byHour[String(slot.hour)] || globalAvg;
    const globalDay = globalStats.byDayOfWeek[String(slot.dayOfWeek)] || globalAvg;

    return {
      dayOfWeek: slot.dayOfWeek,
      hour: slot.hour,
      isWeekend: slot.isWeekend,

      captionLength: 0,
      captionWordCount: 0,
      hasCaption: 0,

      mediaType_image: mediaType === 'image' ? 1 : 0,
      mediaType_video: mediaType === 'video' ? 1 : 0,

      followerCountAtPostTime,
      accountAgeDays,

      userPostCountBefore: postCount,
      userAvgEngagementBefore: personalStats?.avgEngagement ?? globalAvg,
      userAvgEngagementLast7Posts: personalStats?.avgEngagementLast7Posts ?? globalAvg,
      userAvgEngagementLast30Days: personalStats?.avgEngagementLast30Days ?? globalAvg,
      userBestHourBefore: personalStats?.bestHour ?? globalStats.globalBestHour,
      userBestDayOfWeekBefore: personalStats?.bestDayOfWeek ?? globalStats.globalBestDayOfWeek,

      globalAvgEngagementByHour: globalHour,
      globalAvgEngagementByDayOfWeek: globalDay,
      globalAvgEngagementByDayHour: globalDayHour
    };
  });
}
```

Lưu ý:

```text
Khi user chưa nhập caption ở màn hình gợi ý best time, captionLength có thể set 0.
Nếu frontend có caption draft, gửi caption lên để tính captionLength thật.
```

---

## 19. Python FastAPI AI service

Cấu trúc thư mục:

```text
ai-service/
├── app/
│   ├── main.py
│   ├── schemas.py
│   └── model/
│       └── best_time_xgboost.pkl
├── training/
│   ├── train.py
│   └── training_data.csv
├── requirements.txt
└── Dockerfile
```

---

## 20. `requirements.txt`

```txt
fastapi
uvicorn
pandas
numpy
scikit-learn
xgboost
joblib
```

---

## 21. Train model XGBoost

`training/train.py`:

```python
import pandas as pd
import joblib
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = "training_data.csv"
MODEL_PATH = "../app/model/best_time_xgboost.pkl"

FEATURE_COLUMNS = [
    "dayOfWeek",
    "hour",
    "isWeekend",
    "captionLength",
    "captionWordCount",
    "hasCaption",
    "mediaType_image",
    "mediaType_video",
    "followerCountAtPostTime",
    "accountAgeDays",
    "userPostCountBefore",
    "userAvgEngagementBefore",
    "userAvgEngagementLast7Posts",
    "userAvgEngagementLast30Days",
    "userBestHourBefore",
    "userBestDayOfWeekBefore",
    "globalAvgEngagementByHour",
    "globalAvgEngagementByDayOfWeek",
    "globalAvgEngagementByDayHour",
]

TARGET_COLUMN = "engagementScore"


def main():
    df = pd.read_csv(DATA_PATH)

    df = df.dropna(subset=[TARGET_COLUMN])

    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    model = XGBRegressor(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print("MAE:", mae)
    print("MSE:", mse)
    print("R2:", r2)

    joblib.dump({
        "model": model,
        "feature_columns": FEATURE_COLUMNS
    }, MODEL_PATH)

    print("Model saved to", MODEL_PATH)


if __name__ == "__main__":
    main()
```

---

## 22. FastAPI prediction API

`app/main.py`:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import joblib

app = FastAPI(title="Best Time To Post AI Service")

MODEL_BUNDLE = joblib.load("app/model/best_time_xgboost.pkl")
model = MODEL_BUNDLE["model"]
FEATURE_COLUMNS = MODEL_BUNDLE["feature_columns"]


class PredictRequest(BaseModel):
    candidates: List[Dict[str, Any]]


@app.post("/predict-best-time")
def predict_best_time(payload: PredictRequest):
    df = pd.DataFrame(payload.candidates)

    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0

    X = df[FEATURE_COLUMNS]
    scores = model.predict(X)

    predictions = []

    for candidate, score in zip(payload.candidates, scores):
        global_score = candidate.get("globalAvgEngagementByDayHour", 0)
        post_count = candidate.get("userPostCountBefore", 0)

        if post_count == 0:
            final_score = global_score
        elif post_count < 10:
            final_score = float(score) * 0.4 + global_score * 0.6
        else:
            final_score = float(score)

        predictions.append({
            "dayOfWeek": candidate["dayOfWeek"],
            "hour": candidate["hour"],
            "predictedEngagementScore": float(score),
            "globalScore": float(global_score),
            "finalScore": float(final_score)
        })

    predictions = sorted(
        predictions,
        key=lambda item: item["finalScore"],
        reverse=True
    )

    return {
        "predictions": predictions
    }
```

---

## 23. Dockerfile cho AI service

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 24. Docker Compose ví dụ

```yaml
services:
  backend:
    build: ./backend
    container_name: instagram_clone_backend
    ports:
      - '3000:3000'
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
      - ai-service

  ai-service:
    build: ./ai-service
    container_name: instagram_clone_ai_service
    ports:
      - '8000:8000'

  mongodb:
    image: mongo:7
    container_name: instagram_clone_mongodb
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

Backend `.env`:

```env
AI_SERVICE_URL=http://ai-service:8000
```

---

## 25. Export training data từ ExpressJS/MongoDB

Tạo script:

```text
backend/scripts/export-best-time-training-data.ts
```

Pseudo flow:

```text
1. Lấy tất cả post đã có analytics sau 24h hoặc 48h.
2. Với mỗi post:
   - lấy user
   - tính dayOfWeek/hour từ createdAt
   - tính captionLength/captionWordCount/hasCaption
   - encode mediaType
   - lấy followerCountAtPostTime
   - tính accountAgeDays
   - tính personal stats trước thời điểm post
   - lấy global stats tại thời điểm export
   - lấy engagementScore từ post_analytics
3. Ghi ra CSV.
```

Điểm quan trọng:

```text
Personal stats phải được tính dựa trên các bài trước bài hiện tại.
Không được lấy dữ liệu tương lai.
```

---

## 26. Rule-based fallback khi chưa đủ dataset để train

Nếu hệ thống chưa có đủ dữ liệu để train XGBoost, nên dùng rule-based trước.

Ví dụ:

```text
Tính average engagement theo dayOfWeek + hour.
Sort giảm dần.
Trả top 5.
```

MongoDB aggregation ý tưởng:

```js
db.post_analytics.aggregate([
  {
    $lookup: {
      from: 'posts',
      localField: 'postId',
      foreignField: '_id',
      as: 'post'
    }
  },
  { $unwind: '$post' },
  {
    $group: {
      _id: {
        dayOfWeek: { $dayOfWeek: '$post.createdAt' },
        hour: { $hour: '$post.createdAt' }
      },
      avgEngagementScore: { $avg: '$engagementScore' },
      postCount: { $sum: 1 }
    }
  },
  { $sort: { avgEngagementScore: -1 } },
  { $limit: 5 }
]);
```

Lưu ý MongoDB `$dayOfWeek` trả:

```text
1 = Sunday
2 = Monday
...
7 = Saturday
```

Còn JavaScript `getDay()` trả:

```text
0 = Sunday
1 = Monday
...
6 = Saturday
```

Bạn nên chuẩn hóa lại để tránh lệch ngày.

---

## 27. Khi nào nên train XGBoost?

Nên train khi có ít nhất:

```text
500 - 1000 bài post toàn hệ thống
```

Tốt hơn:

```text
5000+ bài post
```

Nếu dataset quá nhỏ, XGBoost có thể học sai hoặc overfit.

Giai đoạn đầu nên dùng:

```text
Rule-based global stats + simple personal average
```

Sau đó mới bật XGBoost.

---

## 28. Lịch train model

Có 2 cách:

### Cách 1: Train thủ công

```bash
cd ai-service/training
python train.py
```

### Cách 2: Train định kỳ

Sau này dùng cron job:

```text
Mỗi ngày lúc 02:00 sáng
```

Flow:

```text
Export training_data.csv
Train model mới
Đánh giá metric
Nếu metric ổn thì replace model cũ
Restart AI service
```

---

## 29. Metric đánh giá model

Dùng regression metric:

```text
MAE
MSE
R2 Score
```

Nhưng với bài toán best time, nên đánh giá thêm:

```text
Top-K Hit Rate
```

Ý nghĩa:

```text
Trong top 5 giờ model gợi ý, có khung giờ nào thực sự thuộc nhóm engagement cao không?
```

---

## 30. Plan triển khai thực tế

### Phase 1: Chuẩn bị dữ liệu

```text
1. Lưu followerCountAtPostTime khi user tạo post.
2. Tạo collection post_analytics.
3. Viết job tính engagementScore sau 24h.
4. Tạo global stats theo day/hour.
```

### Phase 2: Rule-based best time

Làm API:

```text
GET /api/best-time-to-post
```

Nếu user mới:

```text
Trả global top hours.
```

Nếu user có bài:

```text
Kết hợp personal average + global average.
```

### Phase 3: XGBoost

```text
1. Export training_data.csv.
2. Train XGBoost.
3. Deploy FastAPI service.
4. ExpressJS gọi AI service.
5. Thêm fallback khi AI service lỗi.
```

### Phase 4: Cải thiện

Thêm sau:

```text
hashtagCount
mentionCount
content category
user timezone
follower active hours
post topic embedding
```

---

## 31. Kết luận

Với project hiện tại của bạn, feature hợp lý nhất là:

```text
dayOfWeek
hour
isWeekend
captionLength
captionWordCount
hasCaption
mediaType_image
mediaType_video
followerCountAtPostTime
accountAgeDays
userPostCountBefore
userAvgEngagementBefore
userAvgEngagementLast7Posts
userAvgEngagementLast30Days
userBestHourBefore
userBestDayOfWeekBefore
globalAvgEngagementByHour
globalAvgEngagementByDayOfWeek
globalAvgEngagementByDayHour
```

Không cần dùng:

```text
mediaCount
hashtagCount
mentionCount
```

vì:

```text
mediaCount luôn là 1 → không có giá trị học.
hashtagCount, mentionCount chưa có → không bắt buộc.
```

Hướng tốt nhất:

```text
Bắt đầu bằng rule-based global stats.
Sau khi có đủ data, train XGBoost.
Luôn có fallback cho user mới.
ExpressJS chỉ đóng vai trò backend chính, còn Python FastAPI chạy AI model.
```
