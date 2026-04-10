import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  footerContactChannels,
  infoPageContent,
} from "../../ultils/sitePages";

const StaticPage = () => {
  const { slug } = useParams();
  const page = infoPageContent[slug];

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <section className="surface-card overflow-hidden rounded-[32px]">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:px-8 lg:py-10">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
              {page.eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 lg:text-[2.6rem]">
                {page.title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                {page.description}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {page.highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-amber-100 bg-amber-50/80 px-4 py-4 text-sm font-medium leading-7 text-amber-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Liên hệ nhanh
            </p>
            <div className="mt-4 space-y-3">
              {footerContactChannels.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {page.sections.map((section) => (
          <article
            key={section.heading}
            className="surface-card rounded-[28px] px-6 py-6 lg:px-7"
          >
            <h2 className="text-2xl font-bold text-slate-900">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-8 text-slate-600 lg:text-[15px]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="surface-card rounded-[30px] px-6 py-6 text-center lg:px-8 lg:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Điều hướng nhanh
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          Quay lại khu vực tìm phòng hoặc xem danh sách tin mới nhất
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Về trang chủ
          </Link>
          <Link
            to="/tim-kiem?provinceCode=TPHCM"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
          >
            Xem tin nổi bật
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StaticPage;
