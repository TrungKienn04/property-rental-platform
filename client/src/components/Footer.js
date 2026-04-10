import React from "react";
import { Link } from "react-router-dom";
import {
  footerCategoryLinks,
  footerContactChannels,
  footerLinkGroups,
  footerPayments,
  footerTrustBadges,
} from "../ultils/sitePages";

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/60 bg-[linear-gradient(180deg,#fffdf9_0%,#fff8ee_40%,#fff1db_100%)] pt-14">
      <div className="mx-auto max-w-[1180px] px-4 lg:px-6">
        <section className="surface-card rounded-[34px] px-6 py-8 lg:px-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Footer Navigation
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900">
                  Một footer đủ thông tin, rõ đường dẫn và sẵn sàng mở rộng
                </h3>
                <p className="max-w-3xl text-base leading-8 text-slate-500">
                  Toàn bộ link bên dưới đều bấm được thật, ưu tiên điều hướng rõ
                  ràng giữa các trang thông tin, danh mục thuê và kênh hỗ trợ.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {footerLinkGroups.map((group) => (
                  <div key={group.title} className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {group.title}
                    </h4>
                    <div className="grid gap-2">
                      {group.links.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="rounded-2xl border border-transparent bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:shadow-sm"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="rounded-[26px] border border-slate-200 bg-white/90 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Danh mục truy cập nhanh
                  </h4>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {footerCategoryLinks.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white/90 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Chuẩn vận hành
                  </h4>
                  <div className="mt-4 flex flex-col gap-2">
                    {footerTrustBadges.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[30px] bg-slate-950 px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Hỗ trợ nhanh
                </p>
                <h4 className="mt-3 text-2xl font-bold">
                  Cần hỗ trợ đăng tin hoặc cần xác minh thông tin?
                </h4>
                <div className="mt-5 space-y-3">
                  {footerContactChannels.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block rounded-[22px] border border-white/10 bg-white/10 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white/14"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold">{item.value}</p>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-white/90 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Phương thức thanh toán
                </h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {footerPayments.map((item) => (
                    <span
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pb-10 pt-8 text-sm text-slate-500">
          <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <p>
              Công ty TNHH LBKCORP. Phòng 3.04, The Sun Avenue, 28 Mai Chí Thọ,
              Phường An Phú, Thành phố Thủ Đức, Thành phố Hồ Chí Minh.
            </p>
            <p className="font-medium text-slate-600">
              © {new Date().getFullYear()} Phongtro123.com. Giao diện sẵn sàng
              product, dễ bảo trì và dễ mở rộng.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
