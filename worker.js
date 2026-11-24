// «Claude арқылы видео монтаж» курсы — Telegram сату боты (Cloudflare Workers)
// Баптаулар Cloudflare → Worker → Settings → Variables and Secrets бөлімінде:
//   BOT_TOKEN (Secret)  — BotFather токені
//   ADMIN_CHAT_ID       — «Жасанды интеллект курс төлемі» тобының ID-і (-100...)
//   COURSE_CHAT_ID      — «Жасанды интеллект курс» тобының ID-і (-100...)
//   KASPI_PHONE, KASPI_NAME, SITE_URL, MANAGER (міндетті емес)
// Іске қосу: браузерде https://<worker-мекенжайы>/setup ашыңыз — бот Telegram-ға қосылады.
// Топтың ID-ін білу: топқа /id деп жазыңыз.


const LESSONS = [
  "ChatGPT: баптау және тегін қолдану", "Grok", "Gemini",
  "Нейрофото: бір фотодан ондаған образ", "Midjourney", "Seedream және Meta AI",
  "Flow", "Kling AI", "VeoSeeBot", "Syntx AI", "Вау-эффект видеолар",
  "AI мультфильм және сериал", "Бизнеске жарнама видео", "Suno: ЖИ ән және дыбыстау",
  "Монтаж және ЖИ шақырту", "TikTok, Instagram: монетизация",
];

function cfg(env) {
  return {
    token: env.BOT_TOKEN || "",
    admin: env.ADMIN_CHAT_ID || "",
    course: env.COURSE_CHAT_ID || "",
    phone: env.KASPI_PHONE || "8 705 184 15 56",
    name: env.KASPI_NAME || "Аякоз А.",
    price: env.PRICE || "3 990 ₸",
    old: env.OLD_PRICE || "10 000 ₸",
    manager: env.MANAGER || "@Damesh2001",
    site: env.SITE_URL || "",
    insta: "https://instagram.com/damesh_tauassarova",
  };
}

