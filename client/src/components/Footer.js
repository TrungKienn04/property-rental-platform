import React from "react";
import { Link } from "react-router-dom";
import { footerLinkGroups, footerPayments } from "../ultils/sitePages";

import visaLogo from "../assets/logo-visa.png";
import mastercardLogo from "../assets/mastercard.jpg";
import jcbLogo from "../assets/jcb.jpg";
import momoLogo from "../assets/momo.webp";
import zalopayLogo from "../assets/zalo_pay.png";
import shopeePayLogo from "../assets/shopee_pay.png";
import iconZalo from "../assets/icon_zalo.png";

const Footer = () => {
  const paymentLogos = {
    VISA: visaLogo,
    Mastercard: mastercardLogo,
    JCB: jcbLogo,
    MoMo: momoLogo,
    ZaloPay: zalopayLogo,
    "Chuyển khoản": shopeePayLogo,
  };

  const paymentLinks = {
    VISA: "https://www.visa.com",
    Mastercard: "https://www.mastercard.com",
    JCB: "https://www.jcb.co.jp/en/",
    MoMo: "https://momo.vn",
    ZaloPay: "https://zalopay.vn",
    "Chuyển khoản": "https://shopee.vn",
  };

  return (
    <footer className="w-screen bg-[#f3dba6] py-12">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-800">
              VỀ PHONGTRO123.COM
            </h4>
            <ul className="mt-4 space-y-2 text-slate-800 text-sm">
              {footerLinkGroups[0].links.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="hover:text-amber-700 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-800">
              DÀNH CHO KHÁCH HÀNG
            </h4>
            <ul className="mt-4 space-y-2 text-slate-800 text-sm">
              {footerLinkGroups[1].links.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="hover:text-amber-700 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Payments */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-800">
              PHƯƠNG THỨC THANH TOÁN
            </h4>
            <div className="mt-4 grid grid-cols-3 gap-3 items-center">
              {footerPayments.map((key) => (
                <div key={key} className="flex items-center justify-center">
                  <a
                    href={paymentLinks[key] || "#"}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${key} - mở trang mới`}
                    className="flex items-center justify-center"
                  >
                    <img
                      src={paymentLogos[key]}
                      alt={key}
                      title={key}
                      style={{ width: 96, height: 36, objectFit: "contain" }}
                      className="bg-white p-1 rounded-md shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/96x36?text=" +
                          encodeURIComponent(key);
                      }}
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4 - Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-800">
              THEO DÕI PHONGTRO123.COM
            </h4>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://facebook.com"
                aria-label="facebook"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm"
              >
                <i
                  className="fa-brands fa-facebook text-2xl"
                  style={{ color: "#1877F2" }}
                ></i>
              </a>

              <a
                href="https://youtube.com"
                aria-label="youtube"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm"
              >
                <i
                  className="fa-brands fa-youtube text-2xl"
                  style={{ color: "#FF0000" }}
                ></i>
              </a>

              <a
                href="https://zalo.me"
                aria-label="zalo"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm"
              >
                <img
                  src={iconZalo}
                  alt="zalo"
                  className="h-7 w-7 object-contain"
                />
              </a>

              <a
                href="https://twitter.com"
                aria-label="twitter"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm"
              >
                <i
                  className="fa-brands fa-twitter text-2xl"
                  style={{ color: "#1DA1F2" }}
                ></i>
              </a>

              <a
                href="https://www.tiktok.com"
                aria-label="tiktok"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm"
              >
                <i
                  className="fa-brands fa-tiktok text-2xl"
                  style={{ color: "#000000" }}
                ></i>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-300 pt-6 text-sm text-slate-800 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} Phongtro123.com</p>
          <div className="flex gap-4">
            <Link
              to="/thong-tin/chinh-sach-bao-mat"
              className="hover:underline"
            >
              Chính sách bảo mật
            </Link>
            <Link to="/thong-tin/quy-che-hoat-dong" className="hover:underline">
              Quy chế hoạt động
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
