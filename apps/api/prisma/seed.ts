import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@beeplay.ps" },
    update: {},
    create: {
      firstName: "مدير",
      lastName: "النظام",
      email: "admin@beeplay.ps",
      password,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@beeplay.ps" },
    update: {},
    create: {
      firstName: "أحمد",
      lastName: "الملعب",
      email: "owner@beeplay.ps",
      phone: "+970599000001",
      password,
      role: Role.STADIUM_OWNER,
      isEmailVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@beeplay.ps" },
    update: {},
    create: {
      firstName: "محمد",
      lastName: "لاعب",
      email: "user@beeplay.ps",
      phone: "+970599000002",
      password,
      role: Role.USER,
      isEmailVerified: true,
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
      city: "إدلب",
      area: "المدينة",
      address: "شارع الثورة",
      description: "ملعب 5 ضد 5 مغطى بإضاءة LED في إدلب.",
    },
    create: {
      ownerId: owner.id,
      name: "ملعب الأمل",
      slug: "ملعب-الأمل",
      description: "ملعب 5 ضد 5 مغطى بإضاءة LED في إدلب.",
      address: "شارع الثورة",
      city: "إدلب",
      area: "المدينة",
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

  console.log("Seed completed:", { admin: admin.email, owner: owner.email, user: user.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
