import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roleTranslate(org_role: string) {
  switch (org_role) {
    case "modir_kol": {
      return "مدیر کل";
    }
    case "modir_arshad": {
      return "مدیر ارشد";
    }
    case "modir": {
      return "مدیر";
    }
    case "karmand": {
      return "کارمند";
    }
    case "bazras": {
      return "بازرس";
    }
    case "name_resan": {
      return "نامه رسان";
    }
    case "herasat": {
      return "حراست";
    }
    case "negahban": {
      return "نگهبان";
    }
    default: {
      return "بدون نقش";
    }
  }
}
