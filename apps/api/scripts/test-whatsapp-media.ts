import { env } from "@hazjak/config";
import { resolvePublicMediaUrl } from "@hazjak/utils";
import { createPrismaClient } from "../src/db/create-prisma-client";
import {
  sendDepositInstructionsWhatsApp,
  sendWhatsAppImage,
} from "../src/services/whatsapp/whatsapp.service";
import { depositWhatsAppMessage } from "../src/services/whatsapp/messages";

const prisma = createPrismaClient();

async function main() {
  console.log("API_PUBLIC_URL:", env.apiPublicUrl);
  console.log("WHATSAPP configured:", Boolean(env.whatsappApiKey && env.whatsappSender));

  const stadiums = await prisma.stadium.findMany({
    select: { name: true, shamCashQrImage: true, depositAmount: true, shamCashId: true },
  });
  console.log("\nstadiums:", JSON.stringify(stadiums, null, 2));

  const stadium = stadiums.find((s) => s.shamCashQrImage?.trim());
  if (!stadium?.shamCashQrImage) {
    console.log("\nNo stadium with shamCashQrImage in DB");
    return;
  }

  const resolved = resolvePublicMediaUrl(stadium.shamCashQrImage, env.apiPublicUrl);
  console.log("\nresolved QR URL:", resolved);

  const number = env.whatsappSender;
  console.log("\n1) sendWhatsAppImage (POST + GET fallback)...");
  const img = await sendWhatsAppImage(number, stadium.shamCashQrImage, "باركود شام كاش");
  console.log("result:", img);

  if (!img.ok) {
    console.log("\n2) full deposit flow...");
    const msg = depositWhatsAppMessage({
      stadiumName: stadium.name,
      depositAmount: stadium.depositAmount ?? 0,
      referenceCode: "TEST-123",
      shamCashId: stadium.shamCashId,
    });
    const flow = await sendDepositInstructionsWhatsApp(number, msg, stadium.shamCashQrImage);
    console.log("deposit flow result:", flow);
    if (!flow.ok) process.exitCode = 1;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
