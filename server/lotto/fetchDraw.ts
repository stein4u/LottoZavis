import type { LottoDraw } from "./types.js";

const DHLOTTERY_HEADERS = {
  "X-Requested-With": "XMLHttpRequest",
  Referer: "https://www.dhlottery.co.kr/common.do?method=main",
  "User-Agent": "Mozilla/5.0 (compatible; LottoZavis/1.0)",
};

function normalizeDate(raw: string): string {
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

function parsePrimaryItem(item: Record<string, number | string>): LottoDraw | null {
  const round = Number(item.ltEpsd);
  const numbers = [
    Number(item.tm1WnNo),
    Number(item.tm2WnNo),
    Number(item.tm3WnNo),
    Number(item.tm4WnNo),
    Number(item.tm5WnNo),
    Number(item.tm6WnNo),
  ].sort((a, b) => a - b);
  const bonus = Number(item.bnsWnNo);
  const date = normalizeDate(String(item.ltRflYmd ?? ""));

  if (!round || numbers.some((n) => n < 1 || n > 45) || bonus < 1 || bonus > 45) {
    return null;
  }

  return { round, date, numbers, bonus };
}

async function fetchDrawPrimary(round: number): Promise<LottoDraw | null> {
  const url = `https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd=${round}`;
  const res = await fetch(url, { headers: DHLOTTERY_HEADERS });
  if (!res.ok) return null;

  const json = (await res.json()) as { data?: { list?: Record<string, number | string>[] } };
  const item = json?.data?.list?.[0];
  if (!item) return null;

  return parsePrimaryItem(item);
}

async function fetchDrawLegacy(round: number): Promise<LottoDraw | null> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
  const res = await fetch(url, { headers: DHLOTTERY_HEADERS });
  if (!res.ok) return null;

  const text = await res.text();
  if (!text.startsWith("{")) return null;

  const data = JSON.parse(text) as {
    returnValue?: string;
    drwNo?: number;
    drwNoDate?: string;
    drwtNo1?: number;
    drwtNo2?: number;
    drwtNo3?: number;
    drwtNo4?: number;
    drwtNo5?: number;
    drwtNo6?: number;
    bnusNo?: number;
  };

  if (data.returnValue !== "success" || !data.drwNo) return null;

  const numbers = [
    data.drwtNo1!,
    data.drwtNo2!,
    data.drwtNo3!,
    data.drwtNo4!,
    data.drwtNo5!,
    data.drwtNo6!,
  ].sort((a, b) => a - b);

  return {
    round: data.drwNo,
    date: normalizeDate(data.drwNoDate ?? ""),
    numbers,
    bonus: data.bnusNo!,
  };
}

export async function fetchDraw(round: number): Promise<LottoDraw | null> {
  const primary = await fetchDrawPrimary(round);
  if (primary) return primary;
  return fetchDrawLegacy(round);
}

export async function findLatestRound(): Promise<number> {
  let lo = 1;
  let hi = 1500;
  let latest = 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const draw = await fetchDrawPrimary(mid);
    if (draw) {
      latest = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
    await delay(50);
  }

  return latest;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