async function tg(c, method, data) {
  const r = await fetch(`https://api.telegram.org/bot${c.token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

const btn = (text, data) => ({ text, callback_data: data });
const link = (text, url) => ({ text, url });

function send(c, chat_id, text, kb) {
  const d = { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true };
  if (kb) d.reply_markup = { inline_keyboard: kb };
  return tg(c, "sendMessage", d);
}

const mainMenu = (c) => [
  [btn("📚 Курс бағдарламасы", "program")],
  [btn("🎬 Менің жұмыстарым", "works")],
  [btn(`💰 Курсты сатып алу — ${c.price}`, "buy")],
  [btn("❓ Жиі қойылатын сұрақтар", "faq")],
  [btn("👩‍💻 Менеджерге жазу", "manager")],
];
const backBuy = (c) => [[btn(`💰 Курсты сатып алу — ${c.price}`, "buy")], [btn("⬅️ Мәзірге оралу", "menu")]];

const payKb = () => [[btn("✅ Төледім", "paid")]];
const startText = (c) =>
  "Сәлеметсіз бе! 👋\n\n🎬 <b>«Claude арқылы видео монтаж» курсы</b> — телефонмен, ноутбуксыз. Сабақтар мәңгі сізде.\n\n" +
  `💰 Бүгінгі баға: <s>${c.old}</s> <b>${c.price}</b>\n\n` +
  `💳 <b>Kaspi аударым:</b>\nНөмір: <code>${c.phone}</code>\nАлушы: ${c.name}\nСома: ${c.price}\n\n` +
  "Төлеген соң «✅ Төледім» батырмасын басып, чектің скриншотын жіберіңіз 👇";

const welcome = (c) =>
  "Сәлеметсіз бе! 👋 Мен — <b>Дамеш Тауасарова</b>, жасанды интеллект маманы.\n\n" +
  "🎬 <b>«Жасанды интеллект курсы»</b> — телефонмен-ақ кино деңгейіндегі видео, AI мульт, нейрофото және контент жасауды үйренесіз.\n\n" +
  "✅ 16 практикалық сабақ\n✅ Шексіз доступ\n✅ Нөлден, қадам-қадаммен\n\n" +
  `💰 Бүгінгі баға: <s>${c.old}</s> <b>${c.price}</b>\n\nТөмендегі бөлімді таңдаңыз 👇`;

const program = () =>
  "📚 <b>Курс бағдарламасы — 16 сабақ</b>\n\n" +
  LESSONS.map((l, i) => `${i + 1}. ${l}`).join("\n") +
  "\n\n🎁 <b>Сыйлықтар:</b> тапсырыс алу шаблоны, 30 дайын видео промпт, промпт-каналдар";

const FAQ =
  "❓ <b>Жиі қойылатын сұрақтар</b>\n\n" +
  "<b>Мен нөлденмін, үлгеремін бе?</b>\nИә. Курс нөлден бастайтындарға арналған, бәрі қадам-қадаммен.\n\n" +
  "<b>Компьютер керек пе?</b>\nЖоқ, телефонның өзі жеткілікті.\n\n" +
  "<b>Сатып алған соң не болады?</b>\nТөлеп, чекті жібересіз. Тексерілген соң курс тобына сілтеме келеді.\n\n" +
  "<b>Сабақтарды қашанға дейін көремін?</b>\nШексіз. Кез келген уақытта қайта көре аласыз.\n\n" +
  "<b>AI құралдары ақылы ма?</b>\nТегін нұсқаларын тиімді қолдануды үйретемін.";

const buyText = (c) =>
  `💰 <b>«Claude арқылы видео монтаж»</b>\nБаға: <s>${c.old}</s> <b>${c.price}</b>\n\n` +
  `💳 <b>Kaspi аударым:</b>\nНөмір: <code>${c.phone}</code>\nАлушы: ${c.name}\nСома: ${c.price}\n\n` +
  "Төлеген соң «✅ Төледім» батырмасын басып, чектің скриншотын жіберіңіз.";

async function sendBonus() {}

async function onCallback(c, cq) {
  const data = cq.data || "";
  const chat = cq.message.chat.id;
  await tg(c, "answerCallbackQuery", { callback_query_id: cq.id });

  if (data === "menu" || data === "buy") return send(c, chat, startText(c), payKb());
  if (data === "program") return send(c, chat, program(), backBuy(c));
  if (data === "faq") return send(c, chat, FAQ, backBuy(c));
  if (data === "manager") return send(c, chat, `👩‍💻 Сұрағыңыз болса, жазыңыз: ${c.manager}`, [[btn("⬅️ Мәзірге оралу", "menu")]]);
  if (data === "works") {
    const kb = [];
    if (c.site) kb.push([link("🎬 Жұмыстарымды көру", c.site)]);
    kb.push([link("📸 Instagram", c.insta)], ...backBuy(c));
    return send(c, chat, "🎬 <b>Менің AI жұмыстарым</b>\n\nВидеоларды жасанды интеллектпен өзім жасадым. Курста дәл осылай жасауды үйренесіз 👇", kb);
  }
  if (data === "buy") return send(c, chat, buyText(c), [[btn("✅ Төледім", "paid")], [btn("⬅️ Мәзірге оралу", "menu")]]);
  if (data === "paid") return send(c, chat, "📎 Чектің <b>скриншотын</b> осында жіберіңіз (фото немесе файл).");

  if (data.startsWith("ok:") || data.startsWith("no:")) {
    const [action, uidStr] = data.split(":");
    const uid = Number(uidStr);
    const who = cq.from.first_name || "Әкімші";
    const m = cq.message;
    let status;
    if (action === "ok") {
      const inv = await tg(c, "createChatInviteLink", { chat_id: c.course, member_limit: 1, name: `client ${uid}` });
      if (!inv.ok) {
        return send(c, m.chat.id, `⚠️ Сілтеме жасалмады. Бот курс тобында әкімші ме? Қате: ${inv.description || ""}`);
      }
      await send(c, uid,
        "🎉 <b>Төлеміңіз расталды! Курсқа қош келдіңіз!</b>\n\n📚 Сабақтарға кіру (сілтеме тек сізге, бір рет қана жұмыс істейді):",
        [[link("📚 Курс тобына кіру", inv.result.invite_link)]]);
      await sendBonus(c, uid);
      status = `✅ Расталды (${who}). Сілтеме жіберілді.`;
    } else {
      await send(c, uid, `❌ Өкінішке қарай, төлеміңіз табылмады.\nҚате болса, менеджерге жазыңыз: ${c.manager}`, [[btn("💰 Қайта төлеу", "buy")]]);
      status = `❌ Бас тартылды (${who}).`;
    }
    return tg(c, "editMessageText", { chat_id: m.chat.id, message_id: m.message_id, text: (m.text || "") + "\n\n" + status });
  }
}

async function onMessage(c, msg) {
  const chat = msg.chat;
  const text = msg.text || "";
  if (text.startsWith("/id")) return send(c, chat.id, `Бұл чаттың ID-і: <code>${chat.id}</code>`);
  if (chat.type !== "private") return;
  const fwd = (msg.forward_origin && msg.forward_origin.chat) || msg.forward_from_chat;
  if (fwd) return send(c, chat.id, `«${fwd.title || ""}» ID-і: <code>${fwd.id}</code>`);

  if (text.startsWith("/start")) return send(c, chat.id, startText(c), payKb());

  if (msg.photo || msg.document) {
    const u = msg.from;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
    const uname = u.username ? "@" + u.username : "username жоқ";
    const copy = await tg(c, "copyMessage", { chat_id: c.admin, from_chat_id: chat.id, message_id: msg.message_id });
    const d = {
      chat_id: c.admin,
      text: `🧾 Жаңа чек\nКлиент: ${name} (${uname})\nID: ${u.id}\nСома: ${c.price}\n\nKaspi-ден ақша түскенін тексеріңіз 👇`,
      reply_markup: { inline_keyboard: [[btn("✅ Растау", `ok:${u.id}`), btn("❌ Бас тарту", `no:${u.id}`)]] },
    };
    if (copy.ok) d.reply_to_message_id = copy.result.message_id;
    await tg(c, "sendMessage", d);
    return send(c, chat.id, "✅ Чегіңіз қабылданды! Төлем тексерілген соң курс сілтемесі осында келеді ⏳");
  }
  return send(c, chat.id, startText(c), payKb());
}

async function secretOf(token) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 48);
}

export default {
  async fetch(request, env) {
    const c = cfg(env);
    const url = new URL(request.url);
    if (!c.token) return new Response("BOT_TOKEN қойылмаған. Settings → Variables and Secrets бөліміне қосыңыз.", { status: 500 });
    const secret = await secretOf(c.token);

    if (url.pathname === "/setup") {
      const r = await tg(c, "setWebhook", {
        url: `${url.origin}/webhook`,
        secret_token: secret,
        allowed_updates: ["message", "callback_query", "channel_post"],
      });
      const me = await tg(c, "getMe", {});
      const ok = r.ok ? "✅ Бот қосылды!" : "❌ Қате: " + (r.description || "");
      return new Response(`${ok}\nБот: @${me.result ? me.result.username : "?"}`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (url.pathname === "/webhook" && request.method === "POST") {
      if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== secret) return new Response("forbidden", { status: 403 });
      const upd = await request.json();
      try {
        if (upd.callback_query) await onCallback(c, upd.callback_query);
        else if (upd.message) await onMessage(c, upd.message);
        else if (upd.channel_post && (upd.channel_post.text || "").startsWith("/id")) await send(c, upd.channel_post.chat.id, `Бұл каналдың ID-і: <code>${upd.channel_post.chat.id}</code>`);
      } catch (e) {
        console.log("Қате:", e && e.stack);
      }
      return new Response("ok");
    }
    return new Response("Claude курсы боты жұмыс істеп тұр ✅", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  },
};
