# TASK NOW 
## User 
- اذا لم يتمتاكيد الحجز لا تضهر رقم الوتساب للملعب
- في المواعيد لازم في ملعب غير متاح لازم يظهر هذا الشي 
    - ندرس كيف نعملها كقواعد بيانات و Api
    - نطبقها في الويب
- قبل التحقق من الحساب امنعه من تسجيل الدخول  احفظ التوكن في قيمة اخرى فقط لاظهار كود TOP 

```json
{
    "id": "ea15b96d-9029-4d05-8c53-a610130f284e",
    "ownerId": "3483ebb7-4733-4f89-ba2a-e90786c47bc1",
    "name": "ملعب الأمل",
    "slug": "ملعب-الأمل",
    "description": "ملعب 5 ضد 5 مغطى بإضاءة LED وتكييف جزئي.",
    "address": "حي الشجاعية",
    "city": "غزة",
    "area": "الشجاعية",
    "latitude": null,
    "longitude": null,
    "morningPrice": 40,
    "eveningPrice": 65,
    "depositAmount": 30,
    "contactPhone": "+970599000001",
    "contactWhatsapp": null,
    "coverImage": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    "isActive": true,
    "isSuspended": false,
    "createdAt": "2026-05-22T12:07:14.907Z",
    "updatedAt": "2026-05-25T16:00:58.301Z",
    "images": [],
    "owner": {
        "id": "3483ebb7-4733-4f89-ba2a-e90786c47bc1",
        "firstName": "أحمد",
        "lastName": "الملعب"
    },
    "reviews": [],
    "availabilitySlots": [],
    "averageRating": 0,
    "showContact": false
}
``` 

# Owner Task List
- اضافة اوقات المواعيد المتاحة للملعب
- اضافة صورة باركود شام كاش او حقل id shamcash

# Api
- مكون ارسال الايميلات
- استخدام مكون الايميلات في 
    - التحقق
    - ارسال تاكيد الحجز والرفض و طلب الرعبون 
    - عند طلب الرعبون نطلب منه وضع كود كملاحظة في شام كاش لتمييز الدفعة
    - كود التحقق

- قوالب للنصوص

> التالي موجل
- [ ] الاشعارات
    - [ ] عمل push notifications