import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/db/create-prisma-client";

const prisma = createPrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { phone: "963900000001" },
    update: {},
    create: {
      firstName: "مدير",
      lastName: "النظام",
      phone: "963900000001",
      password,
      role: Role.ADMIN,
      isPhoneVerified: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { phone: "963599000001" },
    update: {},
    create: {
      firstName: "أحمد",
      lastName: "الملعب",
      phone: "963599000001",
      password,
      role: Role.STADIUM_OWNER,
      isPhoneVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { phone: "963599000002" },
    update: {},
    create: {
      firstName: "محمد",
      lastName: "لاعب",
      phone: "963599000002",
      password,
      role: Role.USER,
      isPhoneVerified: true,
    },
  });

  const stadium1 = await prisma.stadium.upsert({
    where: { slug: "ملعب-النخيل" },
    update: {
      city: "حلب",
      area: "الجميلية",
      address: "شارع الجامعة",
      description:
        "ملعب كرة قدم عشبي في حلب. إضاءة ليلية، غرف تبديل، ومواقف سيارات.",
    },
    create: {
      ownerId: owner.id,
      name: "ملعب النخيل",
      slug: "ملعب-النخيل",
      description:
        "ملعب كرة قدم عشبي في حلب. إضاءة ليلية، غرف تبديل، ومواقف سيارات.",
      address: "شارع الجامعة",
      city: "حلب",
      area: "الجميلية",
      morningPrice: 50,
      eveningPrice: 80,
      depositAmount: 20,
      contactPhone: "+970599000001",
      contactWhatsapp: "+970599000001",
      coverImage:
        "https://images.unsplash.com/photo-1459865269677-1af658c87f6a?w=800&q=80",
      images: {
        create: [
          {
            imageUrl:
              "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
          },
          {
            imageUrl:
              "https://images.unsplash.com/photo-1529900748604-07564a03e7a9?w=800&q=80",
          },
        ],
      },
    },
  });

  await prisma.stadium.upsert({
    where: { slug: "ملعب-الأمل" },
    update: {
      city: "الرقة",
      area: "التأميم",
      address: "شارع الثورة",
      description: "ملعب 5 ضد 5 مغطى بإضاءة LED في الرقة.",
    },
    create: {
      ownerId: owner.id,
      name: "ملعب الأمل",
      slug: "ملعب-الأمل",
      description: "ملعب 5 ضد 5 مغطى بإضاءة LED في الرقة.",
      address: "شارع الثورة",
      city: "الرقة",
      area: "التأميم",
      morningPrice: 40,
      eveningPrice: 65,
      depositAmount: 15,
      contactPhone: "+970599000001",
      coverImage:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);
  const end = new Date(tomorrow);
  end.setHours(19, 0, 0, 0);

  await prisma.availabilitySlot.createMany({
    data: [
      {
        stadiumId: stadium1.id,
        startTime: tomorrow,
        endTime: end,
        isAvailable: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.settings.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      cancellationPolicy:
        "يمكنك إلغاء الحجز قبل 24 ساعة على الأقل من موعد المباراة لاسترداد العربون.",
      allowInstantBooking: false,
      bookingExpirationMin: 15,
    },
  });

  console.info("Seed completed:", { admin: admin.phone, owner: owner.phone, user: user.phone });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
