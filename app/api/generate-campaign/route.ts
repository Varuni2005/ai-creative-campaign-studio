// @ts-nocheck
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  let productName = "";
  let description = "";
  let audience = "";
  let platform = "";
  let tone = "";

  try {
    const body = await req.json();
    productName = body.productName || "";
    description = body.description || "";
    audience = body.audience || "";
    platform = body.platform || "Instagram";
    tone = body.tone || "Friendly";

    if (!productName || !description) {
      return NextResponse.json(
        { error: "productName and description are required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a senior marketing strategist and AI copywriter.

Create a marketing content package for:

Product: ${productName}
Description: ${description}
Audience: ${audience || "Not specified"}
Platform: ${platform}
Tone: ${tone}

Return STRICT JSON with:
- tagline
- brand_story (3–5 sentences)
- hooks (array of 3 hooks)
- captions (array of 2 platform-optimized captions)
- hashtags (array of 8–12)
- translated_caption_hi (Hindi translation)
- translated_caption_kn (Kannada translation)
Return ONLY JSON, no explanation.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful marketing AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const raw = completion.choices[0].message.content || "{}";
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API error:", err);

    // 🔁 If your account has no credits, use a smart fallback
    const isQuotaError =
      err?.code === "insufficient_quota" || err?.status === 429;

    if (isQuotaError) {
      const demo = {
        tagline: `${productName || "This product"} that keeps you going.`,
        brand_story:
          `${productName} is designed for ${audience || "busy people"} who need more than just another product. ` +
          `With ${description}, it fits naturally into your daily routine and makes your ${platform} presence feel more intentional and professional.`,
        hooks: [
          `Why ${productName} is your next non-negotiable `,
          `From “I should post” to “Just posted” in seconds `,
          `Turn your everyday ${platform} posts into a brand story `,
        ],
        captions: [
          `Tired of overthinking every ${platform} post?  

Meet ${productName}– built for ${audience || "busy creators"} who want consistent, clean content without spending hours writing.  

${description}

Save your energy for the work that matters. Let your content support you instead of stressing you out.`,
          `If you're juggling classes, meetings, deadlines *and* content… this is for you.  

${productName} helps you show up online with clarity, consistency, and a tone that actually sounds like you.  

One tool. Sharper presence. More intentional ${platform} posts.`,
        ],
        hashtags: [
          "#ContentMadeEasy",
          "#AIPowered",
          "#CreatorTools",
          "#BuildYourBrand",
          "#StudentLife",
          "#WorkSmart",
          "#SocialMedia",
          "#DailyPost",
        ],
        translated_caption_hi:
          "अब हर पोस्ट के लिए घंटों सोचने की ज़रूरत नहीं।\n\n" +
          `${productName} आपके लिए कंटेंट तैयार करने में मदद करता है ताकि आप पढ़ाई, काम और अपने सपनों पर ध्यान दे सकें – सोशल मीडिया अपने आप संभल जाए।`,
        translated_caption_kn:
          "ಪ್ರತಿ ಪೋಸ್ಟ್‌ಗಾಗಿ ಗಂಟೆಗಟ್ಟಲೆ ಯೋಚಿಸುವ ದಿನಗಳು ಮುಗಿದವು\n\n" +
          `${productName} ನಿಮ್ಮಗಾಗಿ ಕಂಟೆಂಟ್ ಸಿದ್ಧಪಡಿಸುತ್ತದೆ, ನೀವು ಓದು, ಕೆಲಸ ಮತ್ತು ಕನಸುಗಳ ಮೇಲೆ ಫೋಕಸ್ ಮಾಡಬಹುದು – ಸೋಷಿಯಲ್ ಮೀಡಿಯಾ ಸ್ವತಃ ಜಾಗ್ರತೆ ಪಡೆದುಕೊಳ್ಳುತ್ತದೆ.`,
        note:
          "Fallback response used because the configured OpenAI API key has insufficient quota. Replace OPENAI_API_KEY with a valid key to use live AI generation.",
      };

      return NextResponse.json(demo);
    }

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Something went wrong while generating campaign content.",
      },
      { status: 500 }
    );
  }
}
