import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // HEALTH CHECK
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // DAILY EPG SCRAPER FOR VTV CHANNELS
  app.get("/api/epg", async (req, res) => {
    try {
      const channelName = (req.query.channel as string || "VTV1").toUpperCase();
      const dateStr = req.query.date as string; // DD/MM/YYYY
      
      // Map VTV channel names to VTV's 'g' group IDs for EPG
      let gId = "1";
      if (channelName.includes("VTV2")) gId = "2";
      else if (channelName.includes("VTV3")) gId = "3";
      else if (channelName.includes("VTV4")) gId = "4";
      else if (channelName.includes("VTV5")) gId = "5";
      else if (channelName.includes("VTV7")) gId = "7";
      else if (channelName.includes("VTV8")) gId = "8";
      else if (channelName.includes("VTV9")) gId = "9";
      else if (channelName.includes("CẦN THƠ") || channelName.includes("CAN THO") || channelName.includes("VTV6") || channelName.includes("THỂ THAO")) {
        gId = "3"; // Map to 3 as sports/vtv3 group fallback for secondary channels
      }
      
      // If dateStr is not provided, use today's date in Vietnam timezone (GMT+7)
      let targetDate = dateStr;
      if (!targetDate) {
        const vnDate = new Date(Date.now() + 7 * 60 * 60 * 1000);
        const dd = String(vnDate.getUTCDate()).padStart(2, "0");
        const mm = String(vnDate.getUTCMonth() + 1).padStart(2, "0");
        const yyyy = vnDate.getUTCFullYear();
        targetDate = `${dd}/${mm}/${yyyy}`;
      }
      
      // Fetch vtv.vn EPG page
      const url = `https://vtv.vn/lich-phat-song.htm?ngay=${encodeURIComponent(targetDate)}&g=${gId}`;
      console.log(`Fetching EPG of ${channelName} (g=${gId}) for date ${targetDate}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from VTV: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Parse EPG list from html
      const schedules: { time: string; title: string }[] = [];
      
      // VTV schedule list items:
      // <li class="chuongtrinh">
      // <span class="thoigian">00:15</span>
      // <span class="title_program">Chương trình...</span>
      const regexLI = /<li[^>]*>[\s\S]*?<span class="thoigian">(\d{2}:\d{2})<\/span>[\s\S]*?<span class="title_program">([\s\S]*?)<\/span>[\s\S]*?<\/li>/gi;
      
      let match;
      while ((match = regexLI.exec(html)) !== null) {
        const time = match[1].trim();
        let title = match[2].replace(/<[^>]*>/g, "").trim(); 
        title = title
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ");
        
        schedules.push({ time, title });
      }
      
      // Fallback search that captures any span class="thoigian" and span class="title_program" directly
      if (schedules.length === 0) {
        const regexFallback = /<span class="thoigian">(\d{2}:\d{2})<\/span>[\s\S]*?<span class="title_program">([\s\S]*?)<\/span>/gi;
        let fbMatch;
        while ((fbMatch = regexFallback.exec(html)) !== null) {
          const time = fbMatch[1].trim();
          let title = fbMatch[2].replace(/<[^>]*>/g, "").trim();
          title = title
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ");
          
          if (!schedules.some(item => item.time === time && item.title === title)) {
            schedules.push({ time, title });
          }
        }
      }
      
      // Fallback in case of temporary network block or scraping layout change
      if (schedules.length === 0) {
        const hours = [
          "00:00", "01:30", "03:00", "05:00", "06:00", "07:30", "08:15", "09:30",
          "11:00", "12:00", "13:00", "14:15", "16:00", "17:30", "19:00", "20:15", "21:30", "22:30", "23:15"
        ];
        
        const showLists: Record<string, string[]> = {
          "VTV1": [
            "Thời sự Thể thao đêm", "Phim tài liệu Việt Nam", "Vườn văn nghệ", "Chào buổi sáng thời sự", "Bản tin Tài chính Kinh doanh sáng",
            "Thời sự Việt Nam 12h", "Phim truyện truyền hình", "Con đường di sản", "Bản tin Thời tiết Việt Nam & Quốc tế",
            "Bản tin Thời sự 19h (Quốc gia)", "Bản tin Sáng tạo Việt", "Đối thoại hôm nay", "Phim truyện đặc sắc đêm muộn"
          ],
          "VTV3": [
            "Phim hài sitcom sáng", "Hành trình văn hóa Việt", "Bún chả tối muộn", "Cafe sáng cùng VTV3", "Kịch ngắn trọn niềm vui",
            "Đường lên đỉnh Olympia", "Vui khỏe có ích buổi sáng", "Sức khỏe là vàng",
            "Trò chơi âm nhạc Việt", "Phim truyền hình Việt Nam giờ vàng", "Khám phá phong cảnh Việt"
          ],
          "VTV6": [
            "Nhịp đập 360 độ bóng lăn", "Góc nhìn thể thao Việt", "Trực tiếp: Giải Bóng đá V-League", "Thời báo thể thao",
            "Đồng hành cùng Vplay", "Tạp chí thể thao thế giới", "Các trận đấu lịch sử VTV6", "Phóng sự câu lạc bộ bóng đá",
            "Tin tức chuyển nhượng", "Cơ hội cho vận động viên trẻ", "Phóng sự đặc sắc"
          ],
          "default": [
            "Bản tin Tổng hợp", "Tạp chí truyền hình sắc màu", "Kiến thức cộng đồng", "Phim truyện nước ngoài", "Chương trình âm nhạc",
            "Thế giới hoang dã quanh ta", "Tin tức quốc tế", "Khám phá khoa học công nghệ", "Tạp chí phong cách sống thời đại"
          ]
        };
        
        let key = "default";
        if (channelName.includes("VTV1")) key = "VTV1";
        else if (channelName.includes("VTV3")) key = "VTV3";
        else if (channelName.includes("VTV6")) key = "VTV6";
        
        const list = showLists[key] || showLists["default"];
        for (let i = 0; i < hours.length; i++) {
          schedules.push({
            time: hours[i],
            title: list[i % list.length]
          });
        }
      }
      
      schedules.sort((a, b) => a.time.localeCompare(b.time));
      
      res.json({
        channel: channelName,
        date: targetDate,
        schedules
      });
    } catch (err: any) {
      console.error("EPG parser failed", err);
      res.status(500).json({ error: err.message });
    }
  });

  // CORS PROXY FOR HLS
  app.use("/proxy", (req, res, next) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send("No URL provided");

    const urlObj = new URL(targetUrl);
    const proxy = createProxyMiddleware({
      target: urlObj.origin,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const actualTarget = url.searchParams.get('url');
        if (actualTarget) {
          const targetPath = new URL(actualTarget).pathname + new URL(actualTarget).search;
          return targetPath;
        }
        return path;
      },
      on: {
        proxyRes: (proxyRes) => {
          proxyRes.headers["access-control-allow-origin"] = "*";
          proxyRes.headers["access-control-allow-methods"] = "GET, POST, OPTIONS";
          proxyRes.headers["access-control-allow-headers"] = "Content-Type, Authorization";
        },
      },
    });

    return proxy(req, res, next);
  });

  // Proxy removed - not needed since we moved to imported static assets.

  // VITE MIDDLEWARE
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
