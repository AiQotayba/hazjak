import { env } from "@hazjak/config";
import { sendWhatsAppImage } from "../src/services/whatsapp/whatsapp.service";

async function main() {
  const sender = env.whatsappSender;
  const urls = [
    "https://httpbin.org/image/jpeg",
    "https://api-beeplay.sy-calculator.com/uploads/images/e9eb9de3-98dc-4d06-b6d6-b98613bbc36f.jpg",
  ];

  for (const url of urls) {
    console.log("\ntesting:", url);
    const result = await sendWhatsAppImage(sender, url, "test image");
    console.log("result:", result);
  }
}

main().catch(console.error);
