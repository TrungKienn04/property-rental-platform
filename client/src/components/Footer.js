import React from "react";
import { Link } from "react-router-dom";
import {
  footerCategoryLinks,
  footerContactChannels,
  footerLinkGroups,
  footerPayments,
} from "../ultils/sitePages";

import visaLogo from "../assets/logo-visa.png";
import mastercardLogo from "../assets/mastercard.jpg";
import jcbLogo from "../assets/jcb.jpg";
import momoLogo from "../assets/momo.webp";
import zalopayLogo from "../assets/zalo_pay.png";
import shopeePayLogo from "../assets/shopee_pay.png";

import iconFb from "../assets/icon-facebook.svg";
import iconYoutube from "../assets/icon-youtube.svg";
import iconTwitter from "../assets/icon-twitter.svg";
import iconTiktok from "../assets/icon-tiktok.svg";
import iconZalo from "../assets/icon-zalo.svg";

const Footer = () => {
  const paymentLogos = {
    VISA: visaLogo,
    Mastercard: mastercardLogo,
    JCB: jcbLogo,
    MoMo: momoLogo,
    ZaloPay: zalopayLogo,
    "Chuyển khoản": shopeePayLogo,
  };

  return (
    <footer className="w-screen bg-[#f3dba6] py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Phongtro123.com
                </p>
                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  Một footer đủ thông tin, rõ ràng và trực quan
                </h3>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
                  Toàn bộ đường dẫn, bộ lọc và kênh hỗ trợ được bố trí rõ ràng
                  để người dùng tìm và quản lý tin nhanh hơn.
                </p>
              </div>

              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {footerLinkGroups.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                      {group.title}
                    </h4>
                    <div className="grid gap-1">
                      {group.links.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="inline-block text-sm text-slate-800 hover:text-amber-700 transition"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                  Danh mục truy cập nhanh
                </h4>
                <div className="mt-3 flex flex-wrap gap-3">
                  {footerCategoryLinks.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-slate-800 hover:bg-white/20 hover:text-amber-700 transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="flex flex-col items-start gap-6">
            <div className="w-full rounded-[18px] bg-slate-900 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                Hỗ trợ nhanh
              </p>
              <h4 className="mt-3 text-lg font-bold">Cần hỗ trợ?</h4>
              <div className="mt-4 space-y-3">
                {footerContactChannels.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block rounded-md bg-white/6 px-4 py-3 hover:bg-white/10"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{item.value}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="w-full rounded-[18px] border border-slate-200 bg-white p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                Phương thức thanh toán
              </h4>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {footerPayments.map((key) => (
                  <div key={key} className="flex items-center">
                    <img
                      src={paymentLogos[key]}
                      alt={key}
                      title={key}
                      className="h-9 w-auto object-contain rounded-md bg-white p-1 shadow-sm hover:scale-105 transition"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/80x28?text=" +
                          encodeURIComponent(key);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                Theo dõi Phongtro123.com
              </h4>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  aria-label="facebook"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={iconFb}
                    alt="facebook"
                    className="h-8 w-8 rounded-full bg-white p-1 shadow-sm hover:scale-105 transition"
                  />
                </a>
                <a
                  href="https://youtube.com"
                  aria-label="youtube"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={iconYoutube}
                    alt="youtube"
                    className="h-8 w-8 rounded-full bg-white p-1 shadow-sm hover:scale-105 transition"
                  />
                </a>
                <a
                  href="https://zalo.me"
                  aria-label="zalo"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={iconZalo}
                    alt="zalo"
                    className="h-8 w-8 rounded-full bg-white p-1 shadow-sm hover:scale-105 transition"
                  />
                </a>
                <a
                  href="https://twitter.com"
                  aria-label="twitter"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={iconTwitter}
                    alt="twitter"
                    className="h-8 w-8 rounded-full bg-white p-1 shadow-sm hover:scale-105 transition"
                  />
                </a>
                <a
                  href="https://www.tiktok.com"
                  aria-label="tiktok"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={iconTiktok}
                    alt="tiktok"
                    className="h-8 w-8 rounded-full bg-white p-1 shadow-sm hover:scale-105 transition"
                  />
                </a>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12 border-t border-white/40 pt-6 text-sm text-slate-800">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <p>
              Công ty TNHH LBKCORP. Phòng 3.04, The Sun Avenue, 28 Mai Chí Thọ,
              Phường An Phú, Thành phố Thủ Đức, Thành phố Hồ Chí Minh.
            </p>
            <p className="font-medium text-slate-800">
              © {new Date().getFullYear()} Phongtro123.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
